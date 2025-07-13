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
| ✅ **Component Data Sourcing Audit**         | Defines how each feature is powered (GMB, Convex, AI, Manual) | ✅ Synced                                                          |          |
| 💡 **What You Get — Customer-Facing Table** | Defines the public-facing offer for each pricing tier         | ✅ Synced                                                          |          |

---

### 📘 Change Log (Most Recent Revisions)

#### ✅ Additions

- Updated pricing tier structure to match visual pricing grid
- Adjusted language for “Leads from Your Listing” to better reflect actual experience
- Clarified lead delivery methods for Pro (manual) and Power (auto-notified)
- Added AI-enhanced listing formatting to Power
- Added Homepage Featured Placement (clarified as rotating slot)
- Refined language around Concierge support

#### 🔄 Reworded

- Adjusted feature names to exactly match the public-facing table:
  - “Free Lead Pass-Thru” → “Leads from Your Listing”
  - “VIP Support” → “Dedicated Concierge Access”
- Reformatted public-facing language for consistency
- Updated component visibility and sourcing tables to match

#### ❌ Removed

- Hero banner image upgrade logic (not a value proposition anymore)
- Contact form from pricing table (still exists on page)
- Claim/edit listing from pricing table (still functional in logic, not marketed)
- Analytics Dashboard, Customer Journey Preview, Booking Calendar (cut for simplicity)
- “Smart Offers” (removed as a value prop)

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
| Leads from Your Listing             | Hidden                                             | Manually matched when available                | Auto-matched + instant alerts                                     |

---

### ✅ Component Data Sourcing Audit

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
| Leads from Your Listing                | Internal Matching Engine | ✅ Eligibility + alerts    | Manual in Pro, auto in Power                   |

---

### 💡 What You Get — Customer-Facing Pricing Table

| Feature                            | Free        | Pro                | Power                                           |
| ---------------------------------- | ----------- | ------------------ | ----------------------------------------------- |
| Public Business Listing            | ✅           | ✅                  | ✅                                               |
| Google Reviews                     | ✅           | ✅                  | ✅                                               |
| Tabs (Overview, Services, Reviews) | ✅           | ✅                  | ✅                                               |
| Similar Businesses Carousel        | ✅           | ✅                  | ✅                                               |
| Leads from Your Listing            | ❌           | ✅ Manually Matched | ✅ Auto-Matched + Alerts                         |
| Verified Badge                     | ❌           | ✅                  | ✅                                               |
| Business Summary                   | Blurred     | Full view          | AI-enhanced + Style Options                     |
| Service Display                    | Bullet list | Service cards      | Enhanced AI Cards with Pricing                  |
| SEO Backlink                       | ❌           | ✅                  | ✅                                               |
| Review Insights                    | ❌           | Basic              | AI Sentiment & Keyword Analysis                 |
| Badge System                       | Grayed out  | Standard           | All + Bonus Badges                              |
| Category Boost                     | ❌           | ✅                  | ✅ + Homepage Featured Placement (Rotating Slot) |
| Dedicated Concierge Access         | ❌           | ❌                  | ✅                                               |
| Monthly Blog Posts                 | ❌           | ❌                  | ✅ 1/mo AI-powered Blog Post                     |

