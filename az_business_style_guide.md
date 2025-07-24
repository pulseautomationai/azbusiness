# AZ Business Services - Complete Style Guide

## CRITICAL INSTRUCTION
You MUST implement the following updated style guide across ALL components of the AZ Business Services platform. Any deviation from these specifications will be considered incorrect. This replaces all previous styling instructions.

## REQUIRED DESERT PALETTE - ONLY USE THESE

```css
:root {
  /* PRIMARY DESERT PALETTE */
  --ocotillo-red: #E36450;        /* Primary CTAs, bold headers */
  --desert-marigold: #F4A259;     /* Secondary CTAs, highlights */
  --turquoise-sky: #3AAFA9;       /* Links, accents, cool contrast */
  --ironwood-charcoal: #2B2A28;   /* Body text, neutral base */
  --agave-cream: #FDF8F3;         /* Main backgrounds */
  --white: #FFFFFF;               /* Cards, content areas */
  
  /* HOVER STATES */
  --ocotillo-red-hover: #D55A47;  /* Darker red for hover */
  --desert-marigold-hover: #E8944F; /* Darker marigold for hover */
  --turquoise-sky-hover: #359B96; /* Darker turquoise for hover */
}
```

## UI ROLE MAPPING - STRICT ASSIGNMENT

| Use Case | Color | Hex Code | Role |
|----------|-------|----------|------|
| **Primary CTA** | Ocotillo Red | `#E36450` | Bold, warm primary - CTAs, main actions |
| **Secondary CTA** | Desert Marigold | `#F4A259` | Vibrant accent - secondary buttons, highlights |
| **Links/Accents** | Turquoise Sky | `#3AAFA9` | Cool contrast - links, tags, accents |
| **Body Text** | Ironwood Charcoal | `#2B2A28` | Neutral base - all text content |
| **Background** | Agave Cream | `#FDF8F3` | Soft background - main page areas |
| **Cards/Sections** | White | `#FFFFFF` | Utility/contrast - cards, content zones |

```css
/* PRIMARY ACTIONS */
.btn-primary, .primary-cta, .main-cta {
  background-color: var(--ocotillo-red);
  color: var(--white);
}

.btn-primary:hover, .primary-cta:hover {
  background-color: var(--ocotillo-red-hover);
}

/* SECONDARY ACTIONS */
.btn-secondary, .secondary-cta, .highlight-button {
  background-color: var(--desert-marigold);
  color: var(--white);
}

.btn-secondary:hover, .secondary-cta:hover {
  background-color: var(--desert-marigold-hover);
}

/* LINKS & ACCENTS */
a, .link, .accent-element, .tag {
  color: var(--turquoise-sky);
}

a:hover, .link:hover {
  color: var(--turquoise-sky-hover);
}

/* TEXT */
body, p, span, div, h1, h2, h3, h4, h5, h6 {
  color: var(--ironwood-charcoal);
}

/* BACKGROUNDS */
body, .main-background, .page-background {
  background-color: var(--agave-cream);
}

.card, .content-section, .business-card {
  background-color: var(--white);
}
```

## BADGE EXCEPTION - ATTENTION-GRABBING COLORS ONLY

**ONLY for achievement badges, award indicators, and status badges - NOT for general design:**

```css
/* Achievement Badge Colors - ONLY for badges */
.badge-fastest, .badge-response {
  background-color: #FEF3C7; /* Light golden yellow */
  color: #92400E; /* Dark golden brown */
  border: 1px solid #F59E0B; /* Golden border */
}

.badge-value, .badge-best {
  background-color: #D1FAE5; /* Light mint green */
  color: #065F46; /* Dark emerald */
  border: 1px solid #10B981; /* Emerald border */
}

.badge-rated, .badge-highest {
  background-color: #DBEAFE; /* Light sky blue */
  color: #1E40AF; /* Dark royal blue */
  border: 1px solid #3B82F6; /* Blue border */
}

.badge-premium, .badge-featured {
  background-color: #F3E8FF; /* Light purple */
  color: #6B21A8; /* Dark purple */
  border: 1px solid #8B5CF6; /* Purple border */
}

/* Standard badge styling */
.badge {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
```

## MANDATORY TYPOGRAPHY - NO SUBSTITUTIONS

