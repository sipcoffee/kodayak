# Kodayak - Disposable Camera for Events MVP

## Project Overview

**Kodayak** is a PWA-based disposable camera platform for events where attendees become photographers, capturing moments from unique angles. Event organizers (Clients) create events, generate QR codes for attendees, and collect all photos in one gallery.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | App Router, Server Components, API Routes |
| better-auth | Authentication (email/password, OAuth) |
| PostgreSQL | Primary database |
| Prisma | ORM with type-safe queries |
| Tailwind CSS v4 | Styling |
| shadcn/ui | UI component library |
| PWA | Offline support, camera access, installable |
| PayMongo | Payment processing (Philippines) |

---

## User Roles

### 1. ADMIN (You)
- Full platform control
- Manage all clients and events
- View analytics and revenue
- Handle support tickets
- Manage pricing plans

### 2. CLIENT (Event Organizers)
- Purchase event packages
- Create and manage events
- Generate QR codes for attendees
- View/download event galleries
- Manage event settings (expiry, photo limits)

### 3. GUEST (Event Attendees - No Auth Required)
- Scan QR code to access event camera
- Take photos using device camera
- View event gallery (if enabled by client)
- No account needed (anonymous participation)

---

## Core Features (MVP)

### Phase 1: Foundation
- [x] Project setup (mirrors taratakbo structure)
- [x] Database schema design
- [x] Authentication system (ADMIN, CLIENT roles)
- [x] Basic UI components setup

### Phase 2: Public Pages & Auth
- [x] Landing page (hero, features, how-it-works, CTA)
- [x] Pricing page (plan comparison, FAQ)
- [x] Login page with Google OAuth option
- [x] Signup page with Google OAuth option
- [x] About/Contact page

### Phase 3: Client Dashboard
- [x] Dashboard layout with sidebar navigation
- [x] Dashboard overview page (stats cards, empty states)
- [x] Events list page (skeleton)
- [x] Billing page (skeleton)
- [x] Settings page (skeleton)
- [x] Event creation wizard
- [x] QR code generation
- [x] Gallery management
- [x] Event settings (active/inactive, expiry)
- [x] Photo download (individual/bulk)

### Phase 4: Admin Dashboard
- [x] Admin layout with sidebar navigation
- [x] Admin overview page (stats cards)
- [x] Client management (full CRUD)
- [x] Event overview (full CRUD)
- [x] Revenue analytics
- [x] Plan management

### Phase 5: Camera & Gallery (PWA)
- [x] PWA manifest and service worker
- [x] Camera capture interface
- [x] Photo upload with compression
- [x] Real-time gallery updates
- [x] Offline queue for uploads

### Phase 6: Payment Integration
- [ ] PayMongo checkout integration
- [ ] Subscription/one-time payment handling
- [ ] Webhook for payment confirmation
- [ ] Invoice generation

### Phase 7: Films System (NEW)
- [x] UserFilm model and FilmStatus enum in Prisma schema
- [x] Films nav item and badge in header
- [x] Films inventory page (`/films`)
- [x] Film purchase page (`/films/purchase`) - mock payment
- [x] Event creation requires film selection
- [x] Film consumption on event creation
- [x] Dashboard stats include film count

---

## Implemented Features Log

### Films System (March 2026)
Transform plans into "films" that users purchase and consume when creating events.

**Database Changes:**
- Added `FilmStatus` enum: `AVAILABLE`, `USED`, `EXPIRED`, `REFUNDED`
- Added `UserFilm` model with relations to User, Plan, Payment, Event
- Added `userFilmId` field to Event model
- Added `films` relation to User and `userFilms` to Plan

