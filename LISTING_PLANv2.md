## Business Listing Page — Component-Level Visibility Spec

This document defines the design and implementation plan for a dynamic, AI-enriched business listing page for an Arizona local business directory. It is built on a modern tech stack (React Router v7, TailwindCSS, shadcn/ui, Convex, Clerk, and Polar.sh). This document should be used by Claude or other AI agents to generate implementation plans, component tasks, and developer checklists.

The goal is to:

1. Render rich listings by default (Power-tier), and use visibility logic to hide or disable features for Pro or Free tiers.
2. Make each listing valuable and persuasive enough to get the business to claim it.
3. Use AI and automation to enrich content, offer compelling upgrade paths, and manage everything scalably.

---

### 🔄 Summary of Structure & Sync Status

| Section Title                               | Purpose                                                       | Sync Status                                                       |          |
| ------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------- | -------- |
| 🔢                                          | **Component Visibility Matrix + Plan Logic**                  | Defines what is visible or hidden by plan tier (Free, Pro, Power) | ✅ Synced |
| ✅ **Component Data Sourcing Audit (WIP)**   | Defines how each feature is powered (GMB, Convex, AI, Manual) | ✅ Synced                                                          |          |
| 💡 **What You Get — Customer-Facing Table** | Defines the public-facing offer for each pricing tier         | ✅ Synced                                                          |          |

---

### 📘 Change Log (Most Recent Revisions)

#### ✅ Additions

- Free Lead Pass-Thru (Pro & Power tiers)
- SEO Backlink logic clarified by tier
- Monthly AI Blog Posts (Power tier)
- Badge system clarified and enriched with trust-based metrics
- VIP Support renamed to "Dedicated Concierge Access"
- Homepage placement logic clarified: capped, rotating system

#### 🔄 Reworded

- Clarified badge logic to include trust factors and data triggers
- Clarified AI Summary, Review Sentiment, and tone/style control features
- Hero banner removed from pricing table but retained in core layout

#### ❌ Removed

- Smart Offers (not strong enough value add)
- Analytics Dashboard
- Customer Journey Preview
- Booking Calendar
- Contact Form & Claim/Edit (from pricing grid only)

---

### 🧱 Core Page Structure

```
| Header (business name, category, rating)
| Hero Banner (with optional fallback image)
| Navigation Tabs [Overview | Services | Reviews | Insights*]
| Content Area (switches per tab)
| Sidebar (Contact Info, Business Hours, Social Links, Badges)
| Footer: Similar Businesses + Sticky CTA
```

---

### 🔢 Component Visibility Matrix + Plan Logic

This matrix has been expanded with the rendering logic by plan. Each feature includes a brief rule set for Free, Pro, and Power.

| Component / Feature                 | Free Plan Logic                                    | Pro Plan Logic                                 | Power Plan Logic                                                  |
| ----------------------------------- | -------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| Business Name, Category, Rating     | Always visible                                     | Always visible                                 | Always visible                                                    |
| Service Cards                       | Show unordered bullet list                         | Render service cards (icon, short desc)        | Render enhanced cards with AI-written blurbs and optional pricing |
| AI Business Summary                 | Show 1-sentence preview (blur remainder)           | Show full summary                              | Show full + enable tone/style toggle                              |
| Tabs: Overview, Services, Reviews   | All tabs enabled                                   | All tabs enabled                               | All tabs enabled                                                  |
| Insights Tab                        | Hidden                                             | Visible with limited metrics                   | Fully visible with review trends, graphs, keywords                |
| AI Review Sentiment Graph           | Hidden                                             | Hidden                                         | Visible — render graph from GMB review sentiment analysis         |
| Badges                              | Show grayed badges, tooltip: "Unlock by upgrading" | Show applicable badges based on rules          | Show more badges (AI-derived or higher thresholds)                |
| Verified Badge                      | Hidden                                             | Display if claimed                             | Display if claimed                                                |
| Google Map + Directions             | Always visible                                     | Always visible                                 | Always visible                                                    |
| Similar Businesses Carousel         | Always visible                                     | Always visible                                 | Always visible                                                    |
| Sticky CTA ("Claim Listing")        | Show fixed bottom bar with action modal            | Hidden (already claimed)                       | Hidden (already claimed)                                          |
| Sticky CTA ("Upgrade")              | Show when locked sections are in view              | Show when Power-only features are previewed    | Hidden                                                            |
| Priority Placement / Boost Badge    | Exclude from search priority                       | Boost category-level visibility (weight score) | Promote to homepage (rotating slot) + top-of-category             |
| VIP Badge / Account Manager Section | Hidden                                             | Hidden                                         | Show badge in header + support tab for concierge access           |
| Website Link (SEO Backlink)         | Hidden                                             | Visible as dofollow link                       | Visible as dofollow link                                          |
| Monthly Blog Post Content           | Hidden                                             | Hidden                                         | One article/month (AI-assisted), focused on local expertise       |
| Free Lead Pass-Thru                 | Hidden                                             | Eligible to receive matched leads manually     | Eligible + auto-notified of new inbound leads                     |

