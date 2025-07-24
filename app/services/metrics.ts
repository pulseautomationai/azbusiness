/**
 * Custom Metrics Service
 * Provides methods for calculating and tracking business metrics
 */

import type { 
  BusinessEventProps, 
  SubscriptionEventProps, 
  AIEventProps 
} from './events';

// Metric calculation types
export interface RevenueMetrics {
  mrr: number;
  arr: number;
  churnRate: number;
  growthRate: number;
  averageRevenuePerUser: number;
  customerLifetimeValue: number;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  retentionRate: number;
  engagementScore: number;
}

export interface BusinessMetrics {
  totalBusinesses: number;
  claimedBusinesses: number;
  verifiedBusinesses: number;
  businessGrowthRate: number;
  averageReviewsPerBusiness: number;
  planDistribution: Record<string, number>;
}

export interface ConversionFunnel {
  visitors: number;
  signups: number;
  claimed: number;
  subscribed: number;
  conversionRates: {
    visitorToSignup: number;
    signupToClaim: number;
    claimToSubscribe: number;
    overallConversion: number;
  };
}

// Metrics Calculator Class
class MetricsCalculator {
  /**
   * Calculate Monthly Recurring Revenue (MRR)
   */
  calculateMRR(subscriptions: SubscriptionEventProps[]): number {
    return subscriptions.reduce((total, sub) => {
      if (sub.interval === 'monthly') {
        return total + sub.plan_amount;
      }
      if (sub.interval === 'yearly') {
        return total + (sub.plan_amount / 12);
      }
      return total;
    }, 0);
  }

  /**
   * Calculate Annual Recurring Revenue (ARR)
   */
  calculateARR(mrr: number): number {
    return mrr * 12;
  }

  /**
   * Calculate churn rate
   */
  calculateChurnRate(
    subscribersAtStart: number,
    subscribersLost: number,
    periodDays = 30
  ): number {
    if (subscribersAtStart === 0) return 0;
    return (subscribersLost / subscribersAtStart) * 100;
  }

  /**
   * Calculate Customer Lifetime Value (CLV)
   */
  calculateCLV(
    averageRevenuePerUser: number,
    churnRate: number
  ): number {
    if (churnRate === 0) return averageRevenuePerUser * 36; // 3 year estimate
    return averageRevenuePerUser / (churnRate / 100);
  }

  /**
   * Calculate conversion funnel metrics
   */
  calculateConversionFunnel(
    pageViews: number,
    signups: number,
    claimedBusinesses: number,
    subscriptions: number
  ): ConversionFunnel {
    const visitorToSignup = pageViews > 0 ? (signups / pageViews) * 100 : 0;
    const signupToClaim = signups > 0 ? (claimedBusinesses / signups) * 100 : 0;
    const claimToSubscribe = claimedBusinesses > 0 ? (subscriptions / claimedBusinesses) * 100 : 0;
    const overallConversion = pageViews > 0 ? (subscriptions / pageViews) * 100 : 0;

    return {
      visitors: pageViews,
      signups,
      claimed: claimedBusinesses,
      subscribed: subscriptions,
      conversionRates: {
        visitorToSignup,
        signupToClaim,
        claimToSubscribe,
        overallConversion,
      },
    };
  }

  /**
   * Calculate user retention rate
   */
  calculateRetentionRate(
    usersAtStart: number,
    usersRetained: number
  ): number {
    if (usersAtStart === 0) return 0;
    return (usersRetained / usersAtStart) * 100;
  }

  /**
   * Calculate plan upgrade rate
   */
  calculateUpgradeRate(
    totalSubscribers: number,
    upgrades: number
  ): number {
    if (totalSubscribers === 0) return 0;
    return (upgrades / totalSubscribers) * 100;
  }

  /**
   * Calculate AI feature adoption rate
   */
  calculateAIAdoptionRate(
    totalUsers: number,
    usersUsingAI: number
  ): number {
    if (totalUsers === 0) return 0;
    return (usersUsingAI / totalUsers) * 100;
  }

  /**
   * Calculate average session duration
   */
  calculateAverageSessionDuration(sessions: Array<{ duration: number }>): number {
    if (sessions.length === 0) return 0;
    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
    return totalDuration / sessions.length;
  }

  /**
   * Calculate bounce rate
   */
  calculateBounceRate(
    totalSessions: number,
    bouncedSessions: number
  ): number {
    if (totalSessions === 0) return 0;
    return (bouncedSessions / totalSessions) * 100;
  }

  /**
   * Calculate user engagement score
   */
  calculateEngagementScore(
    pageViews: number,
    timeOnSite: number, // in minutes
    actionsPerSession: number,
    bounceRate: number
  ): number {
    // Weighted engagement score (0-100)
    const pageViewScore = Math.min(pageViews * 2, 30);
    const timeScore = Math.min(timeOnSite * 0.5, 25);
    const actionScore = Math.min(actionsPerSession * 5, 30);
    const bounceScore = Math.max(15 - (bounceRate * 0.15), 0);
    
    return Math.round(pageViewScore + timeScore + actionScore + bounceScore);
  }

  /**
   * Calculate Net Promoter Score (NPS) from review ratings
   */
  calculateNPS(ratings: number[]): number {
    if (ratings.length === 0) return 0;

    const promoters = ratings.filter(rating => rating >= 4).length;
    const detractors = ratings.filter(rating => rating <= 2).length;
    
    const promoterPercent = (promoters / ratings.length) * 100;
    const detractorPercent = (detractors / ratings.length) * 100;
    
    return Math.round(promoterPercent - detractorPercent);
  }

  /**
   * Calculate AI cost per user
   */
  calculateAICostPerUser(
    totalAICosts: number,
    activeUsers: number
  ): number {
    if (activeUsers === 0) return 0;
    return totalAICosts / activeUsers;
  }

  /**
   * Calculate business listing performance score
   */
  calculateBusinessPerformanceScore(business: {
    rating: number;
    reviewCount: number;
    claimStatus: boolean;
    planTier: string;
    pageViews: number;
    contactClicks: number;
  }): number {
    let score = 0;
    
    // Rating component (0-30 points)
    score += business.rating * 6;
    
    // Review count component (0-25 points) 
    score += Math.min(business.reviewCount * 0.5, 25);
    
    // Claim status (0-20 points)
    score += business.claimStatus ? 20 : 0;
    
    // Plan tier component (0-15 points)
    const tierScores = { free: 0, starter: 5, pro: 10, power: 15 };
    score += tierScores[business.planTier as keyof typeof tierScores] || 0;
    
    // Engagement component (0-10 points)
    const conversionRate = business.pageViews > 0 ? 
      (business.contactClicks / business.pageViews) * 100 : 0;
    score += Math.min(conversionRate * 2, 10);
    
    return Math.round(Math.min(score, 100));
  }
}

// Export singleton instance
export const metricsCalculator = new MetricsCalculator();

// Export commonly used calculation functions
export const {
  calculateMRR,
  calculateARR,
  calculateChurnRate,
  calculateCLV,
  calculateConversionFunnel,
  calculateRetentionRate,
  calculateUpgradeRate,
  calculateAIAdoptionRate,
  calculateEngagementScore,
  calculateNPS,
  calculateBusinessPerformanceScore
} = metricsCalculator;

// Export the class for advanced usage
export { MetricsCalculator };
export default metricsCalculator;