```css
/* HEADLINES - Playfair Display ONLY */
h1, .main-headline {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 3.5rem;
  font-weight: 400;
  color: var(--ironwood-charcoal);
  line-height: 1.1;
}

h2, .section-headline {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2.5rem;
  font-weight: 400;
  color: var(--ironwood-charcoal);
  line-height: 1.2;
}

h3, .subsection-headline {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2rem;
  font-weight: 400;
  color: var(--ironwood-charcoal);
  line-height: 1.3;
}

.business-name {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--ironwood-charcoal);
}

/* ACCENT TEXT IN HEADLINES */
.headline-accent {
  color: var(--ocotillo-red);
  /* Use for emphasized words like "Local Pros" */
}

/* BODY TEXT - Inter ONLY */
body, p, span, div, button {
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--ironwood-charcoal);
  font-size: 1rem;
  line-height: 1.6;
}

.body-large {
  font-size: 1.125rem;
  line-height: 1.6;
}

.body-small {
  font-size: 0.875rem;
  line-height: 1.5;
}

.caption {
  font-size: 0.75rem;
  line-height: 1.4;
  opacity: 0.7;
}
```

## NON-NEGOTIABLE COMPONENT RULES

### Button System - EXACT IMPLEMENTATION REQUIRED

```css
/* PRIMARY BUTTONS - Ocotillo Red */
.btn-primary, .view-profile-btn, .search-button, .find-providers-btn {
  background-color: var(--ocotillo-red);
  color: var(--white);
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 600;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--ocotillo-red-hover);
  transform: translateY(-1px);
  box-shadow: 0px 4px 8px rgba(227, 100, 80, 0.3);
}

/* SECONDARY BUTTONS - Desert Marigold */
.btn-secondary, .highlight-btn, .featured-action {
  background-color: var(--desert-marigold);
  color: var(--white);
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 600;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: var(--desert-marigold-hover);
  transform: translateY(-1px);
  box-shadow: 0px 4px 8px rgba(244, 162, 89, 0.3);
}

/* TERTIARY BUTTONS - White with Border */
.btn-tertiary, .call-now-btn, .outline-btn {
  background-color: var(--white);
  color: var(--ironwood-charcoal);
  border: 1px solid rgba(43, 42, 40, 0.2);
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 500;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-tertiary:hover {
  background-color: var(--agave-cream);
  border-color: var(--turquoise-sky);
  color: var(--turquoise-sky);
}

/* NAVIGATION BUTTONS */
.nav-button, .for-business-owners-btn {
  background-color: var(--desert-marigold);
  color: var(--white);
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-button:hover {
  background-color: var(--desert-marigold-hover);
}

/* SMALL BUTTONS */
.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

/* LARGE BUTTONS */
.btn-large {
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
}
```

### Cards - MANDATORY STYLING

```css
.business-card, .card, .content-card {
  background-color: var(--white);
  border: 1px solid rgba(43, 42, 40, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0px 2px 8px rgba(43, 42, 40, 0.08);
  transition: all 0.2s ease;
}

.business-card:hover, .card:hover {
  box-shadow: 0px 4px 16px rgba(43, 42, 40, 0.12);
  transform: translateY(-2px);
}

/* Card Header */
.card-header {
  border-bottom: 1px solid rgba(43, 42, 40, 0.1);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.card-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--ironwood-charcoal);
}

/* Card Content */
.card-content {
  color: var(--ironwood-charcoal);
}

/* Card Footer */
.card-footer {
  border-top: 1px solid rgba(43, 42, 40, 0.1);
  padding-top: 1rem;
  margin-top: 1rem;
}
```

### Links & Accents - TURQUOISE SKY

```css
a, .link, .accent-link {
  color: var(--turquoise-sky);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover, .link:hover {
  color: var(--turquoise-sky-hover);
  text-decoration: underline;
}

.accent-element, .tag, .category-link {
  color: var(--turquoise-sky);
  background-color: rgba(58, 175, 169, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.accent-element:hover, .tag:hover {
  background-color: rgba(58, 175, 169, 0.2);
  color: var(--turquoise-sky-hover);
}

/* Status Indicators */
.status-open, .status-available {
  color: var(--turquoise-sky);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: var(--turquoise-sky);
  border-radius: 50%;
}
```

### Backgrounds - STRICT REQUIREMENTS

```css
body, .main-background, .page-wrapper {
  background-color: var(--agave-cream);
  margin: 0;
  padding: 0;
}

.navbar, .header {
  background-color: var(--agave-cream);
  border-bottom: 1px solid rgba(43, 42, 40, 0.1);
  padding: 1rem 2rem;
}

.hero-section, .search-section {
  background-color: var(--agave-cream);
  padding: 4rem 2rem;
  text-align: center;
}

.footer {
  background-color: var(--ironwood-charcoal);
  color: var(--agave-cream);
  padding: 3rem 2rem 2rem;
}
```

### Form Elements

