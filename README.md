# AZ Business Services - Arizona Business Directory

A professional business directory platform for Arizona service providers, featuring AI-powered content enhancement, exclusive lead generation, and predictable pricing that outcompetes traditional lead generation platforms like Thumbtack and Angi.

## 🏢 Business Overview

**AZ Business Services** positions itself as the professional alternative to expensive lead generation platforms by offering:

- **Predictable monthly pricing** vs $80-100 per shared lead
- **Exclusive lead delivery** (not shared with 3-5 competitors)  
- **AI-enhanced professional presentation** vs basic directory listings
- **Complete business growth package** with credibility, visibility, and lead generation

## 💰 Three-Tier Pricing Strategy

| Tier        | Monthly | Annual (25% off) | Target Customer                              | Core Value                                             |
| ----------- | ------- | ---------------- | -------------------------------------------- | ------------------------------------------------------ |
| **Starter** | $9      | $7/mo ($81/yr)   | New businesses wanting immediate credibility | Professional presence with AI summary & verification   |
| **Pro**     | $29     | $22/mo ($264/yr) | Growing businesses needing enhanced control  | Featured placement + editable content + enhanced visibility |
| **Power**   | $97     | $73/mo ($876/yr) | Established businesses ready for lead generation | Unlimited exclusive leads + homepage featuring + complete growth package |

### 🎯 Competitive Advantages

- **Lead Exclusivity**: Only Power tier customers compete for leads (no sharing with multiple contractors)
- **Value Delivery**: $1000+/month worth of tools and services for $97/month
- **AI Enhancement**: Professional content generation and business intelligence
- **Local Focus**: Arizona-specific optimization and community building
- **SEO Benefits**: Direct backlinks to customer websites included

## 🚀 Features by Tier

### Starter Plan ($9/month)
- ✅ Professional business listing in Arizona's directory
- ✅ AI-generated business summary (fixed)
- ✅ Verification badge for instant credibility
- ✅ SEO backlink to your website
- ✅ Google reviews display (3 reviews)
- ✅ Basic service presentation (bullet points)
- ❌ No lead generation (contact form disabled)

### Pro Plan ($29/month)
**Everything in Starter PLUS:**
- ✅ Editable AI business summary (full control)
- ✅ Featured category placement
- ✅ Enhanced service cards with descriptions
- ✅ Extended review display (10 reviews)
- ✅ Active badge system
- ✅ Content editing control
- ❌ No lead generation (maintains Power tier exclusivity)

### Power Plan ($97/month)
**Everything in Pro PLUS:**
- ✅ **Unlimited exclusive lead generation**
- ✅ Homepage featured placement (rotating premium visibility)
- ✅ Professional image gallery
- ✅ AI review analysis and sentiment insights
- ✅ Business intelligence and competitive analysis
- ✅ Unlimited review display
- ✅ Priority customer support
- ✅ Advanced analytics and performance tracking

## 🛠️ Tech Stack

### Frontend
- **React Router v7** - Full-stack React framework with SSR
- **TailwindCSS v4** - Modern utility-first CSS with Desert Bloom color palette
- **shadcn/ui** - Professional component library
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization for analytics

### Backend & Services
- **Convex** - Real-time database and serverless functions
- **Clerk** - Authentication and user management
- **Polar.sh** - Subscription billing and payments
- **OpenAI GPT-4** - AI content generation and enhancement
- **Google My Business API** - Business verification and data

### Deployment
- **Vercel** - Production hosting and deployment
- **TypeScript** - Type safety throughout
- **Vite** - Fast build tool and development

## 🏗️ Architecture Overview

### Key Components

#### Business Profile System
- **Single-page layout** with professional overview, services, reviews, and insights
- **Plan-based feature gating** with contextual upgrade prompts
- **AI content enhancement** for professional presentation
- **Review intelligence** with sentiment analysis and keyword extraction

#### Homepage Experience
- **Hero section** with customer search functionality
- **Plan comparison cards** focusing on Starter + Power tiers
- **Competitive comparison table** vs Thumbtack/Angi
- **AI showcase** with real examples of Professional Overview, Business Insights, and Review Intelligence
- **Featured businesses** section
- **FAQ section** with verification and pricing details

#### Business Claiming System
- **Unified claiming flow** from discovery to plan selection
- **Smart duplicate detection** prevents unnecessary business creation
- **GMB OAuth integration** for instant verification
- **Document upload verification** as alternative method
- **Post-claim onboarding** with welcome screen and next steps
- **Seamless plan selection** with competitive advantages highlighted

#### Admin Dashboard
- **Business claim moderation** with GMB OAuth verification
- **User management** with role-based permissions
- **Analytics and reporting** with MRR/ARR tracking
- **Platform health monitoring** and performance metrics

## 📁 Project Structure

