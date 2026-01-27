# Prompt untuk Membuat Project SaaS Attendance System

## Overview
Buatkan saya sebuah project SaaS (Software as a Service) untuk sistem manajemen kehadiran kampus yang dapat digunakan oleh multiple institusi pendidikan. Project ini akan menjadi **marketing site dan platform management** yang terpisah dari aplikasi utama attendance system yang sudah ada.

## Tech Stack (Simple & Minimal)
- **Frontend**: Next.js 14+ (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Laravel 11+ (API only)
- **Database**: MySQL/SQLite (simple, no PostgreSQL dulu)
- **Payment**: Midtrans (Indonesia market) - integration nanti
- **Email**: Laravel Mail (SMTP biasa atau Mailtrap untuk testing)
- **Storage**: Local filesystem dulu (public/storage)
- **Cache**: File-based cache (no Redis)
- **Queue**: Sync driver (no queue worker dulu)
- **Deployment**: Local development dulu, production nanti

## Struktur Project

### 1. Marketing Website (Public)
Landing page yang menarik dengan fitur:

#### Homepage (`/`)
- Hero section dengan value proposition yang jelas
- Feature highlights dengan icon dan deskripsi:
  - QR Code Attendance dengan AI Verification
  - Real-time Analytics & Reporting
  - Gamification System (Badges, Points, Leaderboard)
  - Multi-role Support (Admin, Dosen, Mahasiswa)
  - Chat & Collaboration Tools
  - Mobile-first Progressive Web App
- Social proof (testimonials, jumlah user, institusi yang pakai)
- CTA button "Start Free Trial" dan "Request Demo"
- Trusted by section (logo universitas/sekolah)

#### Pricing Page (`/pricing`)
Tiga tier pricing dengan perbandingan fitur:

**Starter Plan** - Rp 500.000/bulan
- Hingga 100 mahasiswa
- 3 dosen/admin
- Basic attendance features
- QR Code scanning
- Basic reports
- Email support

**Professional Plan** - Rp 1.500.000/bulan
- Hingga 500 mahasiswa
- 15 dosen/admin
- Semua fitur Starter +
- Gamification system
- Advanced analytics
- AI selfie verification
- Chat & collaboration
- Priority support
- Custom branding

**Enterprise Plan** - Custom pricing
- Unlimited mahasiswa & dosen
- Semua fitur Professional +
- White-label solution
- Custom domain
- API access
- Dedicated support
- SLA guarantee
- On-premise option

Tambahkan:
- Toggle annual/monthly (annual dapat diskon 20%)
- FAQ section di bawah pricing
- "Contact Sales" untuk Enterprise

#### Features Page (`/features`)
Detail lengkap semua fitur dengan:
- Screenshots/mockups dari aplikasi
- Video demo untuk fitur utama
- Use cases per role (Admin, Dosen, Mahasiswa)
- Integration capabilities

#### About Page (`/about`)
- Cerita tentang kenapa platform ini dibuat
- Team section (optional)
- Mission & vision
- Contact information

#### Blog/Resources (`/blog`)
- SEO-optimized articles tentang:
  - Best practices attendance management
  - Tips untuk dosen
  - Case studies
  - Product updates

#### Contact/Demo Request (`/contact`, `/demo`)
- Form untuk request demo
- Form untuk sales inquiry
- Live chat widget (optional: Tawk.to, Crisp)

### 2. Authentication System

#### Registration Flow (`/register`)
**Step 1: Organization Info**
- Nama institusi
- Tipe institusi (Universitas, Sekolah, Kursus, dll)
- Jumlah estimasi mahasiswa
- Email institusi
- Nomor telepon

**Step 2: Admin Account**
- Nama lengkap admin
- Email admin
- Password (dengan strength indicator)
- Konfirmasi password

**Step 3: Choose Plan**
- Pilih paket (Starter/Professional/Enterprise)
- Pilih billing cycle (monthly/annual)
- Promo code field (optional)

**Step 4: Payment**
- Integrasi Midtrans/Xendit
- Support credit card, bank transfer, e-wallet
- Invoice generation otomatis

**Step 5: Setup Wizard**
- Upload logo institusi
- Pilih color scheme (primary, secondary)
- Setup subdomain (contoh: unpam.attendify.id)
- Import data awal (optional: CSV upload mahasiswa/dosen)

Email verification setelah registrasi dengan link aktivasi.

#### Login (`/login`)
- Email + password
- "Remember me" checkbox
- Forgot password link
- Social login (optional: Google SSO)

#### Password Reset (`/forgot-password`, `/reset-password`)
- Email-based password reset
- Token expiration (1 jam)
- Password strength requirements

### 3. Dashboard Platform (Protected)

#### Super Admin Dashboard (`/admin`)
Untuk mengelola seluruh platform:

**Overview Page** (`/admin/dashboard`)
- Total revenue (monthly, annual)
- Active subscriptions count
- Total organizations
- Total users (mahasiswa + dosen)
- MRR (Monthly Recurring Revenue) chart
- Churn rate
- New signups trend
- Top performing organizations

**Organizations Management** (`/admin/organizations`)
Table dengan kolom:
- Organization name
- Subdomain
- Plan type
- Status (active, trial, suspended, cancelled)
- Users count
- MRR
- Created date
- Actions (view, edit, suspend, delete)

Fitur:
- Search & filter (by plan, status, date)
- Bulk actions
- Export to CSV
- View organization details & usage stats

**Subscriptions Management** (`/admin/subscriptions`)
- List semua subscriptions
- Filter by status (active, past_due, cancelled, trialing)
- Upcoming renewals
- Failed payments
- Manual subscription adjustment
- Refund management

**Revenue Analytics** (`/admin/revenue`)
- Revenue charts (daily, weekly, monthly, yearly)
- Revenue by plan type
- Revenue by payment method
- Lifetime value (LTV) metrics
- Customer acquisition cost (CAC)
- Churn analysis

**Users Management** (`/admin/users`)
- List semua admin institusi
- Search by name, email, organization
- User activity logs
- Impersonate user (for support)

**Support Tickets** (`/admin/support`)
- Ticket management system
- Priority levels (low, medium, high, urgent)
- Status tracking (open, in progress, resolved, closed)
- Internal notes
- Email integration

**Settings** (`/admin/settings`)
- Platform settings
- Email templates
- Payment gateway configuration
- Feature flags
- Maintenance mode
- System notifications

#### Organization Admin Dashboard (`/dashboard`)
Untuk admin institusi yang sudah subscribe:

**Overview** (`/dashboard`)
- Quick stats: total mahasiswa, dosen, attendance rate
- Recent activities
- Upcoming sessions
- Quick actions (create session, add student, etc)
- Link ke aplikasi utama (redirect ke subdomain mereka)

**Subscription Management** (`/dashboard/subscription`)
- Current plan details
- Usage statistics:
  - Mahasiswa: 45/100 (Starter plan)
  - Dosen: 2/3
  - Storage: 1.2GB/5GB
- Upgrade/downgrade plan
- Payment method management
- Billing history & invoices
- Cancel subscription

**Organization Settings** (`/dashboard/settings`)
- Organization profile (nama, logo, contact)
- Branding (colors, logo)
- Subdomain management
- Custom domain (Enterprise only)
- Integrations (API keys, webhooks)
- Team management (add/remove admins)

**Billing & Invoices** (`/dashboard/billing`)
- Payment history
- Download invoices (PDF)
- Update payment method
- Billing address

**Support** (`/dashboard/support`)
- Submit support ticket
- View ticket history
- Knowledge base / FAQ
- Contact information

### 4. Backend API (Laravel)

#### Database Schema

**organizations table**
```sql
- id (bigint, primary key)
- name (string)
- slug (string, unique) // untuk subdomain
- email (string)
- phone (string, nullable)
- type (enum: university, school, course, other)
- logo_url (string, nullable)
- primary_color (string, default: #3b82f6)
- secondary_color (string, default: #8b5cf6)
- custom_domain (string, nullable)
- status (enum: trial, active, suspended, cancelled)
- trial_ends_at (timestamp, nullable)
- settings (json, nullable) // untuk custom settings
- created_at, updated_at, deleted_at
```

**subscriptions table**
```sql
- id (bigint, primary key)
- organization_id (foreign key)
- plan_id (foreign key)
- status (enum: trialing, active, past_due, cancelled, incomplete)
- trial_ends_at (timestamp, nullable)
- current_period_start (timestamp)
- current_period_end (timestamp)
- cancel_at_period_end (boolean, default: false)
- cancelled_at (timestamp, nullable)
- created_at, updated_at
```

**plans table**
```sql
- id (bigint, primary key)
- name (string) // Starter, Professional, Enterprise
- slug (string, unique)
- description (text, nullable)
- price_monthly (decimal)
- price_annual (decimal)
- features (json) // array of features
- limits (json) // {max_students: 100, max_teachers: 3, storage_gb: 5}
- is_active (boolean, default: true)
- sort_order (integer)
- created_at, updated_at
```

**invoices table**
```sql
- id (bigint, primary key)
- organization_id (foreign key)
- subscription_id (foreign key)
- invoice_number (string, unique)
- amount (decimal)
- tax (decimal, default: 0)
- total (decimal)
- currency (string, default: IDR)
- status (enum: draft, open, paid, void, uncollectible)
- due_date (date)
- paid_at (timestamp, nullable)
- payment_method (string, nullable)
- payment_gateway_id (string, nullable) // Midtrans/Xendit transaction ID
- invoice_pdf_url (string, nullable)
- created_at, updated_at
```

**payments table**
```sql
- id (bigint, primary key)
- organization_id (foreign key)
- invoice_id (foreign key, nullable)
- amount (decimal)
- currency (string, default: IDR)
- status (enum: pending, success, failed, refunded)
- payment_method (string) // credit_card, bank_transfer, ewallet
- payment_gateway (string) // midtrans, xendit
- gateway_transaction_id (string, unique)
- gateway_response (json, nullable)
- paid_at (timestamp, nullable)
- created_at, updated_at
```

**organization_users table**
```sql
- id (bigint, primary key)
- organization_id (foreign key)
- user_id (foreign key)
- role (enum: owner, admin, billing)
- created_at, updated_at
```

**users table** (untuk admin platform & admin institusi)
```sql
- id (bigint, primary key)
- name (string)
- email (string, unique)
- email_verified_at (timestamp, nullable)
- password (string)
- is_super_admin (boolean, default: false)
- avatar_url (string, nullable)
- phone (string, nullable)
- last_login_at (timestamp, nullable)
- remember_token (string, nullable)
- created_at, updated_at, deleted_at
```

**usage_logs table** (untuk tracking usage per organization)
```sql
- id (bigint, primary key)
- organization_id (foreign key)
- metric_type (string) // students_count, teachers_count, storage_used, api_calls
- value (integer)
- recorded_at (timestamp)
- created_at
```

**support_tickets table**
```sql
- id (bigint, primary key)
- organization_id (foreign key)
- user_id (foreign key)
- subject (string)
- description (text)
- priority (enum: low, medium, high, urgent)
- status (enum: open, in_progress, resolved, closed)
- assigned_to (foreign key to users, nullable)
- resolved_at (timestamp, nullable)
- created_at, updated_at
```

**ticket_messages table**
```sql
- id (bigint, primary key)
- ticket_id (foreign key)
- user_id (foreign key)
- message (text)
- is_internal (boolean, default: false) // internal notes
- created_at, updated_at
```

**activity_logs table**
```sql
- id (bigint, primary key)
- organization_id (foreign key, nullable)
- user_id (foreign key, nullable)
- action (string) // login, subscription_created, plan_upgraded, etc
- description (text, nullable)
- ip_address (string, nullable)
- user_agent (text, nullable)
- properties (json, nullable)
- created_at
```

#### API Endpoints

**Public API (No Auth)**
- `GET /api/plans` - List semua plans
- `POST /api/register` - Register organization baru
- `POST /api/login` - Login
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password
- `GET /api/check-subdomain/{slug}` - Check subdomain availability

**Organization Admin API (Auth Required)**
- `GET /api/organization` - Get current organization details
- `PUT /api/organization` - Update organization
- `POST /api/organization/logo` - Upload logo
- `GET /api/subscription` - Get current subscription
- `POST /api/subscription/upgrade` - Upgrade plan
- `POST /api/subscription/cancel` - Cancel subscription
- `GET /api/invoices` - List invoices
- `GET /api/invoices/{id}/download` - Download invoice PDF
- `GET /api/usage` - Get usage statistics
- `POST /api/payment-method` - Update payment method
- `GET /api/team` - List team members
- `POST /api/team` - Invite team member
- `DELETE /api/team/{id}` - Remove team member
- `POST /api/support/tickets` - Create support ticket
- `GET /api/support/tickets` - List tickets
- `POST /api/support/tickets/{id}/messages` - Add message to ticket

**Super Admin API (Auth Required + Super Admin)**
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/organizations` - List all organizations
- `GET /api/admin/organizations/{id}` - Get organization details
- `PUT /api/admin/organizations/{id}` - Update organization
- `POST /api/admin/organizations/{id}/suspend` - Suspend organization
- `POST /api/admin/organizations/{id}/activate` - Activate organization
- `DELETE /api/admin/organizations/{id}` - Delete organization
- `GET /api/admin/subscriptions` - List all subscriptions
- `PUT /api/admin/subscriptions/{id}` - Update subscription
- `GET /api/admin/revenue` - Revenue analytics
- `GET /api/admin/users` - List all users
- `POST /api/admin/users/{id}/impersonate` - Impersonate user
- `GET /api/admin/support/tickets` - List all tickets
- `PUT /api/admin/support/tickets/{id}` - Update ticket
- `GET /api/admin/activity-logs` - System activity logs

**Payment Webhook**
- `POST /api/webhooks/midtrans` - Midtrans payment notification
- `POST /api/webhooks/xendit` - Xendit payment notification

#### Services/Classes

**SubscriptionService**
- `createSubscription($organization, $plan, $paymentMethod)`
- `upgradeSubscription($subscription, $newPlan)`
- `downgradeSubscription($subscription, $newPlan)`
- `cancelSubscription($subscription, $immediately = false)`
- `resumeSubscription($subscription)`
- `checkUsageLimits($organization)` // cek apakah melebihi limit plan

**PaymentService**
- `createPaymentIntent($amount, $organization)`
- `processPayment($paymentIntent, $paymentMethod)`
- `handleWebhook($provider, $payload)`
- `refundPayment($payment, $amount = null)`

**InvoiceService**
- `generateInvoice($subscription, $period)`
- `generateInvoiceNumber()`
- `generateInvoicePDF($invoice)`
- `sendInvoiceEmail($invoice)`

**UsageTrackingService**
- `recordUsage($organization, $metricType, $value)`
- `getUsageStats($organization, $period = 'month')`
- `checkLimitExceeded($organization, $metricType)`

**OnboardingService**
- `createOrganization($data)`
- `setupSubdomain($organization, $slug)`
- `sendWelcomeEmail($organization, $user)`
- `createInitialData($organization)` // create default settings, etc

**NotificationService**
- `sendTrialEndingNotification($organization, $daysLeft)`
- `sendPaymentFailedNotification($organization, $invoice)`
- `sendSubscriptionCancelledNotification($organization)`
- `sendInvoiceNotification($organization, $invoice)`

#### Jobs/Queues (SKIP DULU - Pakai Sync)

**Nanti kalau sudah production baru implement:**
- Daily cron jobs untuk check trial expiration
- Invoice generation
- Email notifications (kirim langsung dulu, no queue)
- Usage tracking (real-time dulu)

### 5. Frontend Components (Next.js)

#### Reusable Components
- `PricingCard` - Card untuk pricing plans
- `FeatureComparison` - Table perbandingan fitur
- `TestimonialCard` - Card untuk testimonials
- `StatsCounter` - Animated counter untuk statistics
- `PlanBadge` - Badge untuk plan type (Starter, Pro, Enterprise)
- `UsageProgress` - Progress bar untuk usage limits
- `InvoiceTable` - Table untuk list invoices
- `PaymentMethodCard` - Card untuk payment method
- `SupportTicketCard` - Card untuk support tickets
- `ActivityTimeline` - Timeline untuk activity logs

#### Forms
- `OrganizationRegistrationForm` - Multi-step registration
- `LoginForm` - Login form dengan validation
- `PaymentForm` - Payment form dengan Midtrans/Xendit integration
- `OrganizationSettingsForm` - Update organization settings
- `SupportTicketForm` - Create support ticket
- `TeamInviteForm` - Invite team member

#### Layouts
- `MarketingLayout` - Layout untuk public pages (navbar, footer)
- `DashboardLayout` - Layout untuk dashboard (sidebar, header)
- `AuthLayout` - Layout untuk auth pages (centered, minimal)

### 6. Features & Functionality

#### Email Notifications
Setup email templates untuk:
- Welcome email setelah registrasi
- Email verification
- Trial ending reminder (7 days, 3 days, 1 day before)
- Payment successful receipt
- Payment failed notification
- Invoice generated
- Subscription cancelled confirmation
- Password reset
- Team invitation
- Support ticket updates

#### Payment Integration

**Midtrans Integration (Phase 3)**
- Snap payment (popup) - paling simple
- Support credit card, bank transfer, e-wallet
- Webhook untuk payment notification
- Manual recurring billing dulu (no auto-charge)

#### Security Features
- Rate limiting pada API
- CSRF protection
- XSS prevention
- SQL injection prevention
- Password hashing (bcrypt)
- JWT token untuk API authentication
- API key untuk webhook verification
- 2FA untuk super admin (optional)

#### SEO Optimization (BASIC DULU)
- Meta tags untuk semua pages
- Open Graph tags (basic)
- Robots.txt
- Nanti baru sitemap & structured data

#### Analytics Integration (SKIP DULU)
- Nanti baru integrate Google Analytics
- Focus ke functionality dulu

### 7. Deployment & DevOps

#### Environment Variables (Minimal)
```env
# App
APP_NAME="Attendify"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Database (SQLite untuk development)
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite

# Atau MySQL
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=attendify_saas
# DB_USERNAME=root
# DB_PASSWORD=

# Email (pakai Mailtrap untuk testing)
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=noreply@attendify.test
MAIL_FROM_NAME="${APP_NAME}"

# Payment (nanti aja)
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# Cache & Queue (simple)
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
```

#### CI/CD Pipeline (SKIP DULU)
Manual deployment dulu, nanti baru setup automation

#### Monitoring (SKIP DULU)
Pakai Laravel log file dulu, nanti baru integrate monitoring tools

### 8. Documentation

Buat dokumentasi lengkap:

**User Documentation**
- Getting started guide
- Admin guide (organization admin)
- Billing & subscription guide
- FAQ
- Video tutorials

**Developer Documentation**
- API documentation (Swagger/OpenAPI)
- Webhook documentation
- Integration guide
- Code examples

**Internal Documentation**
- Architecture overview
- Database schema
- Deployment guide
- Troubleshooting guide

### 9. Testing (MINIMAL DULU)

**Backend Testing (Laravel)**
- Manual testing dulu via Postman/Insomnia
- Nanti baru buat automated tests

**Frontend Testing (Next.js)**
- Manual testing di browser
- Nanti baru implement automated testing

### 10. Launch Checklist

**Pre-Launch**
- [ ] All features implemented & tested
- [ ] Payment gateway tested (sandbox & production)
- [ ] Email templates reviewed
- [ ] SEO optimization completed
- [ ] Analytics setup
- [ ] Legal pages (Terms, Privacy Policy, Refund Policy)
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Performance optimization
- [ ] Security audit
- [ ] Backup strategy implemented

**Launch**
- [ ] Soft launch ke beta users
- [ ] Collect feedback
- [ ] Fix critical bugs
- [ ] Public launch
- [ ] Marketing campaign
- [ ] Monitor errors & performance

**Post-Launch**
- [ ] Customer support setup
- [ ] Regular backups
- [ ] Monthly security updates
- [ ] Feature updates based on feedback
- [ ] Marketing & growth activities

## Design Guidelines

**Brand Identity**
- Modern, professional, trustworthy
- Color scheme: Blue (trust) + Purple (innovation)
- Clean, minimalist design
- Mobile-first approach

**UI/UX Principles**
- Simple & intuitive navigation
- Clear CTAs
- Fast loading times
- Responsive design
- Accessibility (WCAG 2.1 AA)
- Consistent spacing & typography
- Smooth animations & transitions

**Inspiration**
- Stripe (payment & dashboard)
- Vercel (clean design)
- Linear (modern SaaS)
- Notion (onboarding flow)

## Success Metrics

**Business Metrics**
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn rate
- Conversion rate (visitor → trial → paid)
- Average Revenue Per User (ARPU)

**Product Metrics**
- Active organizations
- Total users (mahasiswa + dosen)
- Feature adoption rate
- Support ticket volume
- System uptime
- Page load time

## Timeline Estimate (Simplified)

**Phase 1: Core MVP (2-3 weeks)**
- Marketing website (homepage, pricing, features)
- Registration & login (simple, no payment dulu)
- Organization dashboard (basic)
- Super admin dashboard (basic)
- Database & API setup

**Phase 2: Essential Features (1-2 weeks)**
- Organization settings (logo, branding)
- Usage tracking (simple counter)
- Basic analytics
- Email notifications (welcome, verification)

**Phase 3: Payment Integration (1 week)**
- Midtrans integration
- Subscription management
- Invoice generation (simple)

**Phase 4: Polish (1 week)**
- UI/UX improvements
- Bug fixes
- Basic documentation

**Total: 5-7 weeks untuk MVP yang bisa jalan**

## Budget Estimate (Development Phase)

**Development (Local)**
- $0 - Semua gratis (local development)
- Mailtrap free tier untuk email testing
- SQLite untuk database

**Nanti Production:**
- Domain: ~$15/year
- Shared hosting atau VPS: $5-20/month
- Email: pakai SMTP biasa
- Payment gateway fees: 2-3% per transaction

**Total Development Cost**: $0 (gratis)

## Next Steps (Development Focus)

1. **Setup Project Structure**
   - Create Laravel project: `composer create-project laravel/laravel attendify-saas-api`
   - Create Next.js project: `npx create-next-app@latest attendify-saas-web`
   - Setup Git repository

2. **Database Setup**
   - Create migrations untuk semua tables
   - Setup seeders untuk plans & initial data
   - Test migrations

3. **Backend API Development**
   - Setup authentication (Laravel Sanctum)
   - Create models & relationships
   - Build API endpoints (auth, organizations, subscriptions)
   - Test dengan Postman

4. **Frontend Development**
   - Setup shadcn/ui components
   - Build marketing pages (homepage, pricing)
   - Build auth pages (login, register)
   - Build dashboards (organization admin, super admin)
   - Connect to API

5. **Payment Integration (Later)**
   - Integrate Midtrans Snap
   - Test payment flow
   - Handle webhooks

6. **Testing & Polish**
   - Manual testing semua flow
   - Fix bugs
   - UI/UX improvements

---

## Development Priority

**MUST HAVE (Phase 1):**
- ✅ Marketing homepage
- ✅ Pricing page
- ✅ Registration (tanpa payment dulu)
- ✅ Login/logout
- ✅ Organization dashboard (basic)
- ✅ Super admin dashboard (basic)
- ✅ Database & API

**SHOULD HAVE (Phase 2):**
- ✅ Organization settings (logo, branding)
- ✅ Usage tracking
- ✅ Email notifications
- ✅ Subscription management UI

**NICE TO HAVE (Phase 3):**
- ✅ Payment integration
- ✅ Invoice generation
- ✅ Support tickets
- ✅ Advanced analytics

**SKIP FOR NOW:**
- ❌ Redis, AWS, S3
- ❌ Advanced monitoring
- ❌ CI/CD automation
- ❌ Multiple payment gateways
- ❌ White-label features
- ❌ API marketplace
- ❌ Advanced SEO
- ❌ Analytics integration

---

## Notes Penting

- Project ini TERPISAH dari aplikasi attendance utama
- Aplikasi attendance utama akan di-deploy per subdomain (unpam.attendify.id, ui.attendify.id, dll)
- SaaS platform ini hanya untuk marketing, registration, billing, dan management
- Setelah organization subscribe, mereka akan diarahkan ke subdomain mereka sendiri yang menjalankan aplikasi attendance utama
- Perlu setup reverse proxy atau load balancer untuk handle multiple subdomains
- Consider menggunakan Docker untuk deployment aplikasi attendance per organization

## Integration dengan Aplikasi Utama

Aplikasi attendance utama perlu modifikasi minimal:
1. Tambah middleware untuk check organization_id dari subdomain
2. Tambah API endpoint untuk check subscription status
3. Filter semua data berdasarkan organization_id
4. Redirect ke billing page jika subscription expired
5. Show usage limits di dashboard

Buat API bridge antara SaaS platform dan aplikasi utama untuk:
- Verify subscription status
- Check usage limits
- Sync organization settings (logo, colors, etc)
- Track usage metrics

---

**Apakah prompt ini sudah cukup detail? Ada yang perlu ditambahkan atau diperjelas?**
