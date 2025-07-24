/**
 * Utility functions for consistent score formatting across the application
 */

/**
 * Format a ranking score with one decimal place
 * @param score - The numeric score (0-100)
 * @returns Formatted score string with one decimal place
 */
export function formatScore(score: number): string {
  return score.toFixed(1);
}

/**
 * Format a score with the /100 suffix
 * @param score - The numeric score (0-100)
 * @returns Formatted score string like "65.2/100"
 */
export function formatScoreWithTotal(score: number): string {
  return `${formatScore(score)}/100`;
}

/**
 * Get score color based on value
 * @param score - The numeric score (0-100)
 * @returns Tailwind color class
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-yellow-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get score background color based on value
 * @param score - The numeric score (0-100)
 * @returns Tailwind background color class
 */
export function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-green-100';
  if (score >= 80) return 'bg-blue-100';
  if (score >= 70) return 'bg-yellow-100';
  if (score >= 60) return 'bg-orange-100';
  return 'bg-red-100';
}