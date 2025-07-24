import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Initialize Convex client
const CONVEX_URL = process.env.CONVEX_URL || "https://calm-dalmatian-709.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

async function monitorProgress() {
  console.log("📊 AI Analysis Progress Monitor");
  console.log("================================\n");

  try {
    // Get all businesses with their analysis status
    const businesses = await client.query(api.businesses.getBusinessesWithReviewCounts);
    
    const totalBusinesses = businesses.length;
    const businessesWithReviews = businesses.filter(b => b.reviewCount > 0).length;
    const analyzedBusinesses = businesses.filter(b => b.hasAIAnalysis).length;
    const remainingBusinesses = businessesWithReviews - analyzedBusinesses;
    
    // Calculate totals
    const totalReviews = businesses.reduce((sum, b) => sum + b.reviewCount, 0);
    const analyzedReviews = businesses
      .filter(b => b.hasAIAnalysis)
      .reduce((sum, b) => sum + b.reviewCount, 0);
    
    // Group by analysis status
    const recentlyAnalyzed = businesses.filter(b => {
      if (!b.lastAnalyzed) return false;
      const daysSince = (Date.now() - b.lastAnalyzed) / (1000 * 60 * 60 * 24);
      return daysSince < 1;
    });
    
    const needsAnalysis = businesses.filter(b => 
      b.reviewCount > 0 && (!b.hasAIAnalysis || !b.lastAnalyzed || 
      (Date.now() - b.lastAnalyzed) > 7 * 24 * 60 * 60 * 1000)
    );
    
    // Display summary
    console.log("📈 Overall Progress:");
    console.log(`   Total businesses: ${totalBusinesses}`);
    console.log(`   With reviews: ${businessesWithReviews}`);
    console.log(`   Analyzed: ${analyzedBusinesses} (${Math.round(analyzedBusinesses / businessesWithReviews * 100)}%)`);
    console.log(`   Remaining: ${remainingBusinesses}`);
    console.log();
    
    console.log("📝 Review Analysis:");
    console.log(`   Total reviews: ${totalReviews.toLocaleString()}`);
    console.log(`   Reviews analyzed: ${analyzedReviews.toLocaleString()}`);
    console.log(`   Average reviews per business: ${Math.round(totalReviews / businessesWithReviews)}`);
    console.log();
    
    console.log("⏰ Recent Activity:");
    console.log(`   Analyzed in last 24h: ${recentlyAnalyzed.length}`);
    console.log(`   Needs analysis: ${needsAnalysis.length}`);
    console.log();
    
    // Show top unanalyzed businesses
    if (needsAnalysis.length > 0) {
      console.log("🎯 Top 10 Businesses Needing Analysis:");
      needsAnalysis
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, 10)
        .forEach((business, index) => {
          console.log(`   ${index + 1}. ${business.name} (${business.city}) - ${business.reviewCount} reviews`);
        });
    }
    
    // Progress bar
    const progressPercentage = Math.round(analyzedBusinesses / businessesWithReviews * 100);
    const progressBar = "█".repeat(Math.floor(progressPercentage / 2)) + 
                       "░".repeat(50 - Math.floor(progressPercentage / 2));
    console.log("\n📊 Progress Bar:");
    console.log(`   [${progressBar}] ${progressPercentage}%`);
    
    // Estimate time remaining (if analysis is in progress)
    if (recentlyAnalyzed.length > 0) {
      const avgTimePerBusiness = 5; // seconds (estimate based on internal analyzer)
      const estimatedMinutes = Math.round((remainingBusinesses * avgTimePerBusiness) / 60);
      console.log(`\n⏱️  Estimated time to complete: ${estimatedMinutes} minutes`);
    }

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the monitor
monitorProgress()
  .then(() => {
    console.log("\n✅ Monitor complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  });