**API Endpoints:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/films` | GET | Get user's film inventory |
| `/api/films/available` | GET | Get available films for event creation |
| `/api/films/purchase` | POST | Mock purchase (creates films instantly) |
| `/api/plans` | GET | Get active plans for users |

**UI Changes:**
- "Films" nav item in sidebar with film icon
- Film count badge in header (clickable, links to /films)
- Films inventory page with available/used films sections
- Film purchase page with plan selection and quantity
- Event form now requires film selection (derives photo limit & duration from plan)
- Alert component added to UI library

**How It Works:**
1. User purchases films (currently mock - instant creation)
2. Each film has a plan type (Basic/Standard/Premium)
3. When creating an event, user selects an available film
4. Film is consumed and marked as "USED"
5. Event gets photoLimit and expiresAt from the film's plan

---

## Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  CLIENT
}

enum EventStatus {
  DRAFT
  ACTIVE
  PAUSED
  EXPIRED
  COMPLETED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum PlanType {
  BASIC
  STANDARD
  PREMIUM
}

enum FilmStatus {
  AVAILABLE   // Ready to use
  USED        // Consumed for an event
  EXPIRED     // Past expiration
  REFUNDED    // Payment refunded
}

// ============ BETTER-AUTH MODELS ============

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  role          Role      @default(CLIENT)

  // Client-specific fields
  company       String?
  phone         String?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  sessions      Session[]
  accounts      Account[]
  events        Event[]
  payments      Payment[]
  films         UserFilm[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                    String    @id @default(cuid())
  userId                String
  providerId            String
  accountId             String
  password              String?
  accessToken           String?
  refreshToken          String?
  idToken               String?
  scope                 String?
  accessTokenExpiresAt  DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// ============ APP MODELS ============

model Plan {
  id            String   @id @default(cuid())
  name          String
  type          PlanType @unique
  price         Decimal  @db.Decimal(10, 2)
  photoLimit    Int      // Max photos per event
  eventDuration Int      // Days the event stays active
  features      String[] // Array of feature strings
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  payments  Payment[]
  userFilms UserFilm[]
}

model Event {
  id           String      @id @default(cuid())
  userId       String
  userFilmId   String?     @unique  // Film used for this event
  name         String
  description  String?
  slug         String      @unique // For QR code URL
  coverImage   String?
  status       EventStatus @default(DRAFT)
  photoLimit   Int
  expiresAt    DateTime
  isGalleryPublic Boolean  @default(false)

  // Customization
  primaryColor String?     @default("#E91E63")
  welcomeMessage String?

  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  // Relations
  user         User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userFilm     UserFilm?   @relation(fields: [userFilmId], references: [id])
  photos       Photo[]
  payment      Payment?
}

model Photo {
  id          String   @id @default(cuid())
  eventId     String
  url         String
  thumbnailUrl String?

  // Guest info (anonymous)
  guestName   String?
  guestId     String   // Anonymous session ID

  // Metadata
  width       Int?
  height      Int?
  size        Int?     // File size in bytes

  createdAt   DateTime @default(now())

  // Relations
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId])
}

model Payment {
  id              String        @id @default(cuid())
  userId          String
  eventId         String?       @unique
  planId          String

  // PayMongo fields
  paymongoId      String?       @unique
  checkoutUrl     String?

  amount          Decimal       @db.Decimal(10, 2)
  currency        String        @default("PHP")
  status          PaymentStatus @default(PENDING)

  paidAt          DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Relations
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  event           Event?        @relation(fields: [eventId], references: [id], onDelete: SetNull)
  plan            Plan          @relation(fields: [planId], references: [id])
  userFilm        UserFilm?
}

model UserFilm {
  id          String     @id @default(cuid())
  userId      String
  planId      String
  paymentId   String?    @unique  // Nullable for promotional/free films
  status      FilmStatus @default(AVAILABLE)
  purchasedAt DateTime   @default(now())
  usedAt      DateTime?
  expiresAt   DateTime?  // Optional for promotional films
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // Relations
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan        Plan       @relation(fields: [planId], references: [id])
  payment     Payment?   @relation(fields: [paymentId], references: [id])
  event       Event?     // The event created from this film

  @@index([userId, status])
}
```

---

## Folder Structure

> ✅ = Created | ⬜ = Not yet created

