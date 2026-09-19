'use strict';

/**
 * Calculates weighted score for an individual commit.
 * Merge, revert, and initial commits are ignored from penalty.
 * @param {Object} parsedCommit - Parsed commit object
 * @param {Array<Object>} ruleResults - Array of rule check results
 * @returns {number|null} Score (0-100) or null if ignored
 */
function calculateCommitScore(parsedCommit, ruleResults) {
  if (parsedCommit.isMerge || parsedCommit.isRevert || parsedCommit.isInitial) {
    return null;
  }

  let totalWeight = 0;
  let weightedSum = 0;

  for (const res of ruleResults) {
    const weight = res.weight ?? 0;
    if (weight > 0) {
      totalWeight += weight;
      weightedSum += (res.score ?? 0) * weight;
    }
  }

  if (totalWeight === 0) return 100;
  return Math.round(weightedSum / totalWeight);
}

/**
 * Calculates overall repository/branch score from evaluated commits.
 * @param {Array<Object>} commits - Array of parsed commit objects
 * @param {Array<Array<Object>>} ruleResultsPerCommit - List of rule result arrays
 * @returns {number} Average score from 0 to 100
 */
function calculateOverallScore(commits, ruleResultsPerCommit) {
  const scores = [];

  for (let i = 0; i < commits.length; i++) {
    const commit = commits[i];
    const results = ruleResultsPerCommit[i] || [];
    const score = calculateCommitScore(commit, results);
    if (score !== null) {
      scores.push(score);
    }
  }

  if (scores.length === 0) return 100;

  const total = scores.reduce((sum, val) => sum + val, 0);
  return Math.round(total / scores.length);
}

/**
 * Maps numerical score to grade category.
 * @param {number} score - Score between 0 and 100
 * @returns {{ label: string, emoji: string, color: string }}
 */
function getGrade(score) {
  const s = Math.max(0, Math.min(100, Math.round(score || 0)));

  if (s >= 90) {
    return { label: 'Excellent', emoji: '🟢', color: 'green' };
  }
  if (s >= 70) {
    return { label: 'Good', emoji: '🟡', color: 'yellow' };
  }
  if (s >= 50) {
    return { label: 'Fair', emoji: '🟠', color: 'orange' };
  }
  return { label: 'Poor', emoji: '🔴', color: 'red' };
}

/**
 * Aggregates statistics per rule across all commits.
 * @param {Array<Array<Object>>} ruleResultsPerCommit - Results per commit
 * @returns {Object.<string, { averageScore: number, passedCount: number, failedCount: number, total: number }>}
 */
function getRuleBreakdown(ruleResultsPerCommit) {
  const breakdown = {};

  for (const commitResults of ruleResultsPerCommit) {
    if (!Array.isArray(commitResults)) continue;
    for (const res of commitResults) {
      if (!breakdown[res.name]) {
        breakdown[res.name] = {
          totalScore: 0,
          passedCount: 0,
          failedCount: 0,
          total: 0,
          weight: res.weight,
        };
      }
      breakdown[res.name].totalScore += res.score;
      breakdown[res.name].total += 1;
      if (res.passed) {
        breakdown[res.name].passedCount += 1;
      } else {
        breakdown[res.name].failedCount += 1;
      }
    }
  }

  const result = {};
  for (const [name, data] of Object.entries(breakdown)) {
    result[name] = {
      averageScore: data.total > 0 ? Math.round(data.totalScore / data.total) : 100,
      passedCount: data.passedCount,
      failedCount: data.failedCount,
      total: data.total,
      weight: data.weight,
    };
  }

  return result;
}

module.exports = {
  calculateCommitScore,
  calculateOverallScore,
  getGrade,
  getRuleBreakdown,
};
