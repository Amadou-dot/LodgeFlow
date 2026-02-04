# LodgeFlow Feature Implementation Plan

## Overview

This document details the implementation plan for adding missing features to the LodgeFlow guest-facing application. The plan is organized into four phases by priority.

## Plan Review Summary (Updated)

The plan is sound and well-scoped. The updates below tighten sequencing, add missing guardrails (Stripe idempotency, refund workflow, indexing strategy, email idempotency), and clarify cross-feature reuse (payments for experiences/dining).

## Revised Phase Sequencing (Simplified)

### Phase 1 — Payments + Experience + Dining (Core Revenue)

1. **Payment Processing (Stripe Integration)**

- Add payment fields to Booking model (already listed)
- Webhooks must be **idempotent** (store processed `event.id`) and **signature-verified**
- Payment status endpoint + Pay Now UI on confirmation + bookings page
- Shared Stripe helpers so Experiences/Dining can reuse later without duplicating logic

2. **Experience Booking**

- Model + API routes + hooks + booking form + confirmation
- Availability endpoint (reuse pattern from cabins)
- Add to Bookings page as a new section/tab

3. **Dining Reservations**

- Model + API routes + hooks + detail + reservation flow
- Availability endpoint for date/time
- Add to Bookings page as a new section/tab

### Phase 2 — Availability + Reviews + Cancellation

4. **Availability Calendar Widget**

- Reuse existing cabins availability endpoint
- Normalize dates + timezone safety (`@internationalized/date`)

5. **Reviews & Ratings System**

- Require completed booking for verified reviews
- Add moderation status flow (`pending | approved | rejected`)
- Add a backfill/migration plan for Cabin `rating` and `reviewCount`

6. **Cancellation & Refund Logic**

- Add refund estimate API (already listed)
- Cancellation API should set `refundStatus` and trigger **async** Stripe refunds
- Include idempotent email sending to prevent duplicate notifications

### Phase 3 — Notifications + Pricing + Search

7. **Enhanced Notifications**

- Cron jobs should be batched and idempotent
- Add rate limits for safety and retries

8. **Seasonal/Dynamic Pricing**

- Introduce pricing utility + nightly breakdown
- Show “from” pricing on Cabin card and details

9. **Global Search**

- Add text indexes on Experience and Dining
- Use `textScore` sorting + define index creation strategy

### Phase 4 — Profile + Check-in + SEO + Future

10. **Guest Preferences/Profile**
11. **Check-in/Check-out Workflow**
12. **SEO & Meta Tags**
    13+) **Package Deals, Waitlist, Map, i18n**

**Current State Summary (as of February 2026):**

- Cabin browsing, detail, and booking flow: COMPLETE
- Booking management (view, edit, cancel): COMPLETE with refund logic
- Payments (Stripe Checkout + webhooks + pay buttons): COMPLETE (idempotency + payment-confirm automation implemented)
- Cancellation & Refund Logic: COMPLETE (refund-estimate endpoint, Stripe refund integration, cancellation emails)
- Experience browsing + booking flow: COMPLETE (payment integration not implemented)
- Dining listing + detail + reservation flow: COMPLETE (payment integration not implemented)
- Email notifications: PARTIAL (welcome, booking confirmation, payment confirmation, cancellation wired; experience/dining confirmation routes exist but not auto-triggered)
- Availability checking: PARTIAL (inline in BookingForm via SWR, no standalone calendar widget)

**Existing Architecture Pattern:**

```
Page/Component → Custom Hook (hooks/) → API Route (app/api/) → Mongoose Model (models/)
```

**Key Conventions:**

- API responses use `ApiResponse<T>`: `{ success, data?, error?, message? }`
- Types centralized in `types/index.ts`, re-exported from model interfaces
- Hooks use React Query (`@tanstack/react-query`) in `hooks/` with `staleTime: 5min`, `gcTime: 10min`
- BookingForm uses SWR for cabin availability fetching (both `swr` and `@tanstack/react-query` are dependencies)
- UI: HeroUI v2 components + Tailwind CSS + `lucide-react` icons
- Auth: Clerk (`auth()` in API routes, `useUser()` in components)
- Email: Resend with inline React email templates in `components/EmailTemplates.tsx`
- Models export from `models/index.ts` which also re-exports `connectDB` from `lib/mongodb.ts`
- Next.js 16 async params pattern: `params: Promise<{ id: string }>` unwrapped with `await` or `useEffect`

