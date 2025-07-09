# Outstanding Issues & TODO List - AZ Business Services

**Last Updated:** 2025-01-09  
**Status:** Post-crash fixes - Remaining issues to address

---

## 🔥 **Critical Issues (Must Fix)**

### **1. Empty City Dropdown - Database Not Seeded**
- [x] **Seed cities data into Convex database** ✅ COMPLETED
  - Issue: City dropdown on homepage is empty
  - Cause: Cities table hasn't been populated with seed data
  - Action: Run `npx convex run seed:seedCities` 
  - Files: `convex/seed.ts`, `convex/seedData.ts`
  - Impact: Users cannot search by city, major UX issue
  - **Result: 58 cities successfully seeded and dropdown now populated**

- [x] **Seed categories data into Convex database** ✅ COMPLETED
  - Issue: Service categories may also be missing
  - Action: Run `npx convex run seed:seedCategories`
  - Impact: Service search functionality broken
  - **Result: 38 service categories successfully seeded**

### **2. Server Restart Required**
- [ ] **Stop and restart Convex development server**
  - Current: `npx convex dev` running but needs restart for env vars
  - Action: `Ctrl+C` then `npx convex dev`
  - Impact: Chat API returning 404 until restarted

- [ ] **Stop and restart React development server**
  - Current: `npm run dev` running but may need restart
  - Action: `Ctrl+C` then `npm run dev`
  - Impact: New environment variables not loaded

### **2. Missing Environment Variables**
- [ ] **Add Polar.sh configuration** (required for subscriptions)
  ```bash
  POLAR_ACCESS_TOKEN=your_polar_access_token_here
  POLAR_ORGANIZATION_ID=your_polar_organization_id_here
  POLAR_WEBHOOK_SECRET=your_polar_webhook_secret_here
  ```
  - Impact: Subscription functionality will fail without these

### **3. TypeScript Errors Causing Potential Runtime Issues**
- [ ] **Fix business/category type mismatches** (4 errors)
  - File: `app/routes/business/$slug.tsx:79`
  - File: `app/routes/home.tsx:83`
  - Issue: Category data structure mismatch
  - Impact: Business detail pages may crash

- [ ] **Fix hero component city data typing** (2 errors)
  - File: `app/components/homepage/hero.tsx:87`
  - Issue: `regionCities` type unknown, city parameter implicit any
  - Impact: Homepage search functionality may fail

---

## 🟡 **High Priority Issues**

### **4. Incomplete Error Handling**
- [ ] **Add error boundaries to critical components**
  - File: `app/components/homepage/hero.tsx`
  - File: `app/components/business/business-profile.tsx`
  - File: `app/components/category/category-page-content.tsx`
  - Impact: Component crashes propagate to entire page

- [ ] **Improve subscription query error handling**
  - File: `app/routes/categories.tsx:37`
  - File: `app/routes/cities.tsx:37`
  - File: `app/routes/category/$category.tsx:54`
  - Issue: Expected 2-3 arguments but got 1
  - Impact: Query failures cause route crashes

### **5. Dashboard Sidebar Icon Type Conflicts**
- [ ] **Fix icon component type mismatch**
  - File: `app/components/dashboard/app-sidebar.tsx:57`
  - Issue: Lucide React icons not compatible with expected Icon type
  - Impact: Dashboard sidebar may not render properly

### **6. Success Page useEffect Dependency**
- [ ] **Fix potential infinite loop in useEffect**
  - File: `app/routes/success.tsx:27`
  - Issue: `upsertUser` mutation in dependency array
  - Solution: Use `useCallback` or remove from dependencies
  - Impact: Subscription success page may cause infinite re-renders

---

## 🟢 **Medium Priority Issues**

### **7. API Integration Improvements**
- [ ] **Add retry logic for Convex queries**
  - Location: Throughout the app
  - Issue: Network failures cause permanent errors
  - Solution: Implement exponential backoff retry

- [ ] **Implement proper loading states**
  - Files: All route components
  - Issue: No loading indicators during data fetching
  - Impact: Poor user experience during slow network

### **8. Security & Performance**
- [ ] **Add rate limiting to chat endpoint**
  - File: `convex/http.ts`
  - Issue: No protection against API abuse
  - Impact: OpenAI costs could spike

- [ ] **Implement proper error logging**
  - Location: All error handlers
  - Issue: Console.error only, no persistent logging
  - Solution: Add structured logging service

### **9. Missing Features**
- [ ] **Add webhook endpoint for Polar.sh**
  - File: `convex/http.ts`
  - Issue: Payment webhook handler exists but not fully implemented
  - Impact: Subscription status updates may fail

- [ ] **Implement business data validation**
  - Location: Business creation/editing forms
  - Issue: No client-side validation
  - Impact: Bad data can crash backend

---

## 🔵 **Low Priority Issues**

### **10. Code Quality & Maintenance**
- [ ] **Remove unused imports** (Build warnings)
  - Files: 15+ files with unused imports
  - Issue: "SignOutButton", "Zap", "Share2", "Heart" imported but never used
  - Impact: Larger bundle size

- [ ] **Fix sourcemap resolution errors**
  - Files: Multiple dashboard components
  - Issue: Build process sourcemap warnings
  - Impact: Debugging experience affected

### **11. Documentation & Developer Experience**
- [ ] **Update README with new environment variables**
  - File: `README.md`
  - Issue: Missing new VITE_CLERK_FRONTEND_API_URL requirement
  - Impact: New developers will encounter same issues

- [ ] **Add development troubleshooting guide**
  - Location: Create new file
  - Issue: No guide for common development issues
  - Impact: Repeated debugging sessions

### **12. Testing & Validation**
- [ ] **Add unit tests for error handling**
  - Location: All components with error boundaries
  - Issue: No tests for error scenarios
  - Impact: Regressions may go unnoticed

- [ ] **Add integration tests for API endpoints**
  - Location: Test chat, subscription, and webhook endpoints
  - Issue: No automated testing
  - Impact: Breaking changes not caught early

---

## 🎯 **Quick Wins (Easy to Fix)**

### **Immediate Actions (< 5 minutes each)**
- [ ] **Fix missing import in pricing component**
  - File: `app/components/archived/homepage/pricing.tsx:14`
  - Issue: Cannot find module '../../../convex/_generated/api'
  - Fix: Update import path or move file

- [ ] **Add missing exports to logo index**
  - File: `app/components/logos/index.ts`
  - Issue: Some logos not exported
  - Fix: Add missing export statements

- [ ] **Fix typo in environment variable name**
  - File: Check for any VITE_CONVEX_SITE_URL usage
  - Issue: Should be derived from VITE_CONVEX_URL
  - Fix: Update references

### **Configuration Fixes (< 15 minutes each)**
- [ ] **Update tsconfig.json paths**
  - File: `tsconfig.json`
  - Issue: May need path updates for new imports
  - Fix: Verify all ~ paths resolve correctly

- [ ] **Add missing environment variables to .env.example**
  - File: `.env.example`
  - Issue: Missing VITE_CLERK_FRONTEND_API_URL
  - Fix: Add new required variables

---

## 📋 **Action Plan Priority Order**

### **Phase 1: Critical Stability (Do First)**
1. Restart both development servers
2. Test localhost and chat API endpoints
3. Fix TypeScript errors causing runtime issues
4. Add missing Polar.sh environment variables

### **Phase 2: Error Handling (Do Second)**
1. Add error boundaries to components
2. Fix subscription query parameter issues
3. Resolve useEffect dependency issues
4. Implement proper loading states

### **Phase 3: Code Quality (Do Third)**
1. Remove unused imports
2. Fix icon type conflicts
3. Add proper error logging
4. Update documentation

### **Phase 4: Testing & Features (Do Last)**
1. Add unit tests
2. Implement rate limiting
3. Add webhook functionality
4. Performance optimizations

---

## 🔧 **Testing Checklist**

After each fix, verify:
- [ ] `npm run typecheck` - No new TypeScript errors
- [ ] `npm run build` - Build succeeds
- [ ] `http://localhost:5173` - Homepage loads
- [ ] `/dashboard` - Authentication works
- [ ] `/dashboard/chat` - Chat functionality works
- [ ] Network tab - No 404s or 500s
- [ ] Browser console - No JavaScript errors

---

## 🚨 **Risk Assessment**

**High Risk (Could cause crashes):**
- TypeScript business/category type mismatches
- Missing error handling in route loaders
- useEffect infinite loops

**Medium Risk (Could cause poor UX):**
- Missing loading states
- API query failures
- Icon rendering issues

**Low Risk (Maintenance concerns):**
- Unused imports
- Documentation gaps
- Missing tests

---

## 📞 **Need Help With**

If you encounter issues:
1. Check `DEBUGGING_LOG.md` for similar previous issues
2. Run testing checklist after each change
3. Verify environment variables are loaded correctly
4. Restart servers if behavior seems inconsistent

**Next Review:** After implementing Phase 1 critical fixes

---

**Created by:** Claude Code Assistant  
**Status:** 🟡 **IN PROGRESS** - Critical fixes applied, remaining issues prioritized