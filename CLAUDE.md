# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start dev server (port 3002, uses Turbopack)
pnpm build            # Production build
pnpm lint             # ESLint with auto-fix
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test -- --testPathPattern="cabins"  # Run specific test file/folder
pnpm format           # Format with Prettier
pnpm ci:check         # Full CI check (format + lint + test)
```

## Architecture

### Tech Stack

- **Next.js 16** with App Router and Turbopack
- **MongoDB/Mongoose** for data persistence
- **Clerk** for authentication (user ID stored as string in `customer` field)
- **HeroUI v2** component library with Tailwind CSS
- **React Query** for server state management
- **Resend** for transactional emails

### Data Flow Pattern

```
Page/Component → Custom Hook (hooks/) → API Route (app/api/) → Mongoose Model (models/)
```

Custom hooks in `hooks/` use React Query to fetch from internal API routes. API routes connect to MongoDB via `connectDB()` from `lib/mongodb.ts`.

### Key Directories

- `app/api/` - API routes: bookings, cabins, dining, dining-reservations, experiences, experience-bookings, payments, settings, send (email)
- `models/` - Mongoose schemas: Booking, Cabin, Dining, DiningReservation, Experience, ExperienceBooking, Settings
- `hooks/` - React Query hooks matching API resources (useCabin, useBooking, etc.)
- `types/index.ts` - Centralized TypeScript types, re-exports model interfaces
- `components/ui/` - Reusable UI components

### Model Relationships

- **Booking.cabin** references Cabin via ObjectId
- **ExperienceBooking.experience** references Experience via ObjectId
- **DiningReservation.dining** references Dining via ObjectId
- **\*.customer** stores Clerk user ID as string (not ObjectId)
- All models extend Mongoose `Document` interface

### API Response Format

All API routes return `ApiResponse<T>`:

```typescript
{ success: boolean; data?: T; error?: string; message?: string }
```

### Testing

Tests live in `__tests__/` organized by feature (bookings, cabins, shared). Jest with React Testing Library. Framer-motion is mocked in `__tests__/__mocks__/`.

### ESLint Rules

- JSX props must be sorted alphabetically (`react/jsx-sort-props`)
- `no-console` warns except for `warn` and `error`
- Unused vars with `_` prefix are ignored
