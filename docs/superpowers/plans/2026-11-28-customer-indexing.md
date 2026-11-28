# Customer indexing implementation plan

> **For agentic workers:** Use `superpowers:executing-plans` to implement this bounded fix, then obtain an independent review. Steps use checkboxes to record validation.

**Goal:** Give every public sitemap page its own server-generated canonical and render public catalog content without crawler access to private API paths.

**Architecture:** Keep shared defaults in the root layout, with URL identity owned by public leaf pages. Server pages read and serialize public dining/experience data, then pass it to the existing client interfaces and query caches. Non-search workflows receive server `noindex` metadata. Preserve the existing customer origin contract and robots exclusions.

**Tech stack:** Next.js 16 App Router, React 18, TypeScript, Mongoose, TanStack Query, Jest, isolated production HTTP harness.

**Spec:** The requested audit of current routes and indexing exclusions, with evidence and deployment acceptance documented in `docs/seo-indexing.md`.

## Global constraints

- Keep authorization, API response contracts, booking/payment behavior and retained checkout URLs unchanged.
- Use the existing `siteConfig.url` / `NEXT_PUBLIC_APP_URL` origin contract. Resolve the observed apex-to-www hosting mismatch in deployment configuration, not by guessing a new runtime URL policy.
- Keep existing robots exclusions. Every public sitemap URL must remain crawlable; transactional and account URLs stay out of the sitemap.
- Export metadata only from server route modules. Do not use client effects or `next/head` to repair canonicals.
- Use existing database serializers, explicit DTOs and request-scoped caching; no Mongoose documents cross the server/client boundary.
- Use disposable test data and provider fixtures. Do not seed production or call provider mutations.

## Review focus

- A list-page canonical must never leak into booking, reservation, confirmation or payment descendants.
- Uppercase ObjectId aliases must canonicalize to the stored lowercase identity.
- Invalid and missing catalog IDs must terminate with `notFound()` and no indexable canonical; temporary database errors must remain errors.
- Public catalog content must be present before JavaScript executes, and remain fresh when catalog records change after a production build.
- Query strings must not appear in canonical URLs, and explicit local/preview origins must remain supported.

## Task 1: Public metadata and server-rendered catalog

**Files:** Root/home/about/contact route modules; dining and experience list/detail route modules and extracted client components; `lib/data/catalog.ts`; the four catalog query hooks; `lib/seo/metadata.ts`; the existing cabin detail canonical; focused tests; `scripts/http-smoke/catalog-freshness.mjs`.

**Interfaces:** Add `createPageMetadata({ title, description, path }): Metadata`. Add request-cached `getDiningForListing(): Promise<Dining[]>`, `getExperiencesForListing(): Promise<Experience[]>`, `getDiningById(id: string): Promise<Dining | null>`, `getExperienceById(id: string): Promise<Experience | null>`. Read lists with the same visibility and ordering as their existing unfiltered APIs. Detail reads preserve availability semantics; unavailable dining remains viewable but is `noindex` and excluded from the sitemap. Extend hooks with an optional named options object containing typed `initialData`. Use canonical paths derived from serialized `_id`.

- [x] Write rendered HTTP regressions for one canonical per public route, path-correct `og:url`, query and uppercase aliases, SSR catalog links/content, and missing/invalid IDs.
- [ ] Run the rendered regression against the unchanged application and record the canonical failure. Blocked before assertions by executor IPC/MongoDB restrictions; the production crawl independently confirms the defect.
- [x] Remove root canonical and root `openGraph.url`; give the homepage its own `/` metadata. Add metadata to About and a server Contact wrapper.
- [x] Extract existing dining/experience client UIs and add server list/detail pages with public data and metadata. Remove detail `useEffect` parameter loading; seed the existing query cache with the serialized record.
- [x] Check data-reader validation, serialization, missing-record behavior, failure propagation and visibility with focused tests. Keep client interaction coverage.
- [ ] Run the focused tests, full customer suite, customer type check, read-only lint and production HTTP regression.

## Task 2: Non-search routes and deployment acceptance

**Files:** Server layouts under `bookings`, `sign-in`, `sign-up`, `payments`, each catalog confirmation subtree, dining `[id]/reserve`, experience `[id]/book`, and the existing pricing layout; `lib/seo/metadata.ts`; `docs/seo-indexing.md`; HTTP regressions.

**Interfaces:** Export `noIndexMetadata: Metadata` with `robots.index = false`, `robots.follow = true`, and the same Googlebot policy. Layouts render children unchanged and publish no canonical.

- [x] Write HTTP checks for `noindex`, no canonical and sitemap absence on these flows. Preserve allowed public pages and the existing robots disallow list. Rendered execution remains blocked locally.
- [x] Add server metadata layouts. Keep the placeholder `/pricing` out of search and sitemap.
- [x] Document the route matrix, observed evidence, distinction between aggregate GSC counts and URL-level attribution, and exact hosting/Search Console acceptance steps. Do not publish private email identifiers or personal data.
- [ ] Run formatting, relevant tests, customer lint/type/build and the existing isolated HTTP gate required by the repo. Obtain an independent review and open the authorized PR after the gates pass.