```
kodayak/
├── app/
│   ├── (marketing)/              # ✅ Public marketing pages
│   │   ├── layout.tsx            # ✅ Marketing layout (header/footer)
│   │   ├── page.tsx              # ✅ Landing page
│   │   ├── pricing/
│   │   │   └── page.tsx          # ✅ Pricing page
│   │   └── about/
│   │       └── page.tsx          # ⬜ About page
│   │
│   ├── (auth)/                   # ✅ Authentication pages
│   │   ├── layout.tsx            # ✅ Auth layout
│   │   ├── login/
│   │   │   └── page.tsx          # ✅
│   │   └── signup/
│   │       └── page.tsx          # ✅
│   │
│   ├── (app)/                    # ✅ Protected app routes
│   │   ├── layout.tsx            # ✅ App layout with sidebar/nav
│   │   ├── dashboard/
│   │   │   └── page.tsx          # ✅ Client dashboard
│   │   ├── events/
│   │   │   ├── page.tsx          # ✅ Events list (skeleton)
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # ⬜ Create event
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # ⬜ Event details/gallery
│   │   │       ├── settings/
│   │   │       │   └── page.tsx  # ⬜ Event settings
│   │   │       └── qr/
│   │   │           └── page.tsx  # ⬜ QR code page
│   │   ├── billing/
│   │   │   └── page.tsx          # ✅ Payment history (skeleton)
│   │   ├── films/
│   │   │   ├── page.tsx          # ✅ Films inventory page
│   │   │   └── purchase/
│   │   │       └── page.tsx      # ✅ Film purchase page
│   │   └── settings/
│   │       └── page.tsx          # ✅ Account settings (skeleton)
│   │
│   ├── (admin)/                  # ✅ Admin-only routes
│   │   ├── layout.tsx            # ✅ Admin layout
│   │   └── admin/
│   │       ├── page.tsx          # ✅ Admin overview (skeleton)
│   │       ├── clients/
│   │       │   └── page.tsx      # ⬜ Manage clients
│   │       ├── events/
│   │       │   └── page.tsx      # ⬜ All events
│   │       ├── analytics/
│   │       │   └── page.tsx      # ⬜ Revenue/usage stats
│   │       └── plans/
│   │           └── page.tsx      # ⬜ Manage pricing plans
│   │
│   ├── c/                        # ✅ Camera/capture routes (public)
│   │   ├── layout.tsx            # ✅ Camera layout
│   │   └── [slug]/
│   │       ├── page.tsx          # ✅ Camera interface
│   │       └── gallery/
│   │           └── page.tsx      # ✅ Public gallery view
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...all]/
│   │   │       └── route.ts      # ✅ Better-auth handler
│   │   ├── events/
│   │   │   ├── route.ts          # ⬜ CRUD events
│   │   │   └── [id]/
│   │   │       └── route.ts      # ⬜
│   │   ├── c/
│   │   │   └── [slug]/
│   │   │       └── route.ts      # ✅ Public event data by slug
│   │   ├── photos/
│   │   │   └── route.ts          # ✅ Upload/list photos
│   │   ├── films/
│   │   │   ├── route.ts          # ✅ Get user's films
│   │   │   ├── available/
│   │   │   │   └── route.ts      # ✅ Get available films
│   │   │   └── purchase/
│   │   │       └── route.ts      # ✅ Purchase films (mock)
│   │   ├── plans/
│   │   │   └── route.ts          # ✅ Get active plans
│   │   ├── payments/
│   │   │   ├── route.ts          # ⬜ Create checkout
│   │   │   └── webhook/
│   │   │       └── route.ts      # ⬜ PayMongo webhook
│   │   └── admin/
│   │       └── [...]/            # ⬜ Admin API routes
│   │
│   ├── layout.tsx                # ✅ Root layout
│   ├── globals.css               # ✅ Global styles (orange theme)
│   └── not-found.tsx             # ⬜ 404 page
│
├── components/
│   ├── ui/                       # ✅ shadcn/ui components
│   │   ├── alert.tsx             # ✅
│   │   ├── button.tsx            # ✅
│   │   ├── card.tsx              # ✅
│   │   ├── form.tsx              # ✅
│   │   ├── input.tsx             # ✅
│   │   ├── label.tsx             # ✅
│   │   ├── select.tsx            # ✅
│   │   └── separator.tsx         # ✅
│   ├── marketing/                # ⬜ (inline in pages for now)
│   ├── dashboard/                # ⬜ (inline in layouts for now)
│   ├── camera/                   # ✅ Camera components
│   │   ├── camera-capture.tsx    # ✅ Camera capture interface
│   │   ├── offline-indicator.tsx # ✅ Offline status indicator
│   │   ├── upload-progress.tsx   # ✅ Upload progress overlay
│   │   └── index.ts              # ✅ Exports
│   ├── forms/
│   │   ├── login-form.tsx        # ✅
│   │   ├── signup-form.tsx       # ✅
│   │   └── event-form.tsx        # ⬜
│   └── shared/                   # ⬜ Shared components
│
├── lib/
│   ├── auth.ts                   # ✅ Better-auth server config
│   ├── auth-client.ts            # ✅ Better-auth client
│   ├── prisma.ts                 # ✅ Prisma client
│   ├── image-utils.ts            # ✅ Image compression utilities
│   ├── paymongo.ts               # ⬜ PayMongo client
│   ├── utils.ts                  # ✅ Utility functions (cn)
│   └── generated/prisma/         # ✅ Generated Prisma client
│
├── hooks/                        # ✅ Custom hooks
│   ├── use-camera.ts             # ✅ Camera access hook
│   └── use-service-worker.ts     # ✅ Service worker hook
│
├── prisma/
│   ├── schema.prisma             # ✅ Database schema
│   └── seed.ts                   # ✅ Seed data (plans)
│
├── public/                       # ✅ PWA assets
│   ├── manifest.json             # ✅ PWA manifest
│   ├── sw.js                     # ✅ Service worker
│   ├── icons/                    # ✅ App icons (need actual icons)
│   └── screenshots/              # ✅ PWA screenshots
│
├── prisma.config.ts              # ✅ Prisma config
├── proxy.ts                      # ✅ Route protection
├── next.config.ts                # ✅
├── components.json               # ✅ shadcn/ui config
├── package.json                  # ✅
├── plan.md                       # ✅ This file
└── .env                          # ✅ Environment variables
```

