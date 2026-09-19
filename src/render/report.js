'use strict';

const boxen = require('boxen');
const Table = require('cli-table3');
const colors = require('./colors');
const { renderPercentageBar, renderTrend, renderScoreGauge } = require('./charts');
const { getGrade } = require('../scoring/calculator');

/**
 * Builds complete terminal report for analyze command.
 * @param {Object} data - Analysis summary data
 * @returns {string} Formatted CLI report
 */
function renderAnalyzeReport(data) {
  const {
    overallScore = 0,
    totalCommits = 0,
    analyzedCommits = 0,
    ignoredCommits = 0,
    ruleBreakdown = {},
    worstCommits = [],
    suggestions = [],
    trendScores = [],
    branch = 'current',
  } = data;

  const lines = [];

  // Header Box
  const grade = getGrade(overallScore);
  const headerContent = [
    `${colors.bold.cyan('COMMIT LENS')} - Commit Quality Analysis`,
    `${colors.gray('Branch:')} ${colors.bold(branch)}  |  ${colors.gray('Total:')} ${totalCommits} commits  |  ${colors.gray('Analyzed:')} ${analyzedCommits}  |  ${colors.gray('Ignored (merge/revert):')} ${ignoredCommits}`,
    '',
    renderScoreGauge(overallScore),
  ].join('\n');

  lines.push(
    boxen(headerContent, {
      padding: 1,
      margin: { top: 0, bottom: 1, left: 0, right: 0 },
      borderStyle: 'round',
      borderColor: grade.color === 'orange' ? 'yellow' : grade.color,
    })
  );

  // Trend
  if (trendScores.length > 0) {
    lines.push(colors.bold('Quality Trend (Recent commits):'));
    lines.push(`[Old] ${renderTrend(trendScores, 30)} [New]`);
    lines.push('');
  }

  // Rules Breakdown Table
  lines.push(colors.bold('Rules Breakdown:'));
  const table = new Table({
    head: [
      colors.cyan('Rule'),
      colors.cyan('Weight'),
      colors.cyan('Average Score'),
      colors.cyan('Pass Rate'),
    ],
    colWidths: [18, 10, 32, 14],
  });

  for (const [name, stats] of Object.entries(ruleBreakdown)) {
    const passRate = stats.total > 0 ? Math.round((stats.passedCount / stats.total) * 100) : 100;
    table.push([
      colors.bold(name),
      `${stats.weight}%`,
      renderPercentageBar(stats.averageScore, 18),
      `${colors.scoreColor(passRate)(`${passRate}%`)} (${stats.passedCount}/${stats.total})`,
    ]);
  }
  lines.push(table.toString());
  lines.push('');

  // Worst Commits
  if (worstCommits.length > 0) {
    lines.push(colors.bold.red('Lowest Scoring Commits:'));
    for (const item of worstCommits.slice(0, 5)) {
      const shortHash = (item.commit.hash || '').substring(0, 7);
      const scoreColor = colors.scoreColor(item.score);
      lines.push(
        `  ${colors.gray(shortHash)} ${scoreColor(`[${item.score}/100]`)} ${item.commit.message.split('\n')[0]}`
      );
    }
    lines.push('');
  }

  // Suggestions
  if (suggestions.length > 0) {
    lines.push(colors.bold.yellow('💡 Recommendations for Improvement:'));
    for (const tip of suggestions) {
      lines.push(`  • ${tip}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Builds compact report for CI/CD checks.
 * @param {Object} data - CI check summary
 * @returns {string} Concise CI output
 */
function renderCheckReport(data) {
  const { overallScore, minScore, passed, worstCommits = [] } = data;
  const grade = getGrade(overallScore);
  const statusBadge = passed ? colors.green.bold('✔ PASSED') : colors.red.bold('✖ FAILED');

  const content = [
    `Commit Quality Check: ${statusBadge}`,
    `${colors.bold('Score:')} ${overallScore}/100 (Threshold: ${minScore}/100) ${grade.emoji}`,
  ];

  if (!passed && worstCommits.length > 0) {
    content.push('', colors.bold('Commits needing revision:'));
    for (const item of worstCommits.slice(0, 3)) {
      const hash = (item.commit.hash || '').substring(0, 7);
      content.push(`  - ${hash}: "${item.commit.message.split('\n')[0]}" (${item.score}/100)`);
    }
  }

  return boxen(content.join('\n'), {
    padding: 1,
    borderStyle: 'classic',
    borderColor: passed ? 'green' : 'red',
  });
}

/**
 * Builds report showing fix suggestions for a commit.
 * @param {Object} commit - Original commit object
 * @param {Array<string>} suggestions - Suggested replacement messages
 * @returns {string} Formatted fix view
 */
function renderFixReport(commit, suggestions = []) {
  const lines = [
    `${colors.bold('Original Message:')} ${colors.red(`"${commit.message.trim()}"`)}`,
    '',
    colors.bold.green('Suggested Replacements:'),
  ];

  suggestions.forEach((suggestion, idx) => {
    lines.push(`  ${colors.cyan(`${idx + 1}.`)} ${suggestion}`);
  });

  return boxen(lines.join('\n'), {
    padding: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
  });
}

/**
 * Renders individual commit details and all rule results.
 * @param {Object} commit - Commit object
 * @param {Array<Object>} ruleResults - Rules results
 * @returns {string} Detailed breakdown
 */
function renderCommitDetail(commit, ruleResults = []) {
  const lines = [
    `${colors.bold('Commit:')} ${commit.hash}`,
    `${colors.bold('Author:')} ${commit.author.name} <${commit.author.email}>`,
    `${colors.bold('Message:')} ${commit.message.trim()}`,
    '',
    colors.bold('Rules Evaluation:'),
  ];

  for (const res of ruleResults) {
    const icon = res.passed ? colors.green('✔') : colors.red('✖');
    const scoreStr = colors.scoreColor(res.score)(`[${res.score}/100]`);
    lines.push(`  ${icon} ${colors.bold(res.name.padEnd(15))} ${scoreStr} ${res.message}`);
    if (!res.passed && res.suggestion) {
      lines.push(`    ${colors.gray('↳ Suggestion:')} ${colors.yellow(res.suggestion)}`);
    }
  }

  return lines.join('\n');
}

module.exports = {
  renderAnalyzeReport,
  renderCheckReport,
  renderFixReport,
  renderCommitDetail,
};
