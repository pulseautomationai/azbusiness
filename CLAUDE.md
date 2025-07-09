# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current Project: AZ Business Services Directory

We are transforming this React Starter Kit into a comprehensive business directory for Arizona service providers. See `project_plan.md` for the complete task list and implementation status.

**Key Changes from Original:**
- Homepage now features business search and listings
- Category pages for 38 service types
- City pages for 50+ Arizona cities
- Three-tier subscription model (Free/$29/$97)
- Business profile management system

## Essential Commands

### Development
```bash
# Start Convex development server (required for backend)
npx convex dev

# Start React Router development server
npm run dev

# Type checking
npm run typecheck

# Build for production
npm run build

# Start production server
npm start
```

## Architecture Overview

Originally a React SaaS starter kit, now being developed into AZ Business Services - a local business directory for Arizona. Built with React Router v7, providing SSR capabilities and integrated with multiple cloud services.

### Tech Stack Integration
- **React Router v7**: Full-stack React framework handling routing, SSR, and data loading
- **Convex**: Real-time database and serverless backend functions
- **Clerk**: Authentication provider integrated at both client and server levels
- **Polar.sh**: Subscription management and billing
- **OpenAI**: AI chat capabilities in dashboard

### Key Architectural Patterns

1. **Data Loading Strategy**
   - Use React Router loaders for server-side data fetching
   - Loaders in route files handle authentication checks and data prefetching
   - Parallel data loading to minimize waterfalls

2. **Authentication Flow**
   - Clerk handles authentication UI and session management
   - User data syncs to Convex via webhook on sign-up
   - Protected routes check auth in loaders before rendering

3. **Type Safety**
   - Convex generates types from schema (see `convex/_generated/`)
   - Use generated API types when calling Convex functions
   - React Router provides route type safety

4. **Component Architecture**
   - UI components from shadcn/ui live in `app/components/ui/`
   - Feature components grouped by domain (homepage/, dashboard/)
   - Import using `~/` alias which maps to the app directory

5. **Real-time Updates**
   - Convex mutations automatically trigger UI updates
   - Use `useQuery` and `useMutation` hooks from Convex
   - Subscriptions handled via Convex functions

### Critical Implementation Notes

- **Environment Variables**: All services require specific env vars - check README.md for full list
- **Convex Development**: Always run `npx convex dev` before starting the React app
- **Route Protection**: Authentication checks happen in route loaders, not components
- **Subscription Gating**: Use `subscription-required.tsx` route for paid features
- **Type Imports**: Always use `~/` for app imports, not relative paths

### Service-Specific Patterns

**Convex Functions** (`convex/` directory):
- Define schema in `schema.ts`
- Auth config in `auth.config.ts`
- HTTP endpoints in `http.ts`
- Functions auto-generate TypeScript types

**React Router Routes** (`app/routes/` directory):
- Export `loader` for data fetching
- Export `action` for form handling
- Use `useLoaderData()` for type-safe data access

**Clerk Integration**:
- Wrap app with `ClerkProvider` in `root.tsx`
- Use `getAuth()` in loaders for server-side auth
- `useUser()` hook for client-side user data

### Project-Specific Notes for AZ Business Services

**Database Schema** (pending implementation):
- `businesses` - Company listings with tiers (Free/Pro/Power)
- `categories` - 38 service categories
- `cities` - 50+ Arizona cities
- `reviews` - Customer reviews
- `leads` - Contact form submissions

**Key Routes** (pending implementation):
- `/` - Homepage with search
- `/category/[slug]` - Service category pages (e.g., `/category/hvac-services`)
- `/city/[slug]` - City pages (e.g., `/city/mesa`)
- `/business/[id]` - Individual business profiles
- `/pricing` - Three-tier subscription plans
- `/blog` - SEO content hub

**Development Workflow**:
1. Check `project_plan.md` for current task status
2. Update task checkboxes as you complete items
3. Add entries to the Project Log section
4. Keep track of any blockers or decisions needed