---

## Page Specifications

### 1. Landing Page (`/`)

**Sections:**
1. **Hero**
   - Headline: "Every Angle. Every Moment. One Gallery."
   - Subheadline: "Turn your event guests into photographers. Create unforgettable memories from every perspective."
   - CTA: "Get Started" / "See Pricing"
   - Hero image: Event gallery mosaic

2. **How It Works**
   - Step 1: Create your event
   - Step 2: Share QR code with guests
   - Step 3: Guests capture moments
   - Step 4: Download your gallery

3. **Features**
   - Instant photo capture
   - No app download required (PWA)
   - Real-time gallery
   - Bulk download
   - QR code access
   - Works offline

4. **Use Cases**
   - Weddings
   - Corporate events
   - Birthdays
   - Concerts
   - Reunions

5. **Testimonials**
   - 3-4 client testimonials with photos

6. **CTA Section**
   - "Ready to capture every moment?"
   - "Start Your First Event Free" button

7. **Footer**
   - Links, social media, copyright

---

### 2. Pricing Page (`/pricing`)

**Plans:**

| Feature | Basic | Standard | Premium |
|---------|-------|----------|---------|
| Price | ₱499 | ₱999 | ₱1,999 |
| Photos | 100 | 500 | Unlimited |
| Event Duration | 1 day | 3 days | 7 days |
| Gallery Access | 7 days | 30 days | Forever |
| QR Codes | 1 | 3 | Unlimited |
| Download Quality | Standard | High | Original |
| Branding | Kodayak | Minimal | Custom |
| Support | Email | Priority | Dedicated |

