# Customer indexing: route policy and verification

## Observed defect

The public customer site was audited on November 28, 2026, against repository
commit `7dae57516a83248d644f048b47004a50aa04cb9c` and unauthenticated HTTP
responses. All 41 URLs in the live sitemap finished with HTTP 200. Of those,
26 non-home pages declared the homepage as their canonical and Open Graph URL:

| Route family                          | Sitemap URLs | Canonical before this change |
| ------------------------------------- | -----------: | ---------------------------- |
| `/`                                   |            1 | Homepage, appropriate        |
| `/cabins` and cabin details           |           14 | Correct path                 |
| `/experiences` and experience details |            9 | Homepage, incorrect          |
| `/dining` and dining details          |           15 | Homepage, incorrect          |
| `/about`, `/contact`                  |            2 | Homepage, incorrect          |

The root layout supplied `alternates.canonical: '/'` and `openGraph.url: '/'`.
Next.js inherits metadata fields omitted by child segments. A `/` canonical
does not resolve to the request pathname. Only the cabin routes overrode it.

Dining and experience details initially returned loading screens and fetched
their content from `/api/` after JavaScript ran. Malformed and missing IDs
returned HTTP 200 with the same homepage metadata. Their APIs already returned
404 for these IDs, but a later client API response cannot correct the original
page status. Dining's listing also initially rendered a loading screen.

These observations establish current defects. They do not identify the URL that
triggered a historical Search Console alert. Aggregate category counts, without
URL examples and indexed-crawl details, cannot establish that causal link.

## Route policy

| Routes                                                               | Intended search treatment                          | Implementation                                                    |
| -------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| `/`, `/cabins`, `/experiences`, `/dining`, `/about`, `/contact`      | Public, self-canonical                             | Metadata in each server `page.tsx`                                |
| Active `/cabins/[id]`                                                | Public, self-canonical                             | Existing server reader; canonical uses stored `_id`               |
| `/experiences/[id]`                                                  | Public, self-canonical                             | Cached server reader, metadata, serialized initial client data    |
| Available `/dining/[id]`                                             | Public, self-canonical                             | Same server pattern; availability matches sitemap eligibility     |
| Existing dining records without `isAvailable: true`                  | Viewable, `noindex`, absent from sitemap           | Preserve detail access; omit canonical                            |
| Invalid or missing catalog records, inactive cabins, unmatched paths | Not found, `noindex`, no canonical                 | Server `notFound()`; do not turn database outages into false 404s |
| `/dining/[id]/reserve`, `/experiences/[id]/book`                     | `noindex`, absent from sitemap                     | Server metadata layouts around existing client workflows          |
| `/{cabins,dining,experiences}/confirmation/[id]`                     | `noindex`, absent from sitemap                     | Server metadata layouts                                           |
| `/payments/success`, `/payments/cancel`                              | `noindex`, absent from sitemap                     | Payments server layout                                            |
| `/bookings`, `/sign-in/*`, `/sign-up/*`                              | Account/auth exclusions                            | Existing robots rules plus explicit server `noindex` metadata     |
| `/pricing`                                                           | `noindex`, absent from sitemap while a placeholder | Existing layout owns the metadata                                 |

`/profile`, `/preferences`, `/help`, and `/logout` have no page implementations.
Their names occur in an unused navigation configuration. Do not add them to the
sitemap or invent indexable pages for them during this fix.

The root retains `metadataBase`, shared branding, icons, social defaults, and
Google preview limits. It publishes no page-specific canonical or Open Graph
URL. Explicit root `index` directives are omitted: normal public indexing is
the default, and not-found output should not contain a competing `index` tag.

## Client/server boundary

Next.js supports `metadata` and `generateMetadata` exports only in server
components. Public route modules are therefore server pages; interactive UIs
live in `components/DiningPageClient.tsx`, `DiningDetailClient.tsx`,
`ExperiencesPageClient.tsx`, `ExperienceDetailClient.tsx`, and
`ContactPageClient.tsx`.

The dining/experience server readers use the existing serializers, response
validation schemas and public visibility rules before seeding the client cache.
Request-scoped React caching shares each detail read between
the page and `generateMetadata`. `connection()` keeps catalog lists fresh after
deployment. Each client hook receives typed `initialData` under its existing
query key and retains its existing refetch and validation behavior. No server
page makes a network request to its own API.

Canonical paths come from the serialized record `_id`, so uppercase hexadecimal
URL aliases point to the same lowercase identity as the sitemap. Metadata does
not copy tracking or booking query strings into canonical URLs.

Public identity lives at **page leaves**, not listing layouts. A dining layout
with a `/dining` canonical would otherwise leak it into reserve and confirmation
screens. Noindex layouts publish only their exclusion policy. Next.js merges
nested metadata objects shallowly; `createPageMetadata()` supplies a complete
Open Graph object rather than relying on partial deep merging.

Contact now has server metadata, but its settings-dependent body still loads on
the client. This patch does not claim that all contact content is server-rendered.

## Robots exclusions

The existing wildcard-agent rules are preserved:

```text
Allow: /
Disallow: /api/
Disallow: /bookings
Disallow: /profile
Disallow: /preferences
Disallow: /sign-in
Disallow: /sign-up
Disallow: /logout
```

None of the 41 audited sitemap URLs matched a disallow rule. Account and API
exclusions are consistent with their intended purpose. Public catalog content
is now supplied in server HTML, so those pages no longer require crawler access
to `/api/` to display their catalog records. API authorization remains separate
and unchanged: robots directives are not an access-control mechanism.

Robots blocking controls crawling, not guaranteed removal from search. A crawler
blocked from `/bookings` or sign-in pages cannot read their new `noindex` tags.
Those tags document intent and apply to agents that can fetch the pages; they
are not a promise that Google will observe them under the existing crawl block.
If an already indexed account URL needs removal, review its actual URL-level
evidence and choose an explicit crawl/noindex policy. Do not blanket-unblock APIs.

The new booking, reserve, confirmation and payment `noindex` pages remain
crawlable so crawlers can observe their directive. They are not included in the
sitemap. An intentional exclusion need not disappear from Search Console's
excluded-page report.

## Required deployment alignment

Every audited apex URL redirected with HTTP **307** to the same path on
`https://www.lodgeflow.app`, while canonicals, sitemap URLs, robots references,
and JSON-LD used `https://lodgeflow.app`. A 307 is temporary; do not describe it
as Google's strong signal to make the destination canonical.

Choose one preferred host and make all signals agree. Given the currently
served destination, the concrete deployment option is:

1. Serve the customer site at `https://www.lodgeflow.app` with HTTP 200.
2. Set the customer deployment's `NEXT_PUBLIC_APP_URL` to
   `https://www.lodgeflow.app` and rebuild/redeploy. This variable is read at
   build time for client code and static metadata.
3. Configure the alternate apex host to redirect permanently, with 301 or 308,
   preserving path and query. Verify there is no reverse redirect or loop.
4. Confirm canonical, `og:url`, sitemap, robots sitemap reference and JSON-LD all
   use the chosen host. Every canonical target should return 200 directly.

If the apex host is preferred instead, serve it directly and permanently
redirect www to apex; retain the apex origin configuration. Do not add a
contradictory Next.js redirect on top of hosting redirects.

This PR preserves `getCustomerOrigin()` and the validated
`NEXT_PUBLIC_APP_URL` contract, including local/preview overrides and retained
Stripe quote URL spelling. Deployment-origin changes also affect new checkout
return URLs, so verify a development checkout return after changing that
configuration. This change does not edit hosting settings or existing checkout
sessions.

## Regression commands and acceptance

From the repository root, using the Node and pnpm versions pinned by CI:

```sh
pnpm --filter @lodgeflow/customer exec jest --runInBand
pnpm --filter @lodgeflow/customer exec tsc --noEmit
pnpm --filter @lodgeflow/customer exec eslint .
pnpm --filter @lodgeflow/database exec tsx ../../scripts/http-smoke/catalog-freshness.mjs
pnpm test:http
```

`catalog-freshness.mjs` builds and starts one isolated production customer app
with disposable MongoDB records and throwaway Clerk configuration. It checks
the rendered metadata and content, not source-code strings:

- Each public static route and catalog fixture emits exactly one canonical,
  with the expected origin/path and matching `og:url`, without `noindex`.
- Tracking-query variants and uppercase ID aliases resolve to the clean,
  lowercase canonical. Public detail names/descriptions and listing links
  appear in server HTML after scripts are removed from the assertion input.
- Invalid/deleted records and unmatched routes have no canonical and emit
  `noindex`. An HTML-limited crawler observes the 404 before streaming starts.
- Transaction/account/placeholder routes publish `noindex` and no inherited
  canonical. Inactive cabins and unavailable dining remain outside the sitemap.
- The sitemap contains only the expected public fixture URLs, and all are
  allowed by the preserved robots rules.
- Replacing catalog records after the build updates public listing links and
  retires removed detail routes. The sitemap retains its existing hourly
  revalidation policy; this test does not pretend it updates immediately.

Focused unit tests cover invalid-ID rejection before database access, serializer
output, catalog visibility/order, missing records, error propagation, and
immediate initial query data without a browser API request. Existing UI tests
continue covering catalog grouping, reservation links, sparse legacy arrays,
and gallery handling against the extracted client components.

For dynamic metadata, inspect the complete HTML response: Next.js may stream
metadata after the initial head for normal browser user agents. Also check a
supported HTML-limited crawler to verify initial-head output. Do not disable
streaming globally just to simplify tests.

## Search Console follow-up after deployment

1. Export the example URL lists for the duplicate-canonical and robots-blocked
   categories. The category totals alone do not identify the affected routes.
2. For each actual example, record last crawl date, indexed user-declared
   canonical, Google-selected canonical, crawl permission and index permission.
3. Use the live test to inspect the deployed HTML and rendered content. The live
   test does not predict Google's selected canonical; that field belongs to the
   indexed result.
4. Resubmit the sitemap at the chosen host and request indexing for representative
   public pages after their live checks pass. Allow recrawling and report lag.
5. Validate unintended problems after fixing their actual URLs. Keep expected
   account/API exclusions, redirect sources and genuine alternate URLs excluded.

Google treats canonical tags and sitemaps as signals, not an indexing guarantee.
Do not declare recovery until the relevant URLs have been recrawled and their
indexed results have been checked.

## References

- [Next.js metadata, inheritance and server-component requirements](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google redirect semantics](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- [Google noindex and robots interaction](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Google JavaScript SEO and server rendering](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Search Console indexing reason definitions](https://support.google.com/webmasters/answer/7440203)
- [URL Inspection indexed and live results](https://support.google.com/webmasters/answer/9012289)
