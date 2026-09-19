'use strict';

const { isGitRepo, getCommits } = require('../git/reader');
const { parseCommit } = require('../git/parser');
const { runRules } = require('../rules');
const { calculateCommitScore, calculateOverallScore } = require('../scoring/calculator');
const { renderCheckReport } = require('../render/report');
const { loadConfig } = require('../utils/config');
const output = require('../utils/output');

/**
 * Runs commit quality verification for CI/CD pipelines.
 * @param {Object} options - Command options
 * @param {Object} [_globalOptions={}] - Global CLI flags
 */
async function run(options = {}, _globalOptions = {}) {
  const cwd = process.cwd();

  const repoCheck = await isGitRepo(cwd);
  if (!repoCheck) {
    output.error('Not a git repository.');
    process.exit(1);
  }

  const config = loadConfig(cwd);
  const minScore = parseInt(options.minScore, 10) || config.scoring.passThreshold || 70;
  const failOn = parseInt(options.failOn, 10) || config.scoring.failCI || 60;
  const limit = parseInt(options.last, 10) || 50;

  try {
    const rawCommits = await getCommits({ limit, branch: options.branch, cwd });

    if (rawCommits.length === 0) {
      output.info('No commits found to verify.');
      return;
    }

    const parsedCommits = [];
    const ruleResultsPerCommit = [];
    const scoredList = [];

    for (const rawCommit of rawCommits) {
      const parsed = parseCommit(rawCommit.message);
      if (parsed.isMerge || parsed.isRevert || parsed.isInitial) {
        continue;
      }

      parsedCommits.push(parsed);
      const ruleResults = runRules(parsed, { config });
      ruleResultsPerCommit.push(ruleResults);

      const score = calculateCommitScore(parsed, ruleResults);
      scoredList.push({ commit: rawCommit, parsed, score });
    }

    const overallScore = calculateOverallScore(parsedCommits, ruleResultsPerCommit);
    const passed = overallScore >= minScore;
    const worstCommits = scoredList.sort((a, b) => (a.score ?? 100) - (b.score ?? 100));

    const checkReport = renderCheckReport({
      overallScore,
      minScore,
      failOn,
      passed,
      worstCommits,
    });

    output.write(checkReport);

    if (overallScore < failOn || !passed) {
      output.error(
        `Check failed: overall score (${overallScore}) is below threshold (${minScore}).`
      );
      process.exit(1);
    } else {
      output.success(`Quality check passed with score ${overallScore}/100.`);
      process.exit(0);
    }
  } catch (err) {
    output.error(`CI Check error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = {
  run,
};
