# Clerk Authentication Setup Guide for LodgeFlow Customer Portal

## ✅ What Was Done

### 1. Created Authentication Pages

- **Sign-in page**: `/app/sign-in/[[...rest]]/page.tsx`
- **Sign-up page**: `/app/sign-up/[[...rest]]/page.tsx`

Both pages use Clerk's built-in `<SignIn />` and `<SignUp />` components with custom styling.

### 2. Protected Routes

The middleware now protects:

- **Cabin booking pages**: `/cabins/[id]` - Users must sign in to book
- **Booking API routes**: `/api/bookings/*` - API endpoints are protected

### 3. Auto-prefilled Booking Form

When authenticated users access a cabin booking page:

- ✅ First Name is prefilled from Clerk
- ✅ Last Name is prefilled from Clerk
- ✅ Email is prefilled and read-only from Clerk

## 🚀 Setup Instructions

### Step 1: Create Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

### Step 2: Get API Keys

1. In your Clerk Dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_`)
3. Copy your **Secret Key** (starts with `sk_test_`)

### Step 3: Configure Environment Variables

1. Copy the example file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Clerk keys:
   ```env
   MONGODB_URI=mongodb://localhost:27017/lodgeflow
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_key_here
   ```

### Step 4: Configure Clerk Dashboard Paths

In your Clerk Dashboard, go to **Paths** and set:

| Setting           | Value      |
| ----------------- | ---------- |
| Sign-in URL       | `/sign-in` |
| Sign-up URL       | `/sign-up` |
| After sign-in URL | `/`        |
| After sign-up URL | `/`        |

### Step 5: Start Development Server

```bash
pnpm dev
```

Visit [http://localhost:3002](http://localhost:3002)

## 🧪 Testing the Authentication Flow

### Test Case 1: Public Access

1. Visit [http://localhost:3002](http://localhost:3002) - ✅ Should work (home page is public)
2. Visit [http://localhost:3002/cabins](http://localhost:3002/cabins) - ✅ Should work (cabin listing is public)

### Test Case 2: Protected Routes

1. Click on any cabin to view details
2. You should be **redirected to `/sign-in`** with a redirect URL parameter
3. Sign in or create an account
4. After authentication, you'll be **redirected back to the cabin booking page**

### Test Case 3: Auto-prefilled Form

1. Sign in to your account
2. Navigate to any cabin booking page
3. The booking form should have:
   - ✅ First Name prefilled
   - ✅ Last Name prefilled
   - ✅ Email prefilled and read-only

## 🔒 What's Protected

### Protected Routes

- `/cabins/[id]` - Individual cabin booking pages

### Public Routes

- `/` - Home page
- `/cabins` - Cabin listing page
- `/about` - About page
- `/dining` - Dining page
- `/experiences` - Experiences listing
- `/pricing` - Pricing page
- `/contact` - Contact page

### Protected API Routes

- `/api/bookings/*` - All booking-related API endpoints

## 📝 User Flow

```
User visits cabin listing → Clicks "Book Now" →
Not authenticated? → Redirects to /sign-in →
User signs in → Redirected back to cabin booking →
Booking form prefilled with user data → User completes booking
```

## 🎨 Customization

### Styling the Auth Pages

The auth pages use your app's existing theme and styling. To customize:

Edit `/app/sign-in/[[...rest]]/page.tsx` or `/app/sign-up/[[...rest]]/page.tsx`

```tsx
<div className='text-center mb-8'>
  <h1 className='text-3xl font-bold text-foreground'>Your Custom Title</h1>
  <p className='text-foreground-500 mt-2'>Your custom description</p>
</div>
```

### Clerk Theme

The DynamicClerkProvider automatically matches Clerk's theme to your app:

- **Dark mode** → Clerk uses dark theme
- **Light mode** → Clerk uses default light theme

## 🐛 Troubleshooting

### Issue: 404 on `/sign-in`

**Solution**: Make sure you have the correct directory structure:

```
app/
└── sign-in/
    └── [[...rest]]/
        └── page.tsx
```

### Issue: Redirect loop

**Solution**: Check that your Clerk Dashboard paths match:

- Sign-in URL: `/sign-in`
- Sign-up URL: `/sign-up`

### Issue: "Clerk keys not found"

**Solution**:

1. Check `.env.local` exists in your project root
2. Verify the keys start with `pk_test_` and `sk_test_`
3. Restart your dev server after adding environment variables

### Issue: User data not prefilling

**Solution**:

1. Make sure user is authenticated (check navbar for user button)
2. Verify `useUser()` hook is returning user data
3. Check browser console for any errors

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Clerk Integration](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk React Hooks](https://clerk.com/docs/references/react/use-user)

## ✨ Features Enabled

After setup, your users can:

- ✅ Sign up with email/password or social providers (configured in Clerk)
- ✅ Sign in to their account
- ✅ Access protected cabin booking pages
- ✅ Have their information auto-filled in booking forms
- ✅ Manage their profile via Clerk's user button (in navbar)
- ✅ Sign out securely

---

**Need help?** Check the [Clerk documentation](https://clerk.com/docs) or open an issue on GitHub.
