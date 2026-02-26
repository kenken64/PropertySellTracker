# PropertySellTracker — Feature Progress

## ✅ Completed

### Core Features
- [x] Input purchase price, date, stamp duty, reno costs, agent fees
- [x] Track current market value (manual input)
- [x] Auto-calculate: net profit, ROI %, annualized return
- [x] BSD (Buyer's Stamp Duty) auto-calculation
- [x] Total cost analysis (all-in cost breakdown)
- [x] Break-even selling price calculator

### SSD (Seller's Stamp Duty)
- [x] SSD calculator page
- [x] SSD countdown timer (days to next tier)
- [x] SSD rates: 12% → 8% → 4% → 0%

### Financial Tracking
- [x] CPF accrued interest calculation (2.5% compounded)
- [x] Mortgage interest cost tracking
- [x] Transaction history per property

### Visualizations
- [x] Interactive charts (property value projections via Recharts)
- [x] Dashboard overview with portfolio summary
- [x] Property detail page with tabs

### Authentication & Security
- [x] NextAuth.js v5 with JWT + Credentials provider
- [x] User registration & login pages
- [x] bcrypt password hashing
- [x] User-scoped data (each user sees only their properties)
- [x] Middleware route protection
- [x] Password show/hide toggle

### UI/UX
- [x] Professional modern design (shadcn/ui + Tailwind)
- [x] Dark/light mode with system preference detection
- [x] Fully mobile responsive (320px+)
- [x] Sticky navigation with hamburger menu
- [x] Card-based layout with hover effects
- [x] Footer

### Infrastructure
- [x] Next.js 16 (App Router)
- [x] Neon Postgres (serverless)
- [x] Deployed on Vercel
- [x] API documentation in README

---

### Data Integration & Analytics
- [x] HDB Resale Data page (`/hdb-resale`) with data.gov.sg API
- [x] MAS Interest Rates dashboard card
- [x] Rental Yield calculator (gross/net)
- [x] Sell Now vs Hold analysis tab on property detail

## 🔨 In Progress
_(nothing currently)_

---

## 📋 Planned — Data Sources & Integrations

### Priority 1 — Easy Wins
- [x] **HDB resale data** — Pull from data.gov.sg (free API), search by town/flat type ✅
- [x] **MAS interest rate tracking** — Dashboard card with current rates vs mortgage comparison ✅
- [ ] **SSD-free date reminder** — Telegram notification when property becomes SSD-exempt

### Priority 2 — High Value
- [x] **Sell now vs hold comparison** — Side-by-side analysis with SSD savings, appreciation projections ✅
- [x] **Rental yield calculator** — Monthly rental input, gross/net yield on property detail ✅
- [ ] **Target profit alerts** — Set target profit % → alert when market value hits target
- [ ] **Telegram bot for alerts** — Push notifications for price changes, SSD milestones

### Priority 3 — Advanced
- [ ] **URA REALIS API** — Actual transaction prices for condos/landed
- [ ] **Nearby transaction alerts** — "A unit in your block just sold for $X"
- [ ] **PropertyGuru/99.co comparison** — Current listings for valuation reference
- [ ] **Market trends dashboard** — Price index charts, volume trends by area

---

## 📋 Planned — App Features

### Property Management
- [ ] Property comparison tools (side-by-side)
- [ ] Property photos upload
- [ ] Export/import data (CSV/PDF)
- [ ] Automated valuation updates (from data sources)

### Auth & Users
- [ ] OAuth providers (Google, GitHub)
- [ ] Password reset / forgot password
- [ ] User profile page

### Monetization
- [ ] Free tier: 1 property tracking
- [ ] Pro tier ($5-8/mo): unlimited properties, advanced analytics, alerts
- [ ] Payment integration (Stripe)

---

## 📊 Tech Debt & Improvements
- [ ] Migrate middleware.ts to proxy (Next.js 16 deprecation warning)
- [ ] Add unit tests for calculation functions
- [ ] Add E2E tests (Playwright)
- [ ] Refactor shared Stockfish/AI logic (if chess bot integrated)
- [ ] Rate limiting on auth endpoints
- [ ] Input validation with Zod on all API routes

---

_Last updated: 2026-02-26_