---

### ✅ Component Data Sourcing Audit (WIP)

| Component / Feature                    | Primary Data Source      | Enrichment Required?      | Notes                                          |
| -------------------------------------- | ------------------------ | ------------------------- | ---------------------------------------------- |
| Business Name, Contact Info, Hours     | GMB scrape               | ❌                         | Already pulled                                 |
| Service Cards (icons, blurbs, pricing) | GMB reviews / AI         | ✅ AI extract and generate | NLP on review/service content                  |
| AI Business Summary                    | AI (OpenAI)              | ✅                         | GPT-generated from existing content            |
| Reviews Tab                            | GMB                      | ❌                         | Raw display, no processing                     |
| AI Review Summary (tags, sentiment)    | GMB + AI                 | ✅ NLP required            | Use keyword extraction & sentiment model       |
| Badges (Locally Loved, Fast Response)  | GMB data + rule logic    | ✅                         | Set thresholds for badge logic                 |
| Verified Badge                         | Convex                   | ❌                         | Set flag upon claim or manual approval         |
| Similar Businesses Carousel            | Internal DB (Convex)     | ❌                         | Category + city filter on listings             |
| Sticky CTA Bars                        | Logic-based UI           | ❌                         | Driven by `plan` flag                          |
| Website Link (SEO Backlink)            | GMB + Manual input       | ❌                         | Visible in Pro+ tiers only                     |
| Monthly Blog Post Content              | AI (OpenAI)              | ✅                         | Posted monthly, topics based on local insights |
| Free Lead Pass-Thru                    | Internal Tracking System | ❌                         | Matched based on category/city + alert logic   |

---

### 💡 What You Get — Customer-Facing Pricing Table

| Feature                            | Free        | Pro           | Power                                      |
| ---------------------------------- | ----------- | ------------- | ------------------------------------------ |
| Public Business Listing            | ✅           | ✅             | ✅                                          |
| Google Reviews                     | ✅           | ✅             | ✅                                          |
| Tabs (Overview, Services, Reviews) | ✅           | ✅             | ✅                                          |
| Similar Businesses Carousel        | ✅           | ✅             | ✅                                          |
| Free Lead Pass-Thru                | ❌           | ✅ Eligible    | ✅ Auto-Matched + Alerts                    |
| Verified Badge                     | ❌           | ✅             | ✅                                          |
| Business Summary                   | Blurred     | Full view     | AI-enhanced + Style Options                |
| Service Display                    | Bullet list | Service cards | Enhanced AI Cards with Pricing             |
| SEO Backlink                       | ❌           | ✅             | ✅                                          |
| Review Insights                    | ❌           | Basic         | AI Sentiment & Keyword Analysis            |
| Badge System                       | Grayed out  | Standard      | All + Bonus Badges                         |
| Category Boost                     | ❌           | ✅             | ✅ + Homepage Featured Placement (Rotating) |
| VIP Support                        | ❌           | ❌             | ✅ Dedicated Concierge Access               |
| Monthly Blog Posts                 | ❌           | ❌             | ✅ 1/mo AI-powered Blog Post                |