**FAQ Section:**
- How does it work?
- Do guests need to download an app?
- How do I share the QR code?
- What happens after the event?
- Can I extend my event?
- What payment methods do you accept?

---

### 3. Client Dashboard (`/dashboard`)

**Components:**
- Welcome message with quick stats
- Recent events grid
- Quick action buttons (New Event, View Gallery)
- Usage meter (photos used/limit)
- Upcoming event alerts

**Stats Cards:**
- Total Events
- Total Photos
- Active Events
- Storage Used

---

### 4. Admin Dashboard (`/admin`)

**Tabs/Sections:**

1. **Overview**
   - Revenue chart (daily/weekly/monthly)
   - Active users count
   - New signups
   - Active events
   - Recent payments

2. **Clients**
   - Client list with search/filter
   - Client details modal
   - Suspend/activate clients

3. **Events**
   - All events list
   - Filter by status
   - Event details view

4. **Analytics**
   - Revenue breakdown by plan
   - Popular event times
   - Photo upload trends
   - Client retention

5. **Plans**
   - Edit plan details
   - Enable/disable plans
   - View plan performance

---

### 5. Camera Interface (`/c/[slug]`)

**Layout:**
- Full-screen camera view
- Capture button (center bottom)
- Switch camera button (front/back)
- Gallery preview thumbnail (corner)
- Event name header
- Photo count indicator

**Features:**
- Auto-focus tap
- Flash toggle
- Countdown timer option
- Photo preview after capture
- Retake/confirm buttons
- Upload progress indicator
- Offline queue badge

---

## PWA Configuration

### manifest.json
```json
{
  "name": "Kodayak - Event Camera",
  "short_name": "Kodayak",
  "description": "Capture event moments from every angle",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#E91E63",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/camera.png",
      "sizes": "1080x1920",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### Service Worker Features
- Cache static assets
- Queue photo uploads when offline
- Sync uploads when back online
- Cache event data for offline access

---

## PayMongo Integration

### Environment Variables
```env
PAYMONGO_SECRET_KEY=sk_test_xxx
PAYMONGO_PUBLIC_KEY=pk_test_xxx
PAYMONGO_WEBHOOK_SECRET=whsk_xxx
```

### Checkout Flow
1. Client selects plan
2. Create PayMongo checkout session
3. Redirect to PayMongo hosted checkout
4. PayMongo sends webhook on success
5. Update payment status
6. Create/activate event

### Webhook Events
- `checkout_session.payment.paid` - Payment successful
- `payment.failed` - Payment failed
- `payment.refunded` - Refund processed

---

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new client
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Get current session

### Events (Protected)
- `GET /api/events` - List client's events
- `POST /api/events` - Create new event
- `GET /api/events/[id]` - Get event details
- `PATCH /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

### Photos
- `POST /api/photos` - Upload photo (guest)
- `GET /api/photos?eventId=xxx` - Get event photos
- `DELETE /api/photos/[id]` - Delete photo (owner)

### Payments
- `POST /api/payments/checkout` - Create checkout session
- `POST /api/payments/webhook` - PayMongo webhook
- `GET /api/payments` - Payment history

### Admin (Admin only)
- `GET /api/admin/clients` - List all clients
- `GET /api/admin/events` - List all events
- `GET /api/admin/analytics` - Get analytics data
- `PATCH /api/admin/plans/[id]` - Update plan

---

## Implementation Phases

### Phase 1: Project Setup (Week 1) ✅ COMPLETED
- [x] Initialize Next.js project
- [x] Set up Tailwind CSS v4
- [x] Install and configure shadcn/ui
- [x] Set up Prisma with PostgreSQL
- [x] Configure better-auth
- [x] Create base layout components
- [x] Set up route protection middleware (proxy.ts)

### Phase 2: Authentication & Database (Week 1-2) ✅ COMPLETED
- [x] Implement login/signup pages
- [x] Set up OAuth (Google) - configured, needs credentials
- [x] Create database schema
- [x] Create seed file for plans
- [x] Implement session management
- [x] Run migrations (database synced)
- [x] Run seed script (pricing plans seeded)