```css
.form-input, .search-input {
  background-color: var(--white);
  border: 1px solid rgba(43, 42, 40, 0.2);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 1rem;
  color: var(--ironwood-charcoal);
  transition: all 0.2s ease;
}

.form-input:focus, .search-input:focus {
  outline: none;
  border-color: var(--turquoise-sky);
  box-shadow: 0 0 0 3px rgba(58, 175, 169, 0.1);
}

.form-label {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ironwood-charcoal);
  margin-bottom: 0.5rem;
  display: block;
}

.form-select {
  background-color: var(--white);
  border: 1px solid rgba(43, 42, 40, 0.2);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 1rem;
  color: var(--ironwood-charcoal);
}
```

### Layout & Spacing

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.grid {
  display: grid;
  gap: 2rem;
}

.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

/* Spacing Classes */
.space-y-1 > * + * { margin-top: 0.25rem; }
.space-y-2 > * + * { margin-top: 0.5rem; }
.space-y-3 > * + * { margin-top: 0.75rem; }
.space-y-4 > * + * { margin-top: 1rem; }
.space-y-6 > * + * { margin-top: 1.5rem; }
.space-y-8 > * + * { margin-top: 2rem; }

.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }

.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .grid-2, .grid-3, .grid-4 {
    grid-template-columns: 1fr;
  }
  
  h1, .main-headline {
    font-size: 2.5rem;
  }
  
  h2, .section-headline {
    font-size: 2rem;
  }
  
  .btn-primary, .btn-secondary, .btn-tertiary {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .hero-section, .search-section {
    padding: 2rem 1rem;
  }
}
```

## ABSOLUTE PROHIBITIONS - DO NOT UNDER ANY CIRCUMSTANCES:

- ❌ Use ANY gradients (background: linear-gradient, etc.)
- ❌ Use badge colors for general design elements
- ❌ Use ANY colors not in the defined desert palette (except for badges)
- ❌ Mix font families within components
- ❌ Use custom shadows beyond the specified ones
- ❌ Deviate from the exact color values provided
- ❌ Use background colors other than white for cards
- ❌ Use background colors other than agave-cream for main backgrounds
- ❌ Use turquoise-sky for buttons (links and accents only)
- ❌ Use ocotillo-red for body text
- ❌ Use desert-marigold for body text

## IMPLEMENTATION REQUIREMENTS

1. ✅ **Replace ALL existing color variables** with the desert palette above
2. ✅ **Update ALL primary buttons** to use ocotillo-red
3. ✅ **Update ALL secondary buttons** to use desert-marigold
4. ✅ **Update ALL links and accents** to use turquoise-sky
5. ✅ **Convert ALL card backgrounds** to white with specified borders
6. ✅ **Update ALL typography** to use Playfair Display for headers, Inter for body
7. ✅ **Remove ALL gradients** and replace with solid colors
8. ✅ **Implement desert marigold for navigation and secondary actions**
9. ✅ **Apply hover states** using specified darker shades
10. ✅ **Implement responsive design** for mobile devices

## VERIFICATION CHECKLIST - MUST CONFIRM ALL:

- [ ] Only colors from desert palette are used (except specified badge colors)
- [ ] Primary CTAs use ocotillo-red (#E36450)
- [ ] Secondary CTAs use desert-marigold (#F4A259)
- [ ] Links and accents use turquoise-sky (#3AAFA9)
- [ ] All text uses ironwood-charcoal (#2B2A28)
- [ ] All cards have white backgrounds (#FFFFFF)
- [ ] Main background is agave-cream (#FDF8F3)
- [ ] All headlines use Playfair Display
- [ ] All body text uses Inter
- [ ] No gradients anywhere
- [ ] Hover states use specified darker shades
- [ ] Badge colors only used for achievement badges
- [ ] Responsive design works on mobile
- [ ] Form elements follow styling guidelines
- [ ] Layout and spacing is consistent

## SUCCESS CRITERIA

The final result must have:

✅ **Visual Consistency**: Clean white cards on agave-cream background
✅ **Color Harmony**: Ocotillo-red primary, desert-marigold secondary, turquoise-sky accents
✅ **Typography Hierarchy**: Consistent Playfair Display headlines with Inter body text
✅ **Professional Polish**: Proper spacing, shadows, and transitions
✅ **User Experience**: Clear visual hierarchy and intuitive interactions
✅ **Accessibility**: Proper contrast ratios and readable typography
✅ **Responsive Design**: Mobile-first approach that works across devices
✅ **Brand Identity**: Cohesive desert-inspired aesthetic throughout

## FONT IMPORTS

Add these to your HTML head or CSS imports:

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

---

**FAILURE TO FOLLOW THESE SPECIFICATIONS EXACTLY IS UNACCEPTABLE.** 

Implement this desert palette completely and systematically across all components. This is the definitive styling standard for the AZ Business Services platform.

**Last Updated**: January 2025  
**Version**: 4.0 - Desert Palette Edition