---

## Phase 1 - Critical (Core Functionality)

### ✅ 1. Payment Processing (Stripe Integration) — IMPLEMENTED (hardening + wiring pending)

**New Dependencies:**

- `stripe` (server-side SDK)
- `@stripe/stripe-js` (client-side)
- `@stripe/react-stripe-js` (React elements)

**Model Changes — `models/Booking.ts`:**
Add the following fields to `IBooking` interface and `BookingSchema`:

- `stripePaymentIntentId?: string`
- `stripeSessionId?: string`
- `paidAt?: Date`
- `refundAmount?: number`
- `refundedAt?: Date`

Note: `isPaid`, `depositPaid`, `depositAmount`, and `paymentMethod` already exist on the Booking model.

**New API Routes:**

- `app/api/payments/create-checkout/route.ts` — POST: Create Stripe Checkout Session for a booking
- `app/api/payments/webhook/route.ts` — POST: Handle Stripe webhooks (payment_intent.succeeded, checkout.session.completed, charge.refunded)
- `app/api/payments/[bookingId]/route.ts` — GET: Fetch payment status for a booking

**New Hooks — `hooks/usePayment.ts`:**

- `useCreateCheckoutSession(bookingId)` — mutation to initiate payment
- `usePaymentStatus(bookingId)` — query payment status

**New Components:**

- `components/PaymentButton.tsx` — Stripe checkout redirect button
- `components/PaymentStatus.tsx` — Display payment status chip/badge (exists, but not wired; bookings page uses inline chips)

**New/Modified Pages:**

- `app/cabins/confirmation/[id]/page.tsx` — Add "Pay Now" button that triggers Stripe Checkout (page exists, needs payment integration)
- `app/bookings/page.tsx` — Add "Pay" button for unpaid bookings (implemented with `PaymentButton`)
- `app/payments/success/page.tsx` — NEW: Payment success landing page
- `app/payments/cancel/page.tsx` — NEW: Payment cancelled landing page

**New Email Template:**

- `PaymentConfirmationEmail` in `components/EmailTemplates.tsx`
- `app/api/send/payment-confirm/route.ts` — NEW: Send payment confirmation email (route exists, not auto-triggered yet)

**Integration Points:**

- Booking creation flow: After booking is created (redirects to `/cabins/confirmation/[id]`), offer payment
- Webhook updates `isPaid`, `depositPaid`, `paidAt` on Booking model
- Settings model fields `requireDeposit` and `depositPercentage` already exist and drive deposit vs full payment logic
- Existing booking creation route (`app/api/bookings/route.ts`) already calculates `depositAmount`

**Environment Variables:**

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

**Hardening / Follow-ups:**

- **Webhook idempotency:** ✅ COMPLETE (`ProcessedStripeEvent` model tracks `event.id` with TTL index).
- **Signature verification:** ✅ implemented in webhook route.
- **Async refunds + cancellation integration:** ✅ COMPLETE (DELETE handler calculates refunds, initiates Stripe refund, sends email).
- **Shared Stripe helpers:** ✅ COMPLETE (`lib/stripe.ts` with `getStripe()`, `createRefund()`, `createCheckoutSession()`).
- **Payment confirmation email automation:** ✅ COMPLETE (webhook auto-triggers `sendPaymentConfirmationEmail()` via `lib/email.ts`).

---

### ✅ 2. Experience Booking — IMPLEMENTED (payment + email wiring pending)

**Current State:** Experience booking flow is implemented (model, API routes, hooks, booking form, confirmation page, history tab, availability endpoint). Payments are not integrated; confirmation email route exists but is not wired.