### Phase 3: Public Pages (Week 2) ✅ COMPLETED
- [x] Build landing page
- [x] Build pricing page
- [x] Create marketing layout with header/footer
- [x] Implement responsive design
- [ ] Add animations (framer-motion optional)
- [x] About/Contact page

### Phase 4: Client Dashboard (Week 2-3) ✅ COMPLETED
- [x] Dashboard overview page (skeleton)
- [x] Events list page (skeleton)
- [x] Billing page (skeleton)
- [x] Settings page (skeleton)
- [x] Event creation form
- [x] Event details page
- [x] QR code generation
- [x] Gallery view with photo grid
- [x] Bulk download functionality

### Phase 5: Admin Dashboard (Week 3) ✅ COMPLETED
- [x] Admin layout and navigation
- [x] Admin overview page (skeleton)
- [x] Client management page (full CRUD)
- [x] Event overview page (full CRUD)
- [x] Analytics dashboard
- [x] Plan management

### Phase 6: Camera & PWA (Week 3-4) ✅ COMPLETED
- [x] PWA manifest and icons
- [x] Service worker setup
- [x] Camera capture component
- [x] Photo upload with compression
- [x] Offline queue system
- [x] Gallery real-time updates

### Phase 7: Payment Integration (Week 4)
- [ ] PayMongo account setup
- [ ] Checkout session API
- [ ] Webhook handler
- [ ] Payment status updates
- [ ] Billing history page (skeleton created)

### Phase 8: Testing & Polish (Week 4-5)
- [ ] End-to-end testing
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Error handling
- [ ] Loading states
- [ ] SEO optimization

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kodayak"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth
GOOGLE_CLIENT_ID="xxx"
GOOGLE_CLIENT_SECRET="xxx"

# PayMongo
PAYMONGO_SECRET_KEY="sk_test_xxx"
PAYMONGO_PUBLIC_KEY="pk_test_xxx"
PAYMONGO_WEBHOOK_SECRET="whsk_xxx"

# File Storage (Cloudinary/S3)
CLOUDINARY_CLOUD_NAME="xxx"
CLOUDINARY_API_KEY="xxx"
CLOUDINARY_API_SECRET="xxx"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## File Storage Options

### Recommended: Cloudinary
- Automatic image optimization
- Built-in transformations
- Generous free tier (25GB)
- Easy integration

### Alternative: Supabase Storage
- Integrated with PostgreSQL
- Simple API
- Free tier available

### Alternative: AWS S3 + CloudFront
- Scalable
- Cost-effective for high volume
- More complex setup

---

## Security Considerations

1. **Authentication**
   - Secure session management via better-auth
   - CSRF protection
   - Rate limiting on auth endpoints

2. **File Uploads**
   - Validate file types (images only)
   - Limit file sizes (10MB max)
   - Scan for malicious content
   - Unique file naming

3. **API Security**
   - Input validation with Zod
   - Role-based access control
   - API rate limiting

4. **Payment Security**
   - Verify webhook signatures
   - Never store card details
   - Log all transactions

---

## Success Metrics (MVP)

- [ ] 10 paying clients
- [ ] 50 events created
- [ ] 1000 photos uploaded
- [ ] < 3s page load time
- [ ] 95% uptime
- [ ] < 5% checkout abandonment

---

## Future Enhancements (Post-MVP)

1. **Photo Features**
   - Filters and effects
   - Photo booth mode
   - Video capture
   - GIF creation

2. **Social Features**
   - Guest comments on photos
   - Photo voting/favorites
   - Social media sharing

3. **Client Features**
   - Custom branding/themes
   - Photo moderation
   - Multiple event managers
   - API access

4. **Business Features**
   - Subscription plans
   - Print integration
   - White-label option
   - Affiliate program

---

## Notes

- Initial setup mirrors taratakbo project structure for consistency
- Mobile-first design approach
- PWA is critical for camera functionality
- Focus on simplicity for guests (no account required)
- PayMongo is the primary payment gateway (PH market)
