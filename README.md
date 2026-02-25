# Singapore Property Sell Tracker 🏠

A comprehensive web application for tracking Singapore property investments, calculating Seller's Stamp Duty (SSD), and analyzing profit/loss projections.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.2.1-38bdf8) ![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003b57)

## ✨ Features

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

### 🌙 Additional Features
- **Dark/Light Mode**: Full theme support with system preference detection
- **Mobile Responsive**: Optimized for all device sizes
- **Singapore-Specific**: BSD rates, ABSD reference, SGD formatting
- **Data Persistence**: SQLite database with better-sqlite3

## 🚀 Tech Stack

- **Frontend**: Next.js 16.1.6 (App Router), React 19.2.4, TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.2.1, shadcn/ui components
- **Database**: SQLite with better-sqlite3 12.6.2
- **Charts**: Recharts 2.15.0
- **Forms**: React Hook Form 7.55.0 with Zod validation
- **Icons**: Lucide React 0.575.0
- **Theme**: next-themes 0.4.7

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
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

### 3. Seed Sample Data (Optional)
```bash
npm run seed
```

This will create a SQLite database with sample properties including:
- Toa Payoh HDB 4-Room
- Clementi Condominium  
- Punggol BTO 5-Room
- Bukit Timah Landed Property
- Jurong West HDB 3-Room

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

## 📁 Project Structure

```
PropertySellTracker/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   │   └── properties/          # Property CRUD endpoints
│   ├── add-property/            # Add property page
│   ├── property/[id]/           # Property detail page
│   ├── ssd-calculator/          # SSD calculator page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Dashboard/homepage
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── theme-provider.tsx       # Theme context provider
│   └── theme-toggle.tsx         # Dark/light mode toggle
├── lib/                         # Utilities and database
│   ├── database.ts              # SQLite database setup
│   └── utils.ts                 # Utility functions & calculations
├── scripts/                     # Database scripts
│   └── seed.js                  # Sample data seeding
└── property-tracker.db          # SQLite database (created on first run)
```

## 🏦 Singapore Property Calculations

### Buyer's Stamp Duty (BSD)
- First $180,000: 1%
- Next $180,000: 2%
- Next $640,000: 3%
- Remainder: 4%

### Seller's Stamp Duty (SSD)
- **Year 1**: 12% of selling price
- **Year 2**: 8% of selling price  
- **Year 3**: 4% of selling price
- **3+ Years**: 0% (SSD exempt)

### CPF Accrued Interest
- **Rate**: 2.5% per annum (compounded)
- **Applies to**: CPF amounts used for property purchase
- **Repayment**: Required when selling property

## 🎯 Usage Examples

### Adding a Property
1. Navigate to "Add Property"
2. Fill in property details (name, address, type)
3. Enter purchase price and date
4. System auto-calculates BSD
5. Add renovation costs, agent fees, mortgage details
6. Set initial current value

### Tracking Performance
- **Dashboard**: Overview of all properties with P&L
- **Property Detail**: Comprehensive financial analysis
- **SSD Status**: Live countdown and rate information
- **Charts**: Value projection and historical trends

### SSD Calculator
1. Enter selling price and purchase date
2. Get instant SSD calculation
3. View breakdown of selling costs
4. See timeline to next SSD tier
5. Calculate potential savings by waiting

## 🔐 Security & Dependencies

All dependencies are pinned to their latest stable versions as of February 2026:
- **Next.js**: 16.1.6 (latest security patches)
- **React**: 19.2.4 (latest stable)
- **TypeScript**: 5.9.3 (latest stable)
- All other dependencies updated to latest secure versions

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

## 🐛 Issues & Support

If you encounter any issues or have questions:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## 🚧 Roadmap

- [ ] Property comparison tools
- [ ] Rental yield calculations
- [ ] Market trends integration
- [ ] Export/import functionality
- [ ] Multi-user support
- [ ] Property photos upload
- [ ] Automated valuation updates

---

Built with ❤️ for Singapore property investors