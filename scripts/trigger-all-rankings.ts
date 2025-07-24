import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Initialize Convex client
const CONVEX_URL = process.env.CONVEX_URL || "https://calm-dalmatian-709.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

async function triggerAllRankings() {
  console.log("🏆 Triggering ranking calculation for ALL analyzed businesses...\n");
  
  try {
    let cursor: string | null | undefined = undefined;
    let batchNum = 1;
    let totalScheduled = 0;
    
    do {
      console.log(`📊 Scheduling ranking batch ${batchNum}...`);
      
      const result = await client.mutation(api.rankings.calculateRankings.batchCalculateRankingsPublic, {
        limit: 100,
        cursor: cursor
      });
      
      totalScheduled += result.scheduled;
      cursor = result.nextCursor || null;
      
      console.log(`   ✓ Scheduled ${result.scheduled} businesses (Total: ${totalScheduled})`);
      
      if (result.hasMore && cursor) {
        batchNum++;
        console.log(`   ⏳ Waiting 10 seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    } while (cursor);
    
    console.log(`\n✅ All ${totalScheduled} businesses scheduled for ranking calculation!`);
    console.log("📈 Rankings will be calculated over the next few minutes.");
    console.log("🔍 Check your website to see the updated rankings!");
    
  } catch (error) {
    console.error("❌ Error scheduling rankings:", error);
  }
}

// Run the script
console.log("🚀 Ranking Calculation Trigger");
console.log("==============================");
console.log("This will calculate scores for all analyzed businesses.\n");

triggerAllRankings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });