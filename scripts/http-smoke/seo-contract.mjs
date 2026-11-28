import assert from 'node:assert/strict';

const staticPaths = [
  '/',
  '/cabins',
  '/experiences',
  '/dining',
  '/about',
  '/contact',
];
const disallowedPaths = [
  '/api/',
  '/bookings',
  '/profile',
  '/preferences',
  '/sign-in',
  '/sign-up',
  '/logout',
];
const htmlLimitedBot = 'facebookexternalhit/1.1';

function attributesFor({ html, tag }) {
  return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'gi'))].map(
    ([element]) =>
      Object.fromEntries(
        [...element.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(
          ([, name, doubleQuoted, singleQuoted]) => [
            name.toLowerCase(),
            doubleQuoted ?? singleQuoted,
          ]
        )
      )
  );
}

export async function readPage({
  origin,
  route,
  status = 200,
  userAgent = 'LodgeFlow-SEO-Smoke/1.0',
}) {
  const response = await fetch(`${origin}${route}`, {
    redirect: 'manual',
    headers: { 'user-agent': userAgent },
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(response.status, status, `${route} must return ${status}`);
  assert.match(response.headers.get('content-type') ?? '', /text\/html/i);
  // RSC scripts contain serialized records and URLs even when the visible UI
  // is only a loading shell. They must never satisfy server-content assertions.
  const html = (await response.text())
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '');
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i)?.[1];
  assert.notEqual(
    body,
    undefined,
    `${route} must contain a server-rendered body`
  );
  const links = attributesFor({ html, tag: 'link' });
  const meta = attributesFor({ html, tag: 'meta' });
  return {
    body,
    canonicals: links
      .filter(link =>
        link.rel?.toLowerCase().split(/\s+/).includes('canonical')
      )
      .map(link => link.href),
    openGraphUrls: meta
      .filter(item => item.property?.toLowerCase() === 'og:url')
      .map(item => item.content),
    robots: [
      ...meta
        .filter(item =>
          ['robots', 'googlebot'].includes(item.name?.toLowerCase())
        )
        .map(item => ({
          agent: item.name.toLowerCase(),
          content: item.content ?? '',
        })),
      {
        agent: 'x-robots-tag',
        content: response.headers.get('x-robots-tag') ?? '',
      },
    ],
  };
}

export function assertPublicMetadata({
  page,
  route,
  canonicalPath,
  publicOrigin,
}) {
  const expected = new URL(canonicalPath, publicOrigin).href;
  assert.equal(
    page.canonicals.length,
    1,
    `${route} must have exactly one canonical`
  );
  assert.equal(
    new URL(page.canonicals[0]).href,
    expected,
    `${route} must canonicalize to its own public path`
  );
  assert.equal(
    page.openGraphUrls.length,
    1,
    `${route} must have exactly one og:url`
  );
  assert.equal(
    new URL(page.openGraphUrls[0]).href,
    expected,
    `${route} og:url`
  );
  assert.equal(
    page.robots.some(({ content }) => /\b(?:noindex|none)\b/i.test(content)),
    false,
    `${route} must remain indexable`
  );
}

function assertNoIndex({ page, route }) {
  assert.equal(
    page.canonicals.length,
    0,
    `${route} must not inherit a canonical`
  );
  assert.ok(
    page.robots.some(({ content }) => /\b(?:noindex|none)\b/i.test(content)),
    `${route} must publish noindex in its server response`
  );
}

export function assertCatalogLinks({ page, route, present = [], absent = [] }) {
  const links = attributesFor({ html: page.body, tag: 'a' }).map(
    link => link.href
  );
  for (const href of present) {
    assert.ok(
      links.includes(href),
      `${route} must server-render a link to ${href}`
    );
  }
  for (const href of absent) {
    assert.equal(
      links.includes(href),
      false,
      `${route} must remove the link to ${href}`
    );
  }
}

export function assertCatalogDetail({ page, record }) {
  const text = page.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  for (const value of [record.name, record.description]) {
    assert.ok(
      text.includes(value),
      `${record.section} detail must server-render ${value}`
    );
  }
}

export async function assertNotFound({ origin, route }) {
  // Next can stream a normal browser response before notFound() resolves. An
  // HTML-limited crawler waits for metadata and observes the actual 404 status.
  const page = await readPage({
    origin,
    route,
    status: 404,
    userAgent: htmlLimitedBot,
  });
  assertNoIndex({ page, route });
}

