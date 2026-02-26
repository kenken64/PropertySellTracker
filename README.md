# Singapore Property Sell Tracker 🏠

A comprehensive web application for tracking Singapore property investments, calculating Seller's Stamp Duty (SSD), and analyzing profit/loss projections — with secure multi-user authentication.

**Live Demo:** [https://property-sell-tracker.vercel.app](https://property-sell-tracker.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.2.1-38bdf8) ![Neon Postgres](https://img.shields.io/badge/Neon-Postgres-00e599) ![NextAuth](https://img.shields.io/badge/NextAuth-v5-purple)

## ✨ Features

### 🔐 Authentication & Security
- **JWT Authentication**: NextAuth.js v5 with Credentials provider
- **User Registration & Login**: Secure sign-up with bcrypt password hashing
- **User-scoped Data**: Each user sees only their own properties
- **Protected Routes**: Middleware-based route protection
- **Password Visibility Toggle**: Show/hide password on login & register forms

### 🏡 Property Management
- **Add Properties**: Track HDB, Condominium, and Landed properties
- **Comprehensive Cost Tracking**: Purchase price, stamp duty, renovation, agent fees, mortgage details
- **CPF Usage Tracking**: Monitor CPF amounts used with accrued interest at 2.5%
- **Real-time Valuation**: Update current market values and track appreciation

### 📊 Financial Analytics
- **Profit/Loss Analysis**: Real-time calculation of net profit/loss
- **ROI & Returns**: ROI percentage and annualized return calculations
- **Total Cost Analysis**: Comprehensive cost breakdown including mortgage interest paid
- **Break-even Calculator**: Determine break-even selling price including SSD

### 🕐 SSD (Seller's Stamp Duty) Features
- **Live SSD Calculator**: Calculate current SSD based on holding period
- **Countdown Timer**: Track days remaining to next SSD tier
- **SSD Rates**: 12% (Year 1), 8% (Year 2), 4% (Year 3), 0% (3+ years)
- **Sell Now Analysis**: Compare current vs future selling scenarios

### 📈 Visualizations & Projections
- **Interactive Charts**: Property value projections using Recharts
- **Dashboard Overview**: Portfolio summary with key metrics
- **Historical Tracking**: Transaction history and property timeline

### 🎨 UI/UX
- **Professional Design**: Modern, clean interface with cohesive color palette
- **Dark/Light Mode**: Full theme support with system preference detection
- **Fully Mobile Responsive**: Optimized for all device sizes (320px+)
- **Sticky Navigation**: Responsive header with hamburger menu on mobile
- **Card-based Layout**: Shadows, hover effects, and smooth transitions

## 🚀 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.1.6 (App Router) |
| **Language** | TypeScript 5.9.3 |
| **UI** | React 19.2.4, Tailwind CSS 4.2.1, shadcn/ui |
| **Database** | Neon Postgres (serverless) |
| **Auth** | NextAuth.js v5 (JWT + Credentials) |
| **Password Hashing** | bcryptjs |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod validation |
| **Icons** | Lucide React |
| **Theme** | next-themes |
| **Deployment** | Vercel |

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- A [Neon](https://neon.tech) Postgres database
- Git

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/kenken64/PropertySellTracker.git
cd PropertySellTracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Copy the example env file and fill in your values:
```bash
cp .env.example .env.local
```

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon Postgres connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `NEXTAUTH_SECRET` | JWT signing secret | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app URL | `http://localhost:3000` |
| `AUTH_TRUST_HOST` | Trust the host header | `true` |

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — tables are auto-created on first API call.

### 5. Build for Production
```bash
npm run build
npm start
```

## 🌐 Deploy to Vercel

1. Push your repo to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

Or via CLI:
```bash
npm i -g vercel
vercel link
echo "your-secret" | vercel env add NEXTAUTH_SECRET production
echo "https://your-app.vercel.app" | vercel env add NEXTAUTH_URL production
echo "true" | vercel env add AUTH_TRUST_HOST production
echo "your-neon-connection-string" | vercel env add DATABASE_URL production
vercel --prod
```

## 📡 API Endpoints

All API routes require authentication (JWT). Responses are JSON.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/callback/credentials` | Login (via NextAuth) |
| GET | `/api/auth/session` | Get current session |
| POST | `/api/auth/signout` | Sign out |

**Register** `POST /api/auth/register`
```json
{
  "name": "Kenneth Phang",
  "email": "ken@example.com",
  "password": "securepassword"
}
```
Response: `201` on success, `400` for validation errors, `409` if email exists.

### Properties (User-scoped)

All property endpoints filter by the authenticated user's ID.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | List all properties for current user |
| POST | `/api/properties` | Create a new property |
| GET | `/api/properties/[id]` | Get property detail + transactions |
| PUT | `/api/properties/[id]` | Update a property |
| DELETE | `/api/properties/[id]` | Delete a property |

**Create Property** `POST /api/properties`
```json
{
  "name": "Ang Mo Kio Blk 333",
  "address": "Ang Mo Kio Ave 1",
  "type": "HDB",
  "purchase_price": 350000,
  "purchase_date": "2024-01-15",
  "stamp_duty": 5200,
  "renovation_cost": 50000,
  "agent_fees": 5000,
  "current_value": 380000,
  "cpf_amount": 250000,
  "mortgage_amount": 200000,
  "mortgage_interest_rate": 3.0,
  "mortgage_tenure": 25
}
```
Response: `201` with created property object. BSD is auto-calculated if `stamp_duty` is not provided.

**Get Property** `GET /api/properties/[id]`

Response includes property data + `transactions` array:
```json
{
  "id": 1,
  "name": "Ang Mo Kio Blk 333",
  "type": "HDB",
  "purchase_price": 350000,
  "current_value": 380000,
  "transactions": [
    {
      "id": 1,
      "type": "purchase",
      "amount": 350000,
      "description": "Initial property purchase",
      "date": "2024-01-15"
    }
  ]
}
```

**Update Property** `PUT /api/properties/[id]`

Same body as create. Returns updated property object.

**Delete Property** `DELETE /api/properties/[id]`

Response: `{ "success": true }`

### Error Responses

| Status | Description |
|--------|-------------|
| 401 | Unauthorized (not logged in or invalid session) |
| 404 | Property not found (or belongs to another user) |
| 400 | Validation error |
| 500 | Server error |

## 📁 Project Structure

```
PropertySellTracker/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   │   ├── auth/                # Auth endpoints
│   │   │   ├── [...nextauth]/   # NextAuth handler
│   │   │   └── register/        # User registration
│   │   └── properties/          # Property CRUD (user-scoped)
│   ├── add-property/            # Add property page
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── property/[id]/           # Property detail page
│   ├── ssd-calculator/          # SSD calculator page
│   ├── globals.css              # Global styles & theme
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Dashboard/homepage
├── components/                   # React components
│   ├── ui/                      # shadcn/ui + custom components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── password-input.tsx   # Password with show/hide toggle
│   │   ├── select.tsx
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   └── label.tsx
│   ├── session-provider.tsx     # NextAuth session provider
│   ├── site-header.tsx          # Responsive header with auth
│   ├── theme-provider.tsx       # Theme context provider
│   └── theme-toggle.tsx         # Dark/light mode toggle
├── lib/                         # Utilities and database
│   ├── auth.ts                  # NextAuth configuration
│   ├── database.ts              # Neon Postgres setup & schema
│   └── utils.ts                 # Utility functions & calculations
├── types/                       # TypeScript type augmentations
│   └── next-auth.d.ts           # NextAuth session types
├── middleware.ts                 # Route protection middleware
└── .env.example                 # Environment variables template
```

## 🗄️ Database Schema

### Users
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| email | TEXT | Unique email |
| name | TEXT | Display name |
| password_hash | TEXT | bcrypt hash |
| created_at | TIMESTAMP | Registration date |

### Properties
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| user_id | INTEGER | FK to users |
| name | TEXT | Property name |
| address | TEXT | Address |
| type | TEXT | HDB/Condo/Landed |
| purchase_price | REAL | Purchase price |
| purchase_date | TEXT | Date of purchase |
| stamp_duty | REAL | BSD amount |
| renovation_cost | REAL | Renovation costs |
| agent_fees | REAL | Agent fees |
| current_value | REAL | Current market value |
| cpf_amount | REAL | CPF used |
| mortgage_amount | REAL | Mortgage amount |
| mortgage_interest_rate | REAL | Interest rate % |
| mortgage_tenure | INTEGER | Tenure in years |

### Transactions
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| property_id | INTEGER | FK to properties |
| type | TEXT | purchase/sale/expense |
| amount | REAL | Transaction amount |
| description | TEXT | Description |
| date | TEXT | Transaction date |

## 🏦 Singapore Property Calculations

### Buyer's Stamp Duty (BSD)
| Property Value | Rate |
|---------------|------|
| First $180,000 | 1% |
| Next $180,000 | 2% |
| Next $640,000 | 3% |
| Remainder | 4% |

### Seller's Stamp Duty (SSD)
| Holding Period | Rate |
|---------------|------|
| Year 1 | 12% |
| Year 2 | 8% |
| Year 3 | 4% |
| 3+ Years | 0% |

### CPF Accrued Interest
- **Rate**: 2.5% per annum (compounded)
- **Applies to**: CPF amounts used for property purchase
- **Repayment**: Required when selling property

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This application provides estimates only. Property calculations, SSD rates, and tax implications may vary based on specific circumstances and current regulations. Always consult with qualified professionals for accurate advice.

**Not Financial Advice**: This tool is for informational purposes only and should not be considered as financial or investment advice.

## 🚧 Roadmap

- [x] Multi-user authentication (JWT)
- [x] Neon Postgres database
- [x] Mobile responsive UI
- [x] Dark/light mode
- [ ] Property comparison tools
- [ ] Rental yield calculations
- [ ] Market trends integration
- [ ] Export/import functionality
- [ ] Property photos upload
- [ ] Automated valuation updates
- [ ] OAuth providers (Google, GitHub)

---

Built with ❤️ for Singapore property investors