**New Model — `models/ExperienceBooking.ts`:**

```typescript
export interface IExperienceBooking extends Document {
  experience: mongoose.Types.ObjectId | string;
  customer: string; // Clerk user ID
  date: Date;
  timeSlot?: string;
  numParticipants: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  isPaid: boolean;
  stripePaymentIntentId?: string;
  specialRequests?: string[];
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Schema Indexes:**

- `{ experience: 1, date: 1 }` — Availability checks
- `{ customer: 1, createdAt: -1 }` — User history
- `{ status: 1, date: 1 }` — Admin queries

**Update `models/index.ts`:**

- Add export for `ExperienceBooking` model and `IExperienceBooking` type

**New API Routes:**

- `app/api/experience-bookings/route.ts` — POST: Create booking (validate capacity via `maxParticipants`); GET: List bookings
- `app/api/experience-bookings/[id]/route.ts` — GET, PATCH, DELETE
- `app/api/experience-bookings/history/route.ts` — GET: Current user's history (pattern: match `app/api/bookings/history/route.ts`)
- `app/api/experiences/[id]/availability/route.ts` — GET: Check availability for dates (pattern: match `app/api/cabins/[id]/availability/route.ts`)

**Operational Notes (NEW):**

- Decide if Experience bookings require payment now or later; reuse Stripe helpers where possible.
- Normalize date handling to avoid timezone drift.

**New Types in `types/index.ts`:**

```typescript
export type ExperienceBooking = IExperienceBooking;

