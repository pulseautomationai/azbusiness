#!/usr/bin/env tsx

import * as dotenv from 'dotenv';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

class FeaturedBusinessManager {
  private convex: ConvexHttpClient;

  constructor() {
    const convexUrl = process.env.VITE_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('VITE_CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable is required');
    }
    this.convex = new ConvexHttpClient(convexUrl);
  }

  /**
   * List all currently featured businesses
   */
  async listFeatured() {
    console.log('📋 Fetching currently featured businesses...\n');
    
    const featured = await this.convex.query(api.businesses.getFeaturedBusinesses);
    
    if (featured.length === 0) {
      console.log('❌ No featured businesses found');
      return;
    }

    console.log(`✅ Found ${featured.length} featured businesses:\n`);
    featured.forEach((business, index) => {
      console.log(`${index + 1}. ${business.name}`);
      console.log(`   📍 ${business.city}, AZ`);
      console.log(`   🏷️  Category: ${business.category?.name || 'Unknown'}`);
      console.log(`   ⭐ Rating: ${business.rating} (${business.reviewCount} reviews)`);
      console.log(`   🎯 Priority: ${business.priority}`);
      console.log(`   🆔 ID: ${business._id}\n`);
    });
  }

  /**
   * Get top-rated businesses as candidates for featuring
   */
  async getCandidates() {
    console.log('🔍 Finding top-rated businesses to feature...\n');
    
    // Get HVAC businesses as candidates (since we have many of those)
    const businesses = await this.convex.query(api.businesses.getBusinesses, {
      categorySlug: 'hvac-services',
    });

    // Sort by rating and review count
    const sorted = businesses
      .filter(b => b.rating >= 4.5 && b.reviewCount > 100)
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      })
      .slice(0, 10);

    console.log(`Found ${sorted.length} high-rated businesses:\n`);
    sorted.forEach((business, index) => {
      console.log(`${index + 1}. ${business.name}`);
      console.log(`   📍 ${business.city}, AZ`);
      console.log(`   ⭐ ${business.rating} (${business.reviewCount} reviews)`);
      console.log(`   🆔 ${business._id}\n`);
    });

    return sorted;
  }

  /**
   * Mark specific businesses as featured
   */
  async markAsFeatured(businessIds: string[], priorities?: number[]) {
    console.log(`🎯 Marking ${businessIds.length} businesses as featured...\n`);

    for (let i = 0; i < businessIds.length; i++) {
      const businessId = businessIds[i];
      const priority = priorities?.[i] || (businessIds.length - i); // Default priority: higher for first items

      try {
        const result = await this.convex.mutation(api.businesses.updateBusinessFeaturedStatus, {
          businessId: businessId as any,
          featured: true,
          priority: priority,
        });

        if (result.success && result.business) {
          console.log(`✅ Featured: ${result.business.name} (Priority: ${priority})`);
        }
      } catch (error) {
        console.error(`❌ Failed to feature business ${businessId}:`, error);
      }
    }
  }

  /**
   * Remove featured status from a business
   */
  async unfeature(businessId: string) {
    try {
      const result = await this.convex.mutation(api.businesses.updateBusinessFeaturedStatus, {
        businessId: businessId as any,
        featured: false,
      });

      if (result.success && result.business) {
        console.log(`✅ Unfeatured: ${result.business.name}`);
      }
    } catch (error) {
      console.error(`❌ Failed to unfeature business:`, error);
    }
  }

  /**
   * Quick setup: Feature top 6 businesses
   */
  async quickSetup() {
    console.log('🚀 Quick setup: Featuring top 6 businesses...\n');

    const candidates = await this.getCandidates();
    
    if (candidates.length === 0) {
      console.log('❌ No suitable candidates found');
      return;
    }

    // Take top 6 businesses
    const toFeature = candidates.slice(0, 6);
    const businessIds = toFeature.map(b => b._id);
    const priorities = [100, 90, 80, 70, 60, 50]; // Descending priorities

    await this.markAsFeatured(businessIds, priorities);
    
    console.log('\n✅ Quick setup completed!');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const manager = new FeaturedBusinessManager();

  const command = args[0];

  try {
    switch (command) {
      case 'list':
        await manager.listFeatured();
        break;
        
      case 'candidates':
        await manager.getCandidates();
        break;
        
      case 'quick-setup':
        await manager.quickSetup();
        break;
        
      case 'feature':
        if (args.length < 2) {
          console.error('Usage: npm run featured-businesses feature <businessId> [priority]');
          process.exit(1);
        }
        const businessId = args[1];
        const priority = args[2] ? parseInt(args[2]) : undefined;
        await manager.markAsFeatured([businessId], priority ? [priority] : undefined);
        break;
        
      case 'unfeature':
        if (args.length < 2) {
          console.error('Usage: npm run featured-businesses unfeature <businessId>');
          process.exit(1);
        }
        await manager.unfeature(args[1]);
        break;
        
      default:
        console.log('Featured Business Manager\n');
        console.log('Commands:');
        console.log('  list                    - List all featured businesses');
        console.log('  candidates              - Show top-rated businesses as candidates');
        console.log('  quick-setup             - Automatically feature top 6 businesses');
        console.log('  feature <id> [priority] - Mark a business as featured');
        console.log('  unfeature <id>          - Remove featured status');
        console.log('\nExamples:');
        console.log('  npm run featured-businesses list');
        console.log('  npm run featured-businesses quick-setup');
        console.log('  npm run featured-businesses feature jn7am94az0wqtqqp3865q75n7n7kdmcp 100');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();