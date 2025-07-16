# Convex Development vs Production Sync Guide

This guide explains how to manage data synchronization between your Convex development and production environments.

## 🏗️ **Environment Overview**

| Environment | Deployment | URL | Purpose |
|-------------|------------|-----|---------|
| **Development** | `calm-dalmatian-709` | `https://calm-dalmatian-709.convex.cloud` | Local testing & development |
| **Production** | `brainy-mole-762` | `https://brainy-mole-762.convex.cloud` | Live website |

## 🔄 **What Syncs Automatically vs Manually**

### ✅ **Automatic Sync (Code Changes)**
```bash
npx convex deploy  # Functions & schema deploy to production
git push           # Triggers Vercel deployment
```

### ❌ **Manual Sync Required (Data Changes)**
- New businesses, categories, cities
- User registrations (keep separate!)
- Business claims
- Any database records

## ⚡ **Quick Sync Commands**

### **🚀 Fastest One-Line Sync (Append Mode - RECOMMENDED)**
```bash
npx convex export --path temp.zip && npx convex import temp.zip --prod --append -y && rm temp.zip
```

### **🔄 Complete Replacement Sync (USE WITH CAUTION)**
```bash
npx convex export --path temp.zip && npx convex import temp.zip --prod --replace-all -y && rm temp.zip
```

## 🛠️ **NPM Scripts (Add to package.json)**

Add these to your `package.json` scripts section:

```json
{
  "scripts": {
    "sync-prod": "npx convex export --path temp.zip && npx convex import temp.zip --prod --append -y && rm temp.zip",
    "sync-prod-replace": "npx convex export --path temp.zip && npx convex import temp.zip --prod --replace-all -y && rm temp.zip",
    "backup-prod": "npx convex export --path prod_backup_$(date +%Y%m%d_%H%M%S).zip --prod"
  }
}
```

Then use:
```bash
npm run sync-prod        # Safe append sync
npm run sync-prod-replace # Complete replacement
npm run backup-prod      # Backup production data
```

## 🎯 **When to Use Each Sync Method**

### **`--append` (Safe Mode) - USE THIS MOST OF THE TIME**
- ✅ Adds new data without deleting existing
- ✅ Keeps all production user data intact
- ✅ Perfect for adding new categories, cities, businesses
- ✅ Safe for regular updates

**Use when:**
- Adding new landing page data
- Adding new service categories
- Adding new cities or businesses
- Regular development updates

### **`--replace-all` (Nuclear Option) - USE SPARINGLY**
- ⚠️ Deletes ALL existing production data
- ⚠️ Replaces with exact copy of development
- ⚠️ Will delete real user registrations and claims!

**Only use when:**
- Initial production setup
- Major database schema migrations
- Emergency complete reset needed

## 📊 **Safety Checks Before Syncing**

### **Check Production Data Count**
```bash
npx convex data businesses --prod | wc -l  # Count businesses
npx convex data categories --prod | wc -l  # Count categories
npx convex data users --prod | wc -l       # Count users (be careful!)
```

### **Backup Production First (Optional)**
```bash
npx convex export --path prod_backup_$(date +%Y%m%d_%H%M%S).zip --prod
```

## 🚀 **Common Workflow Examples**

### **Adding New Landing Pages**
1. Create new categories/cities in development
2. Test landing pages locally
3. Deploy code: `git push` (automatic)
4. Sync data: `npm run sync-prod` (manual)

### **Regular Development Updates**
```bash
# 1. Work in development
npx convex dev
npm run dev

# 2. Deploy code changes
git add .
git commit -m "Add new features"
git push

# 3. Sync any new data (if needed)
npm run sync-prod
```

### **Emergency Production Fix**
```bash
# Fix in development first
npx convex dev

# Quick sync to production
npm run sync-prod
```

## ⚠️ **Important Warnings**

### **🚨 Never Use `--replace-all` in Production Unless Absolutely Necessary**
- It will delete real user accounts
- It will delete actual business claims
- It will delete production analytics data

### **🔒 Production Data Integrity**
- Real users register directly in production
- Business owners submit claims to production
- Keep production and development data separate for real applications

### **📈 Best Practices**
- Use `--append` for 95% of syncs
- Always test in development first
- Consider backing up production before major changes
- Monitor what data you're syncing (avoid overwriting user data)

## 🛑 **Recovery from Mistakes**

If you accidentally used `--replace-all` and lost production data:

### **Restore from Backup**
```bash
npx convex import your_backup.zip --prod --replace-all -y
```

### **Contact Convex Support**
Convex may be able to restore from their backups in emergency situations.

## 📝 **Landing Page Development**

### **No Sync Needed**
- Static pages (about, pricing, contact)
- Pages using existing data combinations
- Template-based dynamic routes

### **Sync Required**
- New service categories
- New cities or regions
- New business data for specific landing pages

---

## 🎯 **Quick Reference**

| Task | Command |
|------|---------|
| **Safe data sync** | `npm run sync-prod` |
| **Emergency complete reset** | `npm run sync-prod-replace` |
| **Backup production** | `npm run backup-prod` |
| **Deploy code only** | `git push` |
| **Check production data** | `npx convex data [table] --prod` |

**Remember: When in doubt, use `--append` mode!** 🚀