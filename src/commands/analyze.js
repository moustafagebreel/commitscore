'use strict';

const fs = require('fs');
const path = require('path');
const ora = require('ora');
const { isGitRepo, getCommits, getCurrentBranch } = require('../git/reader');
const { parseCommit } = require('../git/parser');
const { runRules } = require('../rules');
const {
  calculateCommitScore,
  calculateOverallScore,
  getGrade,
  getRuleBreakdown,
} = require('../scoring/calculator');
const { renderAnalyzeReport } = require('../render/report');
const { loadConfig } = require('../utils/config');
const { getGeneralTips } = require('../utils/suggestions');
const output = require('../utils/output');

/**
 * Analyzes repository commits and outputs quality report.
 * @param {Object} options - Command options
 * @param {Object} [globalOptions={}] - Global CLI flags
 */
async function run(options = {}, globalOptions = {}) {
  const cwd = process.cwd();

  const repoCheck = await isGitRepo(cwd);
  if (!repoCheck) {
    output.error('Not a git repository. Please run commit-lens inside a valid git repository.');
    process.exit(1);
  }

  const spinner = globalOptions.verbose ? null : ora('Analyzing git commits...').start();
  try {
    const config = loadConfig(cwd);
    const limit = parseInt(options.last, 10) || 100;
    const branch = options.branch || (await getCurrentBranch(cwd));

    const rawCommits = await getCommits({
      limit,
      since: options.since,
      until: options.until,
      branch: options.branch,
      author: options.author,
      cwd,
    });

    if (spinner) spinner.stop();

    if (rawCommits.length === 0) {
      output.info('No commits found matching specified criteria.');
      return;
    }

    const parsedCommits = [];
    const ruleResultsPerCommit = [];
    const scoredList = [];
    let ignoredCount = 0;

    for (const rawCommit of rawCommits) {
      const parsed = parseCommit(rawCommit.message);
      const isIgnored =
        parsed.isMerge ||
        parsed.isRevert ||
        parsed.isInitial ||
        (config.ignore.commits || []).some((pat) => new RegExp(pat, 'i').test(rawCommit.message));

      if (isIgnored) {
        ignoredCount += 1;
        continue;
      }

      parsedCommits.push(parsed);
      const ruleResults = runRules(parsed, { config });
      ruleResultsPerCommit.push(ruleResults);

      const score = calculateCommitScore(parsed, ruleResults);
      scoredList.push({
        commit: rawCommit,
        parsed,
        score,
        ruleResults,
      });
    }

    const overallScore = calculateOverallScore(parsedCommits, ruleResultsPerCommit);
    const ruleBreakdown = getRuleBreakdown(ruleResultsPerCommit);
    const worstCommits = scoredList
      .slice()
      .sort((a, b) => (a.score ?? 100) - (b.score ?? 100))
      .slice(0, 5);

    const allFailedRules = [];
    ruleResultsPerCommit.forEach((results) => {
      results.forEach((r) => {
        if (!r.passed) allFailedRules.push(r);
      });
    });
    const suggestions = getGeneralTips(allFailedRules);
    const trendScores = scoredList.map((item) => item.score).reverse();

    const analysisData = {
      overallScore,
      grade: getGrade(overallScore),
      totalCommits: rawCommits.length,
      analyzedCommits: parsedCommits.length,
      ignoredCommits: ignoredCount,
      ruleBreakdown,
      worstCommits,
      suggestions,
      trendScores,
      branch,
    };

    if (options.format === 'json') {
      const jsonOutput = JSON.stringify(analysisData, null, 2);
      if (options.export) {
        fs.writeFileSync(path.resolve(cwd, options.export), jsonOutput, 'utf8');
        output.success(`Report exported to ${options.export}`);
      } else {
        output.write(jsonOutput);
      }
      return;
    }

    const report = renderAnalyzeReport(analysisData);
    output.write(report);

    if (options.export) {
      fs.writeFileSync(
        path.resolve(cwd, options.export),
        JSON.stringify(analysisData, null, 2),
        'utf8'
      );
      output.success(`Analysis data exported to ${options.export}`);
    }
  } catch (err) {
    if (spinner) spinner.stop();
    output.error(`Analysis failed: ${err.message}`);
    process.exit(1);
  }
}

module.exports = {
  run,
};
