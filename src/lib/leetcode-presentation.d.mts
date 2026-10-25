import type { LeetCodeResult } from './leetcode-provider.mjs'

export function leetCodeMetric(result: LeetCodeResult | null | undefined, metric: 'totalSolved' | 'easy' | 'medium' | 'hard' | 'contestRating' | 'contestRanking'): number | null
