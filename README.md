# Best You Version — Booking & Payment System

A modern mental health therapy website with automated booking, PayMongo payments (GCash, Maya, Cards), and Google Calendar integration.

## Tech Stack

- **Frontend**: React + Vite (hosted on GitHub Pages)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (admin only)
- **Payments**: PayMongo (GCash, Maya, Credit/Debit)
- **Calendar**: Google Calendar API (auto-create events)
- **CI/CD**: GitHub Actions (auto-deploy on push)

## Quick Start (Local Development)

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/bestyouversion.git
cd bestyouversion
npm install

# 2. Copy environment variables
cp .env.example .env

# 3. Fill in your keys (see Setup Guide below)
# Edit .env with your Supabase and PayMongo keys

# 4. Start dev server
npm run dev
```

Open http://localhost:3000

---

## Full Setup Guide

### Step 1: Supabase

1. Go to [supabase.com](https://supabase.com) → Create a new project
2. Go to **Settings → API** and copy:
   - `Project URL` → paste into `.env` as `VITE_SUPABASE_URL`
   - `anon public` key → paste as `VITE_SUPABASE_ANON_KEY`
3. Go to **SQL Editor** → paste the contents of `supabase/migrations/001_create_bookings.sql` → Run
4. Go to **Authentication → Users** → Click "Add User" → Add your admin email/password

### Step 2: PayMongo

1. Sign up at [paymongo.com](https://paymongo.com)
2. Go to **Developers → API Keys**
3. Copy `Public Key` → paste into `.env` as `VITE_PAYMONGO_PUBLIC_KEY`
4. Copy `Secret Key` → you'll need this for the Edge Function (Step 4)

### Step 3: Google Calendar

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable **Google Calendar API**
4. Go to **IAM & Admin → Service Accounts** → Create Service Account
5. Click the service account → **Keys → Add Key → JSON** → Download
6. Open your Google Calendar → **Settings → Share with specific people**
   → Add the service account email (e.g., `xxx@yyy.iam.gserviceaccount.com`)
   → Give **"Make changes to events"** permission
7. Note your Calendar ID (usually your Gmail address, found in Calendar Settings)

### Step 4: Deploy Supabase Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set PAYMONGO_SECRET_KEY=sk_test_xxxx
supabase secrets set GOOGLE_CALENDAR_ID=your-email@gmail.com
supabase secrets set GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

# Deploy functions
supabase functions deploy create-checkout
supabase functions deploy paymongo-webhook
```

### Step 5: Set Up PayMongo Webhook

1. Go to PayMongo Dashboard → **Webhooks** → Add Endpoint
2. URL: `https://YOUR_PROJECT.supabase.co/functions/v1/paymongo-webhook`
3. Events: Select `checkout_session.payment.paid`
4. Save and note the webhook secret
5. Set it: `supabase secrets set PAYMONGO_WEBHOOK_SECRET=whsk_xxxx`

### Step 6: Deploy to GitHub Pages

1. Push your code to GitHub
2. Go to repo **Settings → Pages** → Source: **GitHub Actions**
3. Go to repo **Settings → Secrets and Variables → Actions** → Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_PAYMONGO_PUBLIC_KEY`
4. Push to `main` — the site auto-deploys!

### Step 7: Custom Domain (Optional)

1. In your domain registrar (Squarespace, Namecheap, etc.), add:
   - CNAME record: `www` → `YOUR_USERNAME.github.io`
   - A records pointing to GitHub Pages IPs (see [GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site))
2. In repo **Settings → Pages** → Custom Domain: `www.bestyouversion.com`
3. Update `vite.config.js`: set `base: '/'`

---

## Project Structure

```
bestyouversion/
├── .github/workflows/deploy.yml    # Auto-deploy to GitHub Pages
├── public/                         # Static assets
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Navigation bar
│   │   ├── Hero.jsx                # Hero/landing section
│   │   ├── About.jsx               # About section
│   │   ├── Services.jsx            # Services & pricing
│   │   ├── BookingSection.jsx      # 3-step booking flow
│   │   └── Footer.jsx              # Footer
│   ├── pages/
│   │   ├── AdminLogin.jsx          # Admin sign-in
│   │   ├── AdminDashboard.jsx      # Manage bookings
│   │   └── PaymentResult.jsx       # Success/Failed pages
│   ├── hooks/
│   │   └── useAuth.js              # Supabase auth hook
│   ├── lib/
│   │   ├── supabase.js             # Supabase client
│   │   ├── paymongo.js             # PayMongo helpers
│   │   └── bookings.js             # Booking CRUD operations
│   ├── App.jsx                     # Routes
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── supabase/
│   ├── migrations/
│   │   └── 001_create_bookings.sql # Database schema
│   └── functions/
│       ├── create-checkout/        # Creates PayMongo checkout
│       └── paymongo-webhook/       # Handles payment + Google Calendar
├── .env.example                    # Environment template
├── package.json
├── vite.config.js
└── README.md
```

## How It Works

```
Client visits site
    ↓
Picks date + time → enters details
    ↓
Clicks "Pay with PayMongo"
    ↓
Booking saved to Supabase (status: pending_payment)
    ↓
Edge Function creates PayMongo Checkout Session
    ↓
Client redirected to PayMongo (pays via GCash/Maya/Card)
    ↓
PayMongo sends webhook → paymongo-webhook Edge Function
    ↓
Edge Function:
  1. Updates booking status to "confirmed"
  2. Creates Google Calendar event with client details
  3. Sends calendar invite to client's email
    ↓
Client sees success page
Admin sees confirmed booking in dashboard
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Public landing page with booking |
| `/admin` | Admin login + dashboard |
| `/payment/success` | After successful payment |
| `/payment/failed` | After failed payment |

## License

Private — All rights reserved © Best You Version
