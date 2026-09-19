'use strict';

/**
 * Formats a Date object as YYYY-MM-DD string.
 * @param {Date|string|number} date - Target date
 * @returns {string} YYYY-MM-DD
 */
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns human-readable relative duration string (e.g. "2 days ago").
 * @param {Date|string|number} date - Target date
 * @returns {string} Relative time string
 */
function formatRelative(date) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
}

/**
 * Groups commits by their calendar day (YYYY-MM-DD).
 * @param {Array<Object>} commits - List of commits
 * @returns {Object.<string, Array<Object>>} Commits grouped by day
 */
function groupByDay(commits) {
  const groups = {};
  for (const commit of commits) {
    const key = formatDate(commit.date);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(commit);
  }
  return groups;
}

/**
 * Generates ISO date range for the past N days.
 * @param {number} days - Number of days back
 * @returns {{ from: string, to: string }} Date range
 */
function getDateRange(days = 30) {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  return {
    from: formatDate(fromDate),
    to: formatDate(toDate),
  };
}

module.exports = {
  formatDate,
  formatRelative,
  groupByDay,
  getDateRange,
};
