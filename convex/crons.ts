import { cronJobs } from "convex/server";
import { api, internal } from "./_generated/api";

const crons = cronJobs();

// Daily review sync at 2 AM local time (adjust timezone as needed)
crons.daily(
  "daily-review-sync",
  { hourUTC: 9, minuteUTC: 0 }, // 2 AM MST = 9 AM UTC
  api.reviewSync.dailyReviewSync
);

// Daily cleanup of old metrics (keep last 7 days)
crons.daily(
  "cleanup-old-metrics",
  { hourUTC: 10, minuteUTC: 0 }, // Run at 3 AM MST = 10 AM UTC
  api.geoScraperMetrics.cleanupOldMetrics,
  { daysToKeep: 7 }
);

// Clear stuck queue items every 15 minutes
crons.interval(
  "clear-stuck-queue-items",
  { minutes: 15 },
  api.geoScraperQueue.clearStuckItems
);

// Add businesses to review queue every hour for overnight processing
crons.hourly(
  "hourly-review-queue-refill",
  { minuteUTC: 0 }, // Run at the top of each hour
  api.reviewSync.hourlyQueueRefill
);

// Lightweight platform stats sync every hour
crons.hourly(
  "sync-platform-stats",
  { minuteUTC: 30 },
  api.platformStats.lightweightStatsSync
);

// AI Ranking System Crons

// Daily ranking update - runs at 2:30 AM Arizona time
crons.daily(
  "daily-ranking-update",
  {
    hourUTC: 9, // 2:30 AM MST
    minuteUTC: 30,
  },
  internal.rankings.cronJobs.dailyRankingUpdate
);

// Hourly achievement check for recently reviewed businesses
crons.hourly(
  "hourly-achievement-check",
  {
    minuteUTC: 45, // Run at 45 minutes past each hour
  },
  internal.achievements.cronJobs.hourlyAchievementCheck
);

// Weekly comprehensive achievement audit - Sunday at 3 AM
crons.weekly(
  "weekly-achievement-audit",
  {
    dayOfWeek: "sunday",
    hourUTC: 10, // 3 AM MST
    minuteUTC: 0,
  },
  internal.achievements.cronJobs.weeklyAchievementAudit
);

// Weekly ranking report generation - Monday at 6 AM
crons.weekly(
  "weekly-ranking-report",
  {
    dayOfWeek: "monday",
    hourUTC: 13, // 6 AM MST
    minuteUTC: 0,
  },
  internal.rankings.cronJobs.weeklyRankingReport
);

export default crons;