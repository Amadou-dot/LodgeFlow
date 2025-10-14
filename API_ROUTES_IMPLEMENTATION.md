# API Routes Implementation - Issue #4

## Overview

This document describes the implementation of missing API routes and corresponding React hooks for the LodgeFlow customer portal, addressing GitHub Issue #4.

## Implemented Features

### 1. Booking History API

**Endpoint**: `GET /api/bookings/history`

**Description**: Fetch booking history for the authenticated user.

**Query Parameters**:

- `status` (optional): Filter bookings by status (unconfirmed, confirmed, checked-in, checked-out, cancelled)

**Authentication**: Required (Clerk Auth)

**Response**:

```typescript
{
  success: true,
  data: Booking[] // Array of bookings with populated cabin details
}
```

**Features**:

- User-specific bookings only (filtered by authenticated user ID)
- Optional status filtering
- Includes populated cabin information
- Sorted by creation date (newest first)

---

### 2. Booking Modification API

**Endpoint**: `PATCH /api/bookings/[id]`

**Description**: Update booking details for user's own bookings.

**Authentication**: Required (Clerk Auth)

**Authorization**: Users can only modify their own bookings

**Allowed Updates**:

- `numGuests`: Number of guests
- `specialRequests`: Array of special requests
- `extras`: Booking extras object

**Restrictions**:

- Cannot modify bookings that are checked-in or checked-out
- Cannot modify bookings belonging to other users

**Request Body**:

```typescript
{
  numGuests?: number;
  specialRequests?: string[];
  extras?: BookingExtras;
}
```

**Response**:

```typescript
{
  success: true,
  data: Booking, // Updated booking with cabin details
  message: "Booking updated successfully"
}
```

---

### 3. Booking Cancellation API

**Endpoint**: `DELETE /api/bookings/[id]`

**Description**: Cancel a booking (soft delete - changes status to 'cancelled').

**Authentication**: Required (Clerk Auth)

**Authorization**: Users can only cancel their own bookings

**Restrictions**:

- Only unconfirmed or confirmed bookings can be cancelled
- Cannot cancel bookings that are checked-in, checked-out, or already cancelled

**Response**:

```typescript
{
  success: true,
  data: Booking, // Cancelled booking
  message: "Booking cancelled successfully"
}
```

---

### 4. Email Notification APIs

#### 4.1 Booking Confirmation Email

**Endpoint**: `POST /api/send/confirm`

**Description**: Send booking confirmation email with full details.

**Request Body**:

```typescript
{
  firstName: string;
  email: string;
  bookingData: PopulatedBooking;
  cabinData: Cabin;
}
```

**Email Content**:

- Booking details (ID, dates, duration, guests)
- Cabin information with amenities
- Pricing breakdown with add-ons
- Deposit and remaining balance
- Important check-in/out information

**Response**:

```typescript
{
  id: string; // Resend email ID
}
```

#### 4.2 Welcome Email

**Endpoint**: `POST /api/send/welcome`

**Description**: Send welcome email to new users.

**Request Body**:

```typescript
{
  firstName: string;
  email: string;
}
```

**Email Content**:

- Welcome message
- Getting started information
- Features overview
- Next steps for booking

**Response**:

```typescript
{
  id: string; // Resend email ID
}
```

---

## React Hooks

### Booking Hooks (`hooks/useBooking.ts`)

#### `useCreateBooking()`

Creates a new booking.

**Usage**:

```typescript
const { mutate, isPending } = useCreateBooking();

mutate(bookingData, {
  onSuccess: response => {
    console.log('Booking created:', response.data);
  },
  onError: error => {
    console.error('Error:', error.message);
  },
});
```

#### `useBookingHistory(status?: string)`

Fetches booking history for the current user.

**Usage**:

```typescript
// All bookings
const { data: bookings, isLoading } = useBookingHistory();

// Filtered by status
const { data: activeBookings } = useBookingHistory('confirmed');
```

#### `useBookingById(bookingId: string)`

Fetches a single booking by ID.

**Usage**:

```typescript
const { data: booking, isLoading } = useBookingById('booking-id-123');
```

#### `useUpdateBooking()`

Updates booking details.

**Usage**:

```typescript
const { mutate: updateBooking, isPending } = useUpdateBooking();

updateBooking(
  {
    bookingId: 'booking-id-123',
    updates: {
      numGuests: 3,
      specialRequests: ['Early check-in'],
    },
  },
  {
    onSuccess: () => {
      console.log('Booking updated successfully');
    },
  }
);
```

#### `useCancelBooking()`

Cancels a booking.

**Usage**:

```typescript
const { mutate: cancelBooking, isPending } = useCancelBooking();

cancelBooking('booking-id-123', {
  onSuccess: () => {
    console.log('Booking cancelled successfully');
  },
});
```

### Email Hooks (`hooks/useSendEmail.ts`)

#### `useSendConfirmationEmail()`

Sends booking confirmation email.

**Usage**:

```typescript
const { sendConfirmationEmail } = useSendConfirmationEmail();

try {
  await sendConfirmationEmail(
    bookingData,
    cabinData,
    'user@example.com',
    'John'
  );
  // Email sent successfully
} catch (error) {
  console.error('Failed to send email:', error);
}
```

#### `useSendWelcomeEmail()`

Sends welcome email to new users.

**Usage**:

```typescript
const { sendWelcomeEmail } = useSendWelcomeEmail();

try {
  await sendWelcomeEmail('user@example.com', 'John');
  // Email sent successfully
} catch (error) {
  console.error('Failed to send email:', error);
}
```

---

## Email Templates

Email templates are located in `components/EmailTemplates.tsx` and include:

1. **WelcomeEmail**: Welcome message for new users
2. **BookingConfirmationEmail**: Detailed booking confirmation with pricing breakdown

Both templates feature:

- Responsive design
- Professional styling
- Brand colors
- Clear information hierarchy
- Call-to-action sections

---

## Security Features

### Authentication & Authorization

- All booking modification endpoints require Clerk authentication
- Users can only access and modify their own bookings
- Booking history is filtered by authenticated user ID

### Validation

- Email validation using regex pattern
- Required field validation
- Status validation before modifications
- Ownership verification before updates/cancellations

### Error Handling

- Comprehensive error messages
- Proper HTTP status codes (401, 403, 404, 400, 500)
- Type-safe error responses

---

## Database Integration

All endpoints use:

- MongoDB connection via `connectDB()`
- Mongoose models (Booking, Cabin)
- Population for related data
- Proper indexing for performance

---

## Dependencies Added

```json
{
  "resend": "^6.1.3"
}
```

Resend is used for transactional email sending with React Email templates.

---

## Environment Variables Required

Add to `.env.local`:

```env
# Resend API Key (get from https://resend.com)
RESEND_API_KEY=your_resend_api_key_here
```

---

## Testing Checklist

### API Testing

- [ ] Booking history returns user-specific bookings
- [ ] Status filtering works correctly
- [ ] PATCH updates only allowed fields
- [ ] DELETE soft-deletes bookings (changes status to cancelled)
- [ ] Unauthorized users cannot access other users' bookings
- [ ] Email validation works correctly
- [ ] Emails contain correct booking and cabin data

### Hook Testing

- [ ] `useBookingHistory` refetches after mutations
- [ ] `useUpdateBooking` invalidates cache correctly
- [ ] `useCancelBooking` updates booking list
- [ ] Email hooks handle errors properly
- [ ] React Query cache invalidation works

### Security Testing

- [ ] Unauthenticated requests return 401
- [ ] Users cannot modify others' bookings (403)
- [ ] Checked-in/out bookings cannot be modified
- [ ] Cancelled bookings cannot be cancelled again

---

## Future Enhancements

Potential improvements for future iterations:

1. **Refund API**: Handle refund processing for cancelled bookings
2. **Booking Reminders**: Automated email reminders before check-in
3. **Review System**: Allow users to review cabins after checkout
4. **Booking Modifications**: Allow date changes with availability checking
5. **Payment Integration**: Stripe/PayPal integration for deposits
6. **Calendar Integration**: Export bookings to Google Calendar/iCal
7. **SMS Notifications**: Text message confirmations via Twilio
8. **Receipt Generation**: PDF receipts for completed bookings

---

## Files Modified/Created

### API Routes

- ✅ `app/api/bookings/history/route.ts` (NEW)
- ✅ `app/api/bookings/[id]/route.ts` (UPDATED - added PATCH and DELETE)
- ✅ `app/api/send/confirm/route.ts` (NEW)
- ✅ `app/api/send/welcome/route.ts` (NEW)

### React Hooks

- ✅ `hooks/useBooking.ts` (UPDATED - added new hooks)
- ✅ `hooks/useSendEmail.ts` (NEW)

### Components

- ✅ `components/EmailTemplates.tsx` (NEW)

### Documentation

- ✅ `API_ROUTES_IMPLEMENTATION.md` (NEW - this file)

---

## Acceptance Criteria Status

From Issue #4:

- [x] Customer portal has full API functionality
- [x] Email notifications work
- [x] Customer data management works (via Clerk + bookings)
- [x] API is consistent with admin dashboard patterns
- [x] Proper error handling implemented
- [x] Hooks created for all endpoints
- [x] Documentation completed

---

## Related Issues

- Closes #4: Add missing API routes for full functionality
- Supports #12: Booking history and management feature
- Supports #11: Email notification system feature
- Aligns with #3: Data model standardization (using Clerk)

---

## Notes

- All API routes follow NextJS 15 App Router conventions
- TypeScript strict mode enabled
- ESLint rules enforced (JSX prop sorting)
- Follows admin dashboard patterns for consistency
- Uses React Query for optimal caching and mutations
- Email templates styled for both light and dark modes
