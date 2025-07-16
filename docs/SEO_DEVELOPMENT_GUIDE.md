# SEO Development Guide for AZ Business Services

## Overview
This guide ensures all new pages automatically have proper SEO, OpenGraph, and social media optimization. Follow these patterns for consistent, scalable SEO implementation.

## Quick Start for New Pages

### Step 1: Import the SEO Middleware
```typescript
import { generateMetaForRoute } from "~/utils/seo-middleware";
```

### Step 2: Use the Standard Meta Function
```typescript
export function meta({ params, data }: Route.MetaArgs) {
  return generateMetaForRoute("routeType", params, data);
}
```

## Route Types Available

| Route Type | Use Case | Example |
|------------|----------|---------|
| `"homepage"` | Main landing page | `/` |
| `"business"` | Business detail pages | `/hvac-services/phoenix/business-name` |
| `"category"` | Category listing pages | `/hvac-services` |
| `"city"` | City-specific pages | `/city/phoenix` |
| `"blog"` | Blog posts | `/blog/article-slug` |
| `"about"` | About/static pages | `/about` |
| `"pricing"` | Pricing pages | `/pricing` |
| `"contact"` | Contact pages | `/contact` |
| `"generic"` | Fallback for other pages | Any other route |

## Implementation Examples

### Business Detail Page
```typescript
export function meta({ params }: Route.MetaArgs) {
  return generateMetaForRoute("business", params);
}
```

### Category Page with City
```typescript
export function meta({ params }: Route.MetaArgs) {
  return generateMetaForRoute("category", params);
}
```

### Blog Post
```typescript
export function meta({ params, data }: Route.MetaArgs) {
  return generateMetaForRoute("blog", params, data);
}
```

### Custom Page
```typescript
export function meta({ params }: Route.MetaArgs) {
  return generateMetaForRoute("generic", params);
}
```

## What You Get Automatically

### OpenGraph Tags
- `og:title` - Optimized for each page type
- `og:description` - Contextual descriptions
- `og:image` - Logo or page-specific images
- `og:url` - Canonical URLs
- `og:type` - Appropriate content type
- `og:site_name` - Consistent branding

### Twitter Cards
- `twitter:card` - Summary or large image
- `twitter:title` - Optimized titles
- `twitter:description` - Contextual descriptions
- `twitter:image` - Appropriate images
- `twitter:site` - Brand handle

### SEO Essentials
- `<title>` - Search-optimized titles
- `<meta name="description">` - Compelling descriptions
- `<meta name="keywords">` - Relevant keywords
- `<link rel="canonical">` - Duplicate content prevention
- `<meta name="robots">` - Search engine directives

### Structured Data (JSON-LD)
- LocalBusiness schema for business pages
- Article schema for blog posts
- BreadcrumbList for navigation
- Organization schema for brand pages

## Advanced Usage

### With Real Data
```typescript
export function meta({ params, data }: Route.MetaArgs) {
  return generateMetaForRoute("business", params, {
    business: data.business,
    category: data.category
  });
}
```

### Custom SEO Override
```typescript
export function meta({ params }: Route.MetaArgs) {
  const seo = generateSEOForRoute("business", params);
  
  // Custom modifications
  seo.title = "Custom Title";
  seo.description = "Custom description";
  
  const { metaTags } = generateMetaTags(seo);
  return metaTags;
}
```

## Development Validation

### Check SEO in Development
```typescript
import { validateSEO } from "~/utils/seo-middleware";

const seo = generateSEOForRoute("business", params);
const errors = validateSEO(seo);
if (errors.length > 0) {
  console.warn("SEO Issues:", errors);
}
```

### Required Fields Validation
The system automatically validates:
- Title length (max 60 characters)
- Description length (max 160 characters)
- All required OpenGraph fields
- All required Twitter Card fields

## Best Practices

### 1. Always Use the Middleware
```typescript
// ✅ Good
export function meta({ params }: Route.MetaArgs) {
  return generateMetaForRoute("business", params);
}

// ❌ Bad - Manual meta tags
export function meta({ params }: Route.MetaArgs) {
  return [
    { title: "Manual title" },
    { name: "description", content: "Manual description" }
  ];
}
```

### 2. Pass Real Data When Available
```typescript
// ✅ Good - Real data
export function meta({ params, data }: Route.MetaArgs) {
  return generateMetaForRoute("business", params, {
    business: data.business,
    category: data.category
  });
}

// ⚠️ OK - URL params only (generates mock data)
export function meta({ params }: Route.MetaArgs) {
  return generateMetaForRoute("business", params);
}
```

### 3. Use Appropriate Route Types
```typescript
// ✅ Good - Specific route type
export function meta({ params }: Route.MetaArgs) {
  return generateMetaForRoute("category", params);
}

// ❌ Bad - Generic for specific content
export function meta({ params }: Route.MetaArgs) {
  return generateMetaForRoute("generic", params);
}
```

## Future-Proofing

### New Route Types
To add new route types, update `RouteType` in `seo-middleware.ts`:

```typescript
export type RouteType = 
  | "homepage"
  | "business"
  | "category"
  | "city"
  | "blog"
  | "about"
  | "pricing"
  | "contact"
  | "search"      // New type
  | "generic";
```

Then add the generator function:

```typescript
function generateSearchSEO(params: RouteParams, data: RouteData): SEOMetadata {
  // Implementation
}
```

### Bulk Page Generation
For thousands of new pages (categories, cities, businesses), the system automatically:
- Generates SEO-optimized titles and descriptions
- Creates proper OpenGraph tags
- Includes structured data
- Validates all required fields
- Provides fallbacks for missing data

## Troubleshooting

### Common Issues

1. **Missing OpenGraph Image**
   - Default fallback: `/logo.png`
   - Custom images: Pass in `data.business.logo` or `data.post.image`

2. **Generic Meta Tags**
   - Ensure correct route type is used
   - Pass real data when available
   - Check URL parameter structure

3. **SEO Validation Errors**
   - Check title length (max 60 chars)
   - Check description length (max 160 chars)
   - Ensure all required fields are present

### Debug Mode
```typescript
// Enable SEO debugging
const seo = generateSEOForRoute("business", params);
console.log("Generated SEO:", seo);
const errors = validateSEO(seo);
console.log("SEO Errors:", errors);
```

## Monitoring and Analytics

### SEO Performance
- Use Google Search Console to monitor page performance
- Track OpenGraph engagement in social media analytics
- Monitor click-through rates from search results

### Key Metrics
- Page title click-through rate
- Social media share engagement
- Search engine ranking improvements
- Local search visibility

## Maintenance

### Regular Updates
- Review and update default images
- Optimize meta descriptions based on performance
- Update structured data schemas
- Monitor for new OpenGraph requirements

### Content Audits
- Check for duplicate titles/descriptions
- Validate structured data markup
- Ensure canonical URLs are correct
- Review social media preview appearance

This guide ensures that every new page added to AZ Business Services automatically receives comprehensive SEO optimization without manual intervention.