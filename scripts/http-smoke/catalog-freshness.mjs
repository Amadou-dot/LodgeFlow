import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { cp, mkdir, mkdtemp, rm, symlink } from 'node:fs/promises';
import { createServer } from 'node:net';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { createClerkFixture } from './clerk-fixture.mjs';
import {
  assertCatalogDetail,
  assertCatalogLinks,
  assertNotFound,
  assertPublicMetadata,
  assertSeoContract,
  readPage,
} from './seo-contract.mjs';

// Production rendering matters here: next dev does not expose stale prerenders.
// Never load app env files or connect to an inherited database/provider target.
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const databaseRequire = createRequire(
  path.join(root, 'packages/database/package.json')
);
const customerRequire = createRequire(
  path.join(root, 'apps/customer/package.json')
);
const { MongoMemoryServer } = databaseRequire('mongodb-memory-server');
const mongoose = databaseRequire('mongoose');
const { default: Cabin } =
  await import('../../packages/database/src/models/Cabin.ts');
const { default: Dining } =
  await import('../../packages/database/src/models/Dining.ts');
const { Experience } =
  await import('../../packages/database/src/models/Experience.ts');
const workspace = await mkdtemp(
  path.join(tmpdir(), 'lodgeflow-catalog-production-')
);
const app = path.join(workspace, 'apps/customer');
const next = customerRequire.resolve('next/dist/bin/next');
const clerk = createClerkFixture({ organizationId: 'catalog_test', users: [] });
// Exercise the configured SEO origin independently of the local HTTP server.
const publicOrigin = 'https://seo-fixture.example.test';
let database;
let server;
let output = '';

function start(args, env) {
  const child = spawn(process.execPath, [next, ...args], {
    cwd: app,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  for (const stream of [child.stdout, child.stderr]) {
    stream.on('data', chunk => {
      output = (output + chunk.toString()).slice(-40000);
    });
  }
  return child;
}
async function freePort() {
  const socket = createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const port = socket.address().port;
  await new Promise((resolve, reject) =>
    socket.close(error => (error ? reject(error) : resolve()))
  );
  return port;
}

try {
  await cp(path.join(root, 'apps/customer'), app, {
    recursive: true,
    filter: source =>
      !path
        .relative(path.join(root, 'apps/customer'), source)
        .split(path.sep)
        .some(
          part =>
            [
              'node_modules',
              'coverage',
              'test-results',
              'playwright-report',
            ].includes(part) ||
            (part.startsWith('.') && part !== '.') ||
            part.endsWith('.tsbuildinfo')
        ),
  });
  console.log(
    'Captured isolated customer app source for production regression'
  );
  await mkdir(path.join(workspace, 'packages'), { recursive: true });
  for (const name of ['database', 'email']) {
    await symlink(
      path.join(root, 'packages', name),
      path.join(workspace, 'packages', name),
      'dir'
    );
  }
  await symlink(
    path.join(root, 'node_modules'),
    path.join(workspace, 'node_modules'),
    'dir'
  );
  await symlink(
    path.join(root, 'apps/customer/node_modules'),
    path.join(app, 'node_modules'),
    'dir'
  );
  for (const filename of ['package.json', 'pnpm-workspace.yaml']) {
    await cp(path.join(root, filename), path.join(workspace, filename));
  }
  database = await MongoMemoryServer.create();
  const mongoUri = database.getUri('catalog_freshness');
  await mongoose.connect(mongoUri);
  const catalogs = [
    {
      section: 'cabins',
      model: Cabin,
      listingRoutes: ['/', '/cabins'],
      listingSuffix: '',
      fixture: {
        name: 'Original Catalog Cabin',
        capacity: 2,
        price: 100,
        discount: 0,
        description: 'Disposable cabin description',
        image: 'https://images.unsplash.com/test.jpg',
        status: 'active',
      },
    },
    {
      section: 'dining',
      model: Dining,
      listingRoutes: ['/dining'],
      listingSuffix: '/reserve',
      fixture: {
        name: 'Original Catalog Dining',
        description: 'Disposable dining description',
        type: 'menu',
        mealType: 'dinner',
        price: 40,
        servingTime: { start: '18:00', end: '21:00' },
        maxPeople: 8,
        category: 'regular',
        image: 'https://images.unsplash.com/test.jpg',
        isAvailable: true,
      },
    },
    {
      section: 'experiences',
      model: Experience,
      listingRoutes: ['/experiences'],
      listingSuffix: '',
      fixture: {
        name: 'Original Catalog Experience',
        description: 'Disposable experience description',
        price: 50,
        duration: '2 hours',
        difficulty: 'Easy',
        category: 'Nature',
        image: 'https://images.unsplash.com/test.jpg',
        includes: ['Guide'],
        available: ['Daily'],
        ctaText: 'Book experience',
      },
    },
  ];
  const originals = await Promise.all(
    catalogs.map((catalog, index) =>
      catalog.model.create({
        ...catalog.fixture,
        _id: `aabbccddeeff00112233440${index}`,
      })
    )
  );
  const [inactiveCabin, unavailableDining] = await Promise.all([
    Cabin.create({
      ...catalogs[0].fixture,
      name: 'Inactive Catalog Cabin',
      status: 'inactive',
    }),
    Dining.create({
      ...catalogs[1].fixture,
      name: 'Unavailable Catalog Dining',
      isAvailable: false,
    }),
  ]);
  const records = catalogs.map((catalog, index) => ({
    section: catalog.section,
    listingRoutes: catalog.listingRoutes,
    listingSuffix: catalog.listingSuffix,
    id: originals[index].id,
    name: originals[index].name,
    description: originals[index].description,
  }));
  const env = {
    ...Object.fromEntries(
      ['PATH', 'HOME', 'TMPDIR', 'TEMP', 'SystemRoot']
        .filter(key => process.env[key])
        .map(key => [key, process.env[key]])
    ),
    NODE_ENV: 'production',
    NEXT_TELEMETRY_DISABLED: '1',
    NEXT_PUBLIC_APP_URL: publicOrigin,
    MONGODB_URI: mongoUri,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: clerk.publishableKey,
    CLERK_SECRET_KEY: clerk.secretKey,
  };
  console.log(
    'Building isolated production customer app with disposable catalog data'
  );
  const build = start(['build', '--webpack'], env);
  const [buildCode] = await once(build, 'exit');
  assert.equal(buildCode, 0, 'production build must pass');
  const port = await freePort();
  server = start(
    ['start', '--hostname', 'localhost', '--port', String(port)],
    env
  );
  const origin = `http://localhost:${port}`;
  for (let attempt = 0; ; attempt++) {
    assert.equal(
      server.exitCode,
      null,
      'production server must remain running'
    );
    try {
      await fetch(`${origin}/api/cabins`, {
        redirect: 'manual',
        signal: AbortSignal.timeout(1000),
      });
      break;
    } catch (error) {
      if (attempt >= 100)
        throw new Error('production server readiness timed out', {
          cause: error,
        });
      await delay(100);
    }
  }
  await assertSeoContract({
    origin,
    publicOrigin,
    records,
    excludedCatalog: {
      inactiveCabin: `/cabins/${inactiveCabin.id}`,
      unavailableDining: `/dining/${unavailableDining.id}`,
    },
  });
  for (const [index, catalog] of catalogs.entries()) {
    const original = originals[index];
    await catalog.model.deleteOne({ _id: original._id });
    const replacement = await catalog.model.create({
      ...catalog.fixture,
      name: catalog.fixture.name.replace('Original', 'Replacement'),
    });
    for (const route of catalog.listingRoutes) {
      assertCatalogLinks({
        page: await readPage({ origin, route }),
        route,
        present: [
          `/${catalog.section}/${replacement.id}${catalog.listingSuffix}`,
        ],
        absent: [`/${catalog.section}/${original.id}${catalog.listingSuffix}`],
      });
    }
    const detailPath = `/${catalog.section}/${replacement.id}`;
    const detailPage = await readPage({ origin, route: detailPath });
    assertPublicMetadata({
      page: detailPage,
      route: detailPath,
      canonicalPath: detailPath,
      publicOrigin,
    });
    assertCatalogDetail({
      page: detailPage,
      record: {
        section: catalog.section,
        name: replacement.name,
        description: replacement.description,
      },
    });
    await assertNotFound({
      origin,
      route: `/${catalog.section}/${original.id}`,
    });
  }
  console.log(
    'PASS production homepage/catalog refresh after cabin, dining and experience replacement; current details 200, removed details 404'
  );
} catch (error) {
  console.error(output);
  throw error;
} finally {
  if (server && server.exitCode === null) {
    server.kill('SIGTERM');
    await once(server, 'exit');
  }
  await mongoose.disconnect();
  await database?.stop();
  await rm(workspace, { recursive: true, force: true });
}