export async function assertSeoContract({
  origin,
  publicOrigin,
  records,
  excludedCatalog,
}) {
  const publicPaths = [
    ...staticPaths,
    ...records.map(record => `/${record.section}/${record.id}`),
  ];
  const pages = new Map();
  for (const canonicalPath of publicPaths) {
    for (const query of ['', '?utm_source=seo-smoke&utm_campaign=canonical']) {
      const route = `${canonicalPath}${query}`;
      const page = await readPage({ origin, route });
      assertPublicMetadata({ page, route, canonicalPath, publicOrigin });
      if (!query) pages.set(canonicalPath, page);
    }
  }
  for (const record of records) {
    const canonicalPath = `/${record.section}/${record.id}`;
    const route = `/${record.section}/${record.id.toUpperCase()}?utm_source=seo-smoke`;
    assert.notEqual(
      record.id.toUpperCase(),
      record.id,
      'uppercase fixture must be distinct'
    );
    assertPublicMetadata({
      page: await readPage({ origin, route }),
      route,
      canonicalPath,
      publicOrigin,
    });
    assertCatalogDetail({ page: pages.get(canonicalPath), record });
    for (const listingRoute of record.listingRoutes) {
      assertCatalogLinks({
        page: pages.get(listingRoute),
        route: listingRoute,
        present: [`${canonicalPath}${record.listingSuffix}`],
      });
    }
    for (const id of ['not-a-valid-id', '000000000000000000000000']) {
      await assertNotFound({ origin, route: `/${record.section}/${id}` });
    }
  }
  await assertNotFound({ origin, route: '/seo-smoke-missing-route' });
  await assertNotFound({ origin, route: excludedCatalog.inactiveCabin });

  const dining = records.find(record => record.section === 'dining');
  const experience = records.find(record => record.section === 'experiences');
  const nonSearchRoutes = [
    '/bookings',
    '/sign-in',
    '/sign-up',
    '/payments/success?booking_id=seo-smoke',
    '/payments/cancel?booking_id=seo-smoke',
    ...records.map(record => `/${record.section}/confirmation/${record.id}`),
    `/dining/${dining.id}/reserve`,
    `/experiences/${experience.id}/book`,
    '/pricing',
    excludedCatalog.unavailableDining,
  ];
  for (const route of nonSearchRoutes) {
    const page = await readPage({ origin, route });
    assertNoIndex({ page, route });
    for (const { agent, content } of page.robots) {
      assert.doesNotMatch(
        content,
        /\bindex\b/i,
        `${route} ${agent} must not contradict noindex`
      );
    }
  }

  const robotsResponse = await fetch(`${origin}/robots.txt`);
  assert.equal(robotsResponse.status, 200, 'robots.txt must load');
  const directives = (await robotsResponse.text())
    .split(/\r?\n/)
    .filter(line => line.trim() && !line.trim().startsWith('#'))
    .map(line => {
      const colon = line.indexOf(':');
      return [
        line.slice(0, colon).trim().toLowerCase(),
        line.slice(colon + 1).trim(),
      ];
    });
  const values = name =>
    directives.filter(([key]) => key === name).map(([, value]) => value);
  assert.deepEqual(values('user-agent'), ['*']);
  assert.deepEqual(values('allow'), ['/']);
  assert.deepEqual(values('disallow').sort(), [...disallowedPaths].sort());
  assert.deepEqual(values('host'), [publicOrigin]);
  assert.deepEqual(values('sitemap'), [`${publicOrigin}/sitemap.xml`]);

  // The sitemap is intentionally revalidated hourly. Check original fixtures
  // before changing the catalog; listing freshness has a separate contract.
  const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
  assert.equal(sitemapResponse.status, 200, 'sitemap.xml must load');
  const locations = [
    ...(await sitemapResponse.text()).matchAll(/<loc>([^<]+)<\/loc>/g),
  ].map(([, value]) => new URL(value).href);
  assert.deepEqual(
    [...locations].sort(),
    publicPaths.map(route => new URL(route, publicOrigin).href).sort(),
    'sitemap must contain only the six public pages and eligible catalog records'
  );
  for (const location of locations) {
    const url = new URL(location);
    assert.equal(url.origin, publicOrigin);
    assert.equal(url.search, '', 'sitemap URLs must not contain query strings');
    assert.ok(
      values('allow').some(allowed => url.pathname.startsWith(allowed))
    );
    assert.equal(
      disallowedPaths.some(blocked => url.pathname.startsWith(blocked)),
      false,
      `${location} must be crawlable under robots.txt`
    );
  }
  for (const route of [...nonSearchRoutes, excludedCatalog.inactiveCabin]) {
    const url = new URL(route, publicOrigin);
    url.search = '';
    assert.equal(
      locations.includes(url.href),
      false,
      `${route} must stay out of the sitemap`
    );
  }
  console.log(
    'PASS rendered public metadata, catalog content, noindex, sitemap and robots contracts'
  );
}