export interface CreateExperienceBookingData {
  experienceId: string;
  date: Date;
  timeSlot?: string;
  numParticipants: number;
  specialRequests?: string[];
  observations?: string;
}
```

**New Hooks — `hooks/useExperienceBooking.ts`:**

- `useCreateExperienceBooking()` — mutation
- `useExperienceBookingHistory(status?)` — query
- `useExperienceBookingById(id)` — query
- `useCancelExperienceBooking()` — mutation
- `useExperienceAvailability(experienceId, date)` — query

**New Components:**

- `components/ExperienceBookingForm.tsx` — Date picker, participant count, special requests

**New Pages:**

- `app/experiences/[id]/book/page.tsx` — Booking page with form
- `app/experiences/confirmation/[id]/page.tsx` — Booking confirmation

**Modified Pages:**

- `app/experiences/[id]/page.tsx` — Replace contact CTAs with "Book Now" button linking to `/experiences/[id]/book`
- `app/bookings/page.tsx` — Add tab/section for experience bookings alongside cabin bookings

**New Email Template:**

- `ExperienceBookingConfirmationEmail` in `components/EmailTemplates.tsx`
- `app/api/send/experience-confirm/route.ts` (route exists, not auto-triggered yet)

---

### ✅ 3. Dining Reservations — IMPLEMENTED (payment + email wiring pending)

**Current State:** Dining reservation flow is implemented (model, API routes, hooks, reservation form, confirmation page, history tab, availability endpoint, detail page). Payments are not integrated; confirmation email route exists but is not auto-triggered.

**New Model — `models/DiningReservation.ts`:**

```typescript
export interface IDiningReservation extends Document {
  dining: mongoose.Types.ObjectId | string;
  customer: string; // Clerk user ID
  date: Date;
  time: string; // HH:MM format
  numGuests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  totalPrice: number;
  isPaid: boolean;
  stripePaymentIntentId?: string;
  dietaryRequirements?: string[];
  specialRequests?: string[];
  tablePreference?: 'indoor' | 'outdoor' | 'bar' | 'no-preference';
  occasion?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Schema Indexes:**

- `{ dining: 1, date: 1, time: 1 }` — Availability
- `{ customer: 1, createdAt: -1 }` — User history
- `{ status: 1, date: 1 }` — Admin queries

**Update `models/index.ts`:**

- Add export for `DiningReservation` model and `IDiningReservation` type

**New API Routes:**

- `app/api/dining-reservations/route.ts` — POST: Create reservation (validate against `maxPeople`, `servingTime`); GET: List
- `app/api/dining-reservations/[id]/route.ts` — GET, PATCH, DELETE
- `app/api/dining-reservations/history/route.ts` — GET: Current user's history
- `app/api/dining/[id]/route.ts` — GET: Single dining item details
- `app/api/dining/[id]/availability/route.ts` — GET: Check availability for date/time

**Operational Notes (NEW):**

- Decide if Dining reservations require payment now or later; reuse Stripe helpers where possible.
- Validate `servingTime` against the new reservation time.

**New Types in `types/index.ts`:**

```typescript
export type DiningReservation = IDiningReservation;

export interface CreateDiningReservationData {
  diningId: string;
  date: Date;
  time: string;
  numGuests: number;
  dietaryRequirements?: string[];
  specialRequests?: string[];
  tablePreference?: 'indoor' | 'outdoor' | 'bar' | 'no-preference';
  occasion?: string;
}
```

**New Hooks — `hooks/useDiningReservation.ts`:**

- `useCreateDiningReservation()` — mutation
- `useDiningReservationHistory(status?)` — query
- `useDiningReservationById(id)` — query
- `useCancelDiningReservation()` — mutation
- `useDiningAvailability(diningId, date)` — query

**New Hook — `hooks/useDiningItem.ts`:**

- `useDiningItem(diningId)` — query single dining item (for detail page)

**New Components:**

- `components/DiningReservationForm.tsx` — Date, time, guests, dietary, occasion fields

**New Pages:**

- `app/dining/[id]/page.tsx` — Dining item detail page
- `app/dining/[id]/reserve/page.tsx` — Reservation form page
- `app/dining/confirmation/[id]/page.tsx` — Reservation confirmation

**Modified Pages:**

- `app/dining/page.tsx` — Link "Reserve" buttons to `/dining/[id]/reserve` flow
- `app/bookings/page.tsx` — Add tab/section for dining reservations

**New Email Template:**

- `DiningReservationConfirmationEmail` in `components/EmailTemplates.tsx`
- `app/api/send/dining-confirm/route.ts`

---

## Phase 2 - Important (User Experience)

### 4. Availability Calendar Widget

**Current State:** Cabin availability checking exists via `app/api/cabins/[id]/availability/route.ts` which returns unavailable date ranges. The BookingForm component already uses SWR to fetch this and marks unavailable dates in the DateRangePicker. However, there is no standalone visual calendar widget for browsing availability before reaching the booking form.

**New Components:**

- `components/AvailabilityCalendar.tsx` — Visual month-view calendar widget:
  - Green: Available dates
  - Red/crossed: Fully booked dates
  - Click to select dates (can pre-populate booking form)
  - Uses existing `@heroui/date-picker` and `@internationalized/date` dependencies

**New Hooks — `hooks/useAvailability.ts`:**

- `useCabinAvailability(cabinId, startDate?, endDate?)` — React Query wrapper around existing `/api/cabins/[id]/availability` endpoint

**Modified Pages:**

- `app/cabins/[id]/page.tsx` — Add calendar widget between CabinDetails and BookingForm sections

**Integration:**

- Reuses existing `/api/cabins/[id]/availability` endpoint (no new API routes needed)
- Selected dates from calendar can be passed to BookingForm as initial values
- Consider migrating BookingForm's SWR usage to React Query for consistency with this hook

**Operational Notes (NEW):**

- Normalize dates in both server and client (`@internationalized/date`) to avoid timezone mismatches.

---

### 5. Reviews & Ratings System

**Current State:** Experience and Dining models already have `rating: number` and `reviewCount: number` fields. Cabin model does NOT have these fields. No Review model, routes, hooks, or components exist.

**New Model — `models/Review.ts`:**

```typescript
export interface IReview extends Document {
  customer: string; // Clerk user ID
  customerName: string;
  targetType: 'cabin' | 'experience' | 'dining';
  targetId: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  rating: number; // 1-5
  title: string;
  comment: string;
  photos?: string[];
  isVerified: boolean; // has a completed booking
  status: 'pending' | 'approved' | 'rejected';
  helpfulCount: number;
  response?: { text: string; respondedAt: Date };
  createdAt: Date;
  updatedAt: Date;
}
```

**Schema Indexes:**

- `{ targetType: 1, targetId: 1, createdAt: -1 }` — Reviews by target
- `{ customer: 1, targetType: 1, targetId: 1 }` — One review per customer per item (unique)

**Model Changes — `models/Cabin.ts`:**
Add fields to `ICabin` interface and `CabinSchema`:

- `rating?: number` (min: 0, max: 5)
- `reviewCount?: number` (default: 0)

Note: Experience and Dining models already have these fields.

**Update `models/index.ts`:**

- Add export for `Review` model and `IReview` type

**New API Routes:**

- `app/api/reviews/route.ts` — POST: Create (verify completed booking for `isVerified`); GET: List with filters (targetType, targetId, rating)
- `app/api/reviews/[id]/route.ts` — GET, PATCH, DELETE (own review only, auth check)
- `app/api/reviews/[id]/helpful/route.ts` — POST: Mark as helpful

**Operational Notes (NEW):**

- Gate verified reviews to completed bookings.
- Add migration/backfill plan for Cabin `rating` and `reviewCount`.

**New Types in `types/index.ts`:**

```typescript
export type Review = IReview;

export interface CreateReviewData {
  targetType: 'cabin' | 'experience' | 'dining';
  targetId: string;
  bookingId?: string;
  rating: number;
  title: string;
  comment: string;
  photos?: string[];
}

export interface ReviewQueryParams {
  targetType?: 'cabin' | 'experience' | 'dining';
  targetId?: string;
  rating?: number;
  status?: 'pending' | 'approved' | 'rejected';
  sort?: 'newest' | 'highest' | 'lowest' | 'helpful';
}
```

**New Hooks — `hooks/useReviews.ts`:**

- `useReviews(params: ReviewQueryParams)` — query
- `useCreateReview()` — mutation
- `useUpdateReview()` — mutation
- `useDeleteReview()` — mutation
- `useMarkHelpful(reviewId)` — mutation

**New Components:**

- `components/ReviewCard.tsx` — Single review with stars, helpful button
- `components/ReviewsList.tsx` — List with sorting/filtering
- `components/ReviewForm.tsx` — Star rating input, title, comment, photo upload
- `components/StarRating.tsx` — Reusable star display (read-only + interactive modes)
- `components/ReviewSummary.tsx` — Average rating, distribution bars

**Modified Pages:**

- `app/cabins/[id]/page.tsx` — Add reviews section below booking form
- `app/experiences/[id]/page.tsx` — Add reviews section (already shows rating/reviewCount in header)
- `app/dining/[id]/page.tsx` — Add reviews section (page must be created first, see Phase 1 #3)

---

### ✅ 6. Cancellation & Refund Logic — IMPLEMENTED

**Current State:** Cancellation with full refund processing is implemented. The DELETE handler calculates refunds based on policy, initiates Stripe refunds, and sends cancellation confirmation emails. New hooks (`useRefundEstimate`, updated `useCancelBooking`) support the enhanced flow.

**Model Changes — `models/Booking.ts`:**
Add fields to `IBooking` interface and `BookingSchema`:

- `cancelledAt?: Date`
- `cancellationReason?: string`
- `refundStatus?: 'none' | 'pending' | 'partial' | 'full'`
- `refundAmount?: number` (already exists from payments)
- `refundedAt?: Date` (already exists from payments)

Note: `stripePaymentIntentId` addition is covered in Phase 1 #1 (Payments).

**New Utility — `lib/cancellation.ts`:**

- `calculateRefund(booking, settings, cancellationDate)`:
  - `flexible`: Full refund up to 24h before check-in
  - `moderate`: Full refund 5+ days before, 50% 2-5 days before, none <2 days
  - `strict`: 50% refund 7+ days before, none after
- `getCancellationDeadline(booking, settings)` — returns last date for full/partial refund

**New API Route:**

- `app/api/bookings/[id]/refund-estimate/route.ts` — GET: Calculate estimated refund without executing

**Modified API:**

- `app/api/bookings/[id]/route.ts` (DELETE) — Enhanced to:
  - Calculate refund based on `cancellationPolicy` from Settings
  - Set `cancelledAt`, `cancellationReason`, `refundAmount`, `refundStatus`
  - Initiate Stripe refund if `isPaid` and `stripePaymentIntentId` exists
  - Trigger cancellation confirmation email

**Operational Notes (NEW):**

- Use async refund processing to keep API latency low.
- Ensure idempotent cancellation (avoid duplicate refunds/emails).

**Modified Components/Pages:**

- `app/bookings/page.tsx` — Cancel modal should show refund estimate before confirming (call refund-estimate API)
- `app/cabins/confirmation/[id]/page.tsx` — Show cancellation policy info

**New Email Template:**

- `CancellationConfirmationEmail` in `components/EmailTemplates.tsx` (shows refund details)
- `app/api/send/cancellation/route.ts`

---

### 7. Enhanced Notifications

**Current State:** Welcome + booking confirmation emails are wired (`/api/send/welcome`, `/api/send/confirm`, `useSendEmail.ts`). Payment + experience confirmation templates/routes exist but are not wired (no hooks or automatic sends yet).

**New API Routes:**

- `app/api/send/reminder/route.ts` — Booking reminder (2 days before check-in)
- `app/api/send/checkin-instructions/route.ts` — Check-in instructions (day of)
- `app/api/send/post-stay/route.ts` — Post-stay follow-up + review prompt

**New Email Templates in `components/EmailTemplates.tsx`:**

- `BookingReminderEmail`
- `CheckInInstructionsEmail`
- `PostStayFollowUpEmail`

Note: `CancellationEmail` is covered in Phase 2 #6 above.

**Cron Jobs (Vercel Cron):**

- `app/api/cron/send-reminders/route.ts` — Query bookings 2 days before check-in, send reminder emails
- `app/api/cron/post-stay/route.ts` — Query bookings where checkout was yesterday, send follow-up emails

**Config:**

- Add cron definitions to `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/send-reminders", "schedule": "0 9 * * *" },
    { "path": "/api/cron/post-stay", "schedule": "0 10 * * *" }
  ]
}
```

**Operational Notes (NEW):**

- Batch emails, track send status to prevent duplicates.
- Add rate limiting or backoff in cron handlers.

---

## Phase 3 - Polish (Growth & UX)

### 8. Seasonal/Dynamic Pricing

**Current State:** Cabin pricing is simple: `price` and `discount` fields. The booking route calculates `effectivePrice = cabin.price - cabin.discount` and multiplies by nights. No seasonal variation exists.

**Model Changes — `models/Cabin.ts`:**
Add to `ICabin` interface and `CabinSchema`:

```typescript
seasonalPricing?: [{
  name: string;
  startDate: string; // MM-DD format
  endDate: string;   // MM-DD format
  priceMultiplier: number; // e.g., 1.5 for 50% increase
  minNights?: number;
}]
```

**New Utility — `lib/pricing.ts`:**

- `calculateSeasonalPrice(cabin, checkInDate, checkOutDate)` — Returns per-night breakdown with seasonal adjustments
- `getCurrentSeason(cabin, date)` — Returns active season info for a given date
- `getEffectivePrice(cabin, date)` — Single night price accounting for season + discount

**Modified Files:**

- `app/api/bookings/route.ts` (POST) — Use `calculateSeasonalPrice` instead of flat `effectivePrice * numNights`
- `components/BookingForm.tsx` — Show per-night breakdown when seasonal pricing applies; update `calculateTotal()` function
- `components/CabinCard.tsx` — Show "From $X/night" with lowest seasonal price
- `components/CabinDetails.tsx` — Add seasonal pricing table/info section

---

### 9. Global Search

**Current State:** Cabin model already has a text index on `{ name: 'text', description: 'text' }`. Experience and Dining models do NOT have text indexes. The navbar has no search functionality. The dining list page has a local search filter that passes to the API.

**New API Route:**

- `app/api/search/route.ts` — GET: Unified search across cabins, experiences, dining via MongoDB text indexes

**Model Changes:**

- `models/Experience.ts` — Add text index: `{ name: 'text', description: 'text', category: 'text' }`
- `models/Dining.ts` — Add text index: `{ name: 'text', description: 'text' }`

**Operational Notes (NEW):**

- Use `textScore` for relevance sorting.
- Plan index creation/migrations for production.

**New Hooks — `hooks/useSearch.ts`:**

- `useSearch(query, type?)` — debounced React Query hook

**New Components:**

- `components/SearchModal.tsx` — Full-screen overlay triggered by Cmd+K / search icon
- `components/SearchResult.tsx` — Result card with type indicator (cabin/experience/dining)

**Modified Files:**

- `components/navbar.tsx` — Add search button/icon to NavbarContent

---

### 10. Guest Preferences/Profile

**Current State:** No profile page exists. The `config/site.ts` defines `navMenuItems` that include "Profile" and "Preferences" links to `/profile` and `/preferences`, but these pages do NOT exist. Clerk handles basic user data. BookingForm pre-fills from Clerk user data.

**New Model — `models/GuestProfile.ts`:**

```typescript
export interface IGuestProfile extends Document {
  clerkUserId: string; // unique
  dietaryPreferences?: string[];
  roomPreferences?: string[];
  allergies?: string[];
  accessibilityNeeds?: string[];
  communicationPreference?: 'email' | 'phone' | 'sms';
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Update `models/index.ts`:**

- Add export for `GuestProfile` model and `IGuestProfile` type

**New API Routes:**

- `app/api/profile/route.ts` — GET: Fetch current user's profile; POST: Create profile; PATCH: Update profile

**New Types in `types/index.ts`:**

```typescript
export type GuestProfile = IGuestProfile;

export interface UpdateGuestProfileData {
  dietaryPreferences?: string[];
  roomPreferences?: string[];
  allergies?: string[];
  accessibilityNeeds?: string[];
  communicationPreference?: 'email' | 'phone' | 'sms';
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}
```

**New Hooks — `hooks/useGuestProfile.ts`:**

- `useGuestProfile()` — query
- `useUpdateGuestProfile()` — mutation

**New Page:**

- `app/profile/page.tsx` — Preferences form (dietary, room, accessibility, communication, emergency contact)
- `app/preferences/page.tsx` — Alias/redirect to `/profile` (nav menu currently links here)

**Integration:**

- Auto-populate booking/reservation forms from profile (pass to BookingForm, ExperienceBookingForm, DiningReservationForm)
- Add "Profile" link to UserButton.MenuItems in `components/navbar.tsx`

---

### 11. Check-in/Check-out Workflow

**Current State:** Booking model has `status` enum with 'checked-in' and 'checked-out' values, but no digital check-in/checkout flow exists. No routes to process check-in/checkout. No UI for self-service check-in.

**Model Changes — `models/Booking.ts`:**
Add fields to `IBooking` interface and `BookingSchema`:

- `checkedInAt?: Date`
- `checkedOutAt?: Date`
- `checkInDetails?: { method: 'digital' | 'front-desk'; idVerified: boolean; keyIssued: boolean }`
- `accessCode?: string` (generated 6-digit code)

**New API Routes:**

- `app/api/bookings/[id]/checkin/route.ts` — POST: Process digital check-in (validate booking is confirmed, date is correct, generate access code)
- `app/api/bookings/[id]/checkout/route.ts` — POST: Process checkout (validate booking is checked-in)

**New Pages:**

- `app/bookings/[id]/checkin/page.tsx` — Multi-step check-in wizard (ID verification step, terms acceptance, access code display)
- `app/bookings/[id]/checkout/page.tsx` — Checkout flow (feedback, review prompt)

**New Components:**

- `components/CheckInFlow.tsx` — Multi-step wizard component
- `components/AccessCodeDisplay.tsx` — Large, styled access code display
- `components/CheckInInstructions.tsx` — Pre-arrival instructions card

**Modified Pages:**

- `app/bookings/page.tsx` — Add "Check In" button for confirmed bookings on check-in day; "Check Out" button for checked-in bookings

---

## Phase 4 - Future (Nice-to-Have)

### 12. SEO & Meta Tags

- `generateMetadata` exports on all detail pages (`app/cabins/[id]/page.tsx`, `app/experiences/[id]/page.tsx`, `app/dining/[id]/page.tsx`)
- Note: Detail pages are currently client components (`'use client'`). Need server component wrapper pattern for metadata + client interactivity
- `app/sitemap.ts` — Dynamic sitemap generation from MongoDB
- `app/robots.ts` — Robots.txt configuration
- `components/JsonLd.tsx` — Structured data (LodgingBusiness, Product, Review schemas)

### 13. Package Deals

- `models/Package.ts` — Bundled cabin + experience + dining with discount
- `app/api/packages/` routes (CRUD)
- `app/packages/` pages (list, detail)
- Linked booking creation (create Booking + ExperienceBooking + DiningReservation atomically)

### 14. Waitlist

- `models/Waitlist.ts` — Track waitlist entries for fully-booked dates
- `app/api/waitlist/` routes (create entry, check position, remove)
- Notification on cancellation matching waitlist entries (hook into cancellation flow)
- UI in BookingForm when selected dates are unavailable

### 15. Map Integration

- `react-leaflet` + `leaflet` dependencies
- `components/PropertyMap.tsx` — Interactive map component
- Add `coordinates: { lat: number; lng: number }` to Cabin and Experience models
- `app/map/page.tsx` — Full property map with cabin/experience markers
- Add to `config/site.ts` navItems

### 16. i18n

- `next-intl` integration
- `app/[locale]/` route restructure (major refactor)
- `messages/` directory with translation JSON files
- Language switcher component in navbar
- Consider incremental approach: start with static text, then dynamic content

---

## Testing Strategy

For each feature, create tests in `__tests__/[feature]/`:

- Unit tests for utility functions (`lib/pricing.ts`, `lib/cancellation.ts`)
- Component tests with React Testing Library (follow patterns in `__tests__/cabins/`)
- API route tests (mock mongoose via `jest.mock`, mock Clerk auth)
- Mock `framer-motion` per existing `__tests__/__mocks__/framer-motion.ts`
- Use test utilities from `__tests__/shared/test-utils.tsx`

Existing test coverage to maintain:

- `__tests__/bookings/` — useBooking hook, BookingFormDiscount
- `__tests__/cabins/` — CabinCard, CabinDetails, CabinFilters, CabinPageLayout, useCabins
- `__tests__/shared/` — Breadcrumb, test utilities

## Shared Patterns

- **Auth in API routes:** `const { userId } = await auth()` — return 401 if missing, 403 if not owner
- **DB connection:** `await connectDB()` at start of every API handler (from `@/models` or `lib/mongodb.ts`)
- **Model exports:** Add new models to `models/index.ts` with both default export and type export
- **Type exports:** Add new interfaces to `types/index.ts` with re-export from model
- **Validation:** Mongoose schema validators + API route checks; client-side via HeroUI form props (`isRequired`, etc.)
- **Caching:** React Query `staleTime: 5 * 60 * 1000`, `gcTime: 10 * 60 * 1000`; `enabled: !!id` for conditional queries
- **Error handling:** try/catch, `console.error`, return `ApiResponse<never>` with appropriate status codes
- **Async params (Next.js 16):** `params: Promise<{ id: string }>`, unwrap with `await` in server context or `useEffect` in client components
- **Populate pattern:** `.populate('cabin', 'name image capacity price discount description')` for booking queries
- **Toast notifications:** `addToast({ title, description, color })` from `@heroui/toast`
- **Navigation:** `useRouter()` from `next/navigation` for programmatic navigation