```
app/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   ├── business/              # Business profile components
│   │   ├── single-page-business-profile.tsx    # Main profile layout
│   │   ├── disabled-contact-form.tsx           # Lead capture form
│   │   └── tabs/              # Tab content (Overview, Services, Reviews, Insights)
│   ├── homepage/              # Homepage sections
│   │   ├── hero.tsx           # Customer search interface
│   │   ├── cta-cards.tsx      # Plan comparison cards
│   │   ├── comparison-table.tsx # vs Competition table
│   │   ├── ai-showcase.tsx    # AI capabilities showcase
│   │   └── featured-businesses.tsx
│   ├── admin/                 # Admin dashboard components
│   └── FeatureGate.tsx        # Plan-based feature visibility
├── routes/
│   ├── admin/                 # Admin dashboard routes
│   ├── [$category].[$city].[$businessName].tsx  # Business detail pages
│   ├── home.tsx               # Homepage
│   ├── pricing.tsx            # Pricing page
│   └── about.tsx              # About page
└── hooks/
    ├── usePlanFeatures.ts     # Feature detection
    └── useAnalyticsTracking.ts # Event tracking

convex/
├── businesses.ts              # Business data management
├── businessClaims.ts          # Claim verification system
├── users.ts                   # User management
├── makeAdmin.ts               # Admin access controls
└── schema.ts                  # Database schema
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Clerk account for authentication
- Convex account for database
- Polar.sh account for subscriptions
- OpenAI API key for AI features

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd azbusiness
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Configure your `.env.local`:
```bash
# Convex Configuration
CONVEX_DEPLOYMENT=your_convex_deployment
VITE_CONVEX_URL=your_convex_url

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Polar.sh Billing
POLAR_ACCESS_TOKEN=your_polar_token
POLAR_ORGANIZATION_ID=your_polar_org_id

# OpenAI for AI Features
OPENAI_API_KEY=your_openai_key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

3. **Start development servers:**
```bash
# Terminal 1: Start Convex backend (REQUIRED - run first)
npx convex dev

# Terminal 2: Start React frontend
npm run dev
```

4. **Access the application:**
- **Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin
- **Convex Dashboard**: Check terminal output for dashboard URL

## 🔧 Development Workflow

### Essential Commands

```bash
# Development
npm run dev                    # Start frontend development server
npx convex dev                 # Start Convex backend (run first)

# Build & Deploy
npm run build                  # Production build
npm run typecheck              # TypeScript validation

# Data Management
npm run import-csv             # Import business data
npm run migrate-urls           # Update business URL structure
npm run featured-businesses    # Manage featured listings
```

### Important Notes

- **Always run both servers**: Convex backend AND React frontend
- **Admin access**: Use `/admin` routes for business management
- **Feature testing**: Verify plan-tier restrictions and upgrade flows
- **AI integration**: OpenAI GPT-4 powers all content enhancement features

## 📊 Business Model & Revenue

### Revenue Targets (Year 1)
- **500 Starter customers**: $4,500 MRR
- **200 Pro customers**: $5,800 MRR  
- **100 Power customers**: $9,700 MRR
- **Total Target**: $20,000 MRR ($240,000 ARR)

### Value Propositions
- **Starter → Pro**: $325/month value for $29 (11x return)
- **Pro → Power**: $1000+/month value for $97 (10x+ return)
- **Competition**: Break-even at just 1-2 exclusive leads per month vs $80-100 per shared lead

### Key Metrics
- **Customer Acquisition Cost (CAC)**: Target <$50 for Starter, <$150 for Power
- **Customer Lifetime Value (CLV)**: Target 12+ months average retention
- **Upgrade Rate**: Target 25% Starter→Pro, 40% Pro→Power within 6 months

## 🎯 Market Positioning

### Target Customers

**Starter Tier**: New businesses, budget-conscious contractors (0-2 years, <$50K revenue)
**Pro Tier**: Established businesses wanting enhanced visibility (2-5 years, $50K-200K revenue)  
**Power Tier**: Revenue-focused businesses ready for growth (3+ years, $200K+ revenue)

### Competitive Landscape

| Feature | Thumbtack/Angi | Yelp/Directories | AZ Business Services |
|---------|----------------|------------------|---------------------|
| Pricing | $80-100/shared lead | Free but limited | $9-97/month predictable |
| Lead Quality | Shared with 3-5 contractors | Hope customers find you | Exclusive delivery |
| Professional Tools | None | Basic | Complete AI suite |
| Local Focus | National platform | Generic | Arizona-optimized |

## 🔐 Security & Authentication

- **Role-based access**: user, admin, super_admin permissions
- **Business verification**: GMB OAuth + document verification
- **API protection**: All Convex functions include proper auth checks
- **Data validation**: Input sanitization and schema validation
- **Rate limiting**: Built-in protection against API abuse

## 📈 Analytics & Reporting

### Platform Analytics
- **Real-time metrics** with health scoring
- **Revenue analytics** with MRR/ARR tracking
- **User engagement** analysis and retention cohorts
- **Business performance** scoring and optimization recommendations

### Business Intelligence
- **Competitive analysis** and market positioning
- **SEO performance** tracking and recommendations
- **Lead generation** analytics and conversion optimization
- **Customer satisfaction** monitoring and feedback loops

## 🚀 Deployment

### Vercel (Recommended)
1. Connect repository to Vercel
2. Set environment variables in dashboard
3. Deploy automatically on push to main

### Production Checklist
- [ ] Environment variables configured
- [ ] Convex deployment active
- [ ] Clerk authentication setup
- [ ] Polar.sh webhooks configured
- [ ] OpenAI API key active
- [ ] Domain and SSL configured

## 📞 Support & Contact

- **Documentation**: See `CLAUDE.md` for detailed technical documentation
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Business inquiries**: Contact through platform or pulseautomation.ai

---

**AZ Business Services** - Building Arizona's premier business directory with AI-powered professional presentation, exclusive lead generation, and predictable pricing that scales with business growth.

Built with React Router v7, Convex, Clerk, Polar.sh, and OpenAI GPT-4.