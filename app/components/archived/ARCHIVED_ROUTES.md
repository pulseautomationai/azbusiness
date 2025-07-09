# Archived Routes Documentation

## Original React Starter Kit Routes

### Public Routes
- `/` - Homepage (home.tsx)
- `/sign-in/*` - Sign in page
- `/sign-up/*` - Sign up page  
- `/pricing` - Pricing page
- `/success` - Success page after subscription
- `/subscription-required` - Subscription required page

### Protected Routes (Dashboard Layout)
- `/dashboard` - Dashboard index
- `/dashboard/chat` - Chat feature
- `/dashboard/settings` - Settings page

## Components Archived
- `navbar.tsx` - Original navigation bar
- `integrations.tsx` - Hero section with tech stack icons
- `content.tsx` - Features content section
- `team.tsx` - Team section
- `pricing.tsx` - Original pricing component
- `footer.tsx` - Footer component

## Notes
- All dashboard routes use a shared layout (dashboard/layout.tsx)
- Authentication handled by Clerk
- Subscription management through Polar.sh