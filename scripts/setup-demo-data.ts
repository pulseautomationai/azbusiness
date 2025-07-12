// Demo data setup script for showcasing enhanced business features
// Run with: npx tsx scripts/setup-demo-data.ts

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);

async function setupDemoData() {
  console.log("🚀 Setting up demo data for enhanced business features...");

  try {
    // Get all businesses to find some to enhance
    const businesses = await client.query(api.businesses.getAllBusinesses, {});
    console.log(`Found ${businesses.length} businesses`);

    if (businesses.length === 0) {
      console.log("❌ No businesses found. Please import businesses first with 'npm run import-csv'");
      return;
    }

    // Take first 3 businesses and set them to different plan tiers
    const demoBusinesses = businesses.slice(0, 3);

    // Set first business to FREE tier (default)
    if (demoBusinesses[0]) {
      await client.mutation(api.businesses.updateBusiness, {
        businessId: demoBusinesses[0]._id,
        updates: {
          planTier: "free",
          claimed: false,
          verified: false,
          priority: 1
        }
      });
      console.log(`✅ Set ${demoBusinesses[0].name} to FREE tier (unclaimed)`);
    }

    // Set second business to PRO tier
    if (demoBusinesses[1]) {
      await client.mutation(api.businesses.updateBusiness, {
        businessId: demoBusinesses[1]._id,
        updates: {
          planTier: "pro",
          claimed: true,
          verified: true,
          priority: 5
        }
      });

      // Add some enhanced business content for Pro tier
      await client.mutation(api.businessContent.updateBusinessContent, {
        businessId: demoBusinesses[1]._id,
        updates: {
          customSummary: "We are the leading HVAC specialists in Phoenix, serving residential and commercial clients with 24/7 emergency service. Our certified technicians provide expert installation, repair, and maintenance services.",
          serviceCards: [
            {
              name: "Emergency HVAC Repair",
              description: "24/7 emergency repair services for heating and cooling systems",
              pricing: "$150-300",
              icon: "wrench",
              featured: true
            },
            {
              name: "AC Installation",
              description: "Professional air conditioning installation and setup",
              pricing: "$3,000-8,000",
              icon: "snowflake",
              featured: true
            },
            {
              name: "Maintenance Plans",
              description: "Annual maintenance plans to keep your system running efficiently",
              pricing: "$200-400/year",
              icon: "settings",
              featured: false
            }
          ]
        }
      });
      console.log(`✅ Set ${demoBusinesses[1].name} to PRO tier with enhanced content`);
    }

    // Set third business to POWER tier with full AI content
    if (demoBusinesses[2]) {
      await client.mutation(api.businesses.updateBusiness, {
        businessId: demoBusinesses[2]._id,
        updates: {
          planTier: "power",
          claimed: true,
          verified: true,
          featured: true,
          priority: 10
        }
      });

      // Add comprehensive business content for Power tier
      await client.mutation(api.businessContent.updateBusinessContent, {
        businessId: demoBusinesses[2]._id,
        updates: {
          customSummary: "Transform your home comfort with Arizona's premier HVAC experts! Our award-winning team delivers cutting-edge climate solutions with unmatched reliability. From energy-efficient installations to 24/7 emergency repairs, we're your trusted partner in year-round comfort. Experience the difference of true craftsmanship and customer-first service.",
          serviceCards: [
            {
              name: "Smart HVAC Systems",
              description: "AI-powered climate control systems with smartphone integration and energy optimization",
              pricing: "$5,000-12,000",
              icon: "cpu",
              featured: true
            },
            {
              name: "Energy Efficiency Audits",
              description: "Comprehensive home energy assessments with detailed improvement recommendations",
              pricing: "$200-400",
              icon: "zap",
              featured: true
            },
            {
              name: "Emergency Response",
              description: "Priority 24/7 emergency service with 2-hour response guarantee",
              pricing: "$0 service call",
              icon: "phone",
              featured: true
            },
            {
              name: "Maintenance Memberships",
              description: "VIP maintenance plans with priority scheduling and exclusive discounts",
              pricing: "$299-599/year",
              icon: "crown",
              featured: false
            }
          ],
          customOffers: [
            {
              title: "New Customer Special",
              description: "50% off your first service call plus free system diagnostic",
              validUntil: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
              code: "WELCOME50",
              type: "percentage"
            },
            {
              title: "Spring Tune-Up",
              description: "Complete system maintenance and efficiency check for just $99",
              validUntil: Date.now() + (60 * 24 * 60 * 60 * 1000), // 60 days from now
              code: "SPRING99",
              type: "fixed"
            }
          ],
          seoAudit: {
            lastRun: Date.now(),
            metaScore: 92,
            performanceScore: 88,
            mobileScore: 95,
            suggestions: [
              "Add schema markup for local business",
              "Optimize images with WebP format",
              "Improve page load speed by 0.3 seconds",
              "Add more local keywords to content"
            ]
          },
          reviewAnalysis: {
            lastAnalyzed: Date.now(),
            sentiment: {
              positive: 0.85,
              neutral: 0.12,
              negative: 0.03
            },
            keywords: ["professional", "reliable", "fast service", "quality work", "fair pricing"],
            trends: ["Increasing positive mentions of response time", "High satisfaction with technician expertise"],
            highlights: [
              "Customers consistently praise quick response times",
              "Technical expertise highly rated",
              "Professional and courteous service"
            ],
            improvements: [
              "Consider expanding weekend availability",
              "Add more preventive maintenance options"
            ]
          },
          aiEnrichment: {
            summaryGeneratedAt: Date.now(),
            servicesEnrichedAt: Date.now(),
            reviewsAnalyzedAt: Date.now(),
            offersGeneratedAt: Date.now(),
            totalTokensUsed: 2500,
            enrichmentVersion: "1.0.0"
          }
        }
      });
      console.log(`✅ Set ${demoBusinesses[2].name} to POWER tier with full AI content`);
    }

    console.log("\n🎉 Demo data setup complete!");
    console.log("\nYou can now demo the different tiers:");
    console.log(`📱 FREE: ${demoBusinesses[0]?.name} - Shows basic features with upgrade prompts`);
    console.log(`✨ PRO: ${demoBusinesses[1]?.name} - Shows enhanced analytics and customization`);
    console.log(`⚡ POWER: ${demoBusinesses[2]?.name} - Shows full AI suite and advanced features`);
    
    // Show the URLs for easy access
    if (demoBusinesses[0]) {
      const freeUrl = `/hvac-services/phoenix/${demoBusinesses[0].name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
      console.log(`\n🔗 FREE tier demo: http://localhost:5173${freeUrl}`);
    }
    if (demoBusinesses[1]) {
      const proUrl = `/hvac-services/phoenix/${demoBusinesses[1].name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
      console.log(`🔗 PRO tier demo: http://localhost:5173${proUrl}`);
    }
    if (demoBusinesses[2]) {
      const powerUrl = `/hvac-services/phoenix/${demoBusinesses[2].name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
      console.log(`🔗 POWER tier demo: http://localhost:5173${powerUrl}`);
    }

  } catch (error) {
    console.error("❌ Error setting up demo data:", error);
  }
}

if (require.main === module) {
  setupDemoData();
}

export { setupDemoData };