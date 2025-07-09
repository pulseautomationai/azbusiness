# How to Seed Cities Data

## Issue
The city dropdown on the homepage is empty because the cities table hasn't been seeded with data yet.

## Solution
You need to run the seed mutation to populate the cities table.

## Steps to Fix:

### Option 1: Using Convex Dashboard
1. Go to your Convex dashboard: https://dashboard.convex.dev
2. Navigate to your `azbusiness` project
3. Go to the "Functions" tab
4. Find the `seed:seedCities` mutation
5. Click "Run" to execute it
6. It should return: `{ message: "Cities seeded successfully", count: 58 }`

### Option 2: Using Convex CLI
```bash
# In your terminal, run:
npx convex run seed:seedCities
```

### Option 3: Programmatically (if needed)
You can also call this from your React app temporarily:
```typescript
// In any component, add this temporarily
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const seedCities = useMutation(api.seed.seedCities);
const handleSeedCities = () => seedCities();

// Add a button: <button onClick={handleSeedCities}>Seed Cities</button>
```

## Verification
After seeding, refresh the homepage and the city dropdown should be populated with 58 Arizona cities grouped by region:
- Phoenix Metro Area (17 cities)
- Tucson Metro Area (6 cities)  
- Northern Arizona (9 cities)
- Western Arizona (5 cities)
- Eastern Arizona (10 cities)
- Other (11 cities)

## Additional Seeding
You may also want to seed categories:
```bash
npx convex run seed:seedCategories
```

This will add 38 service categories to the database.