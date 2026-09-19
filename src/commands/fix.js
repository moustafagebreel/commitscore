'use strict';

const readline = require('readline');
const simpleGit = require('simple-git');
const { isGitRepo } = require('../git/reader');
const { parseCommit } = require('../git/parser');
const { runRules } = require('../rules');
const { renderFixReport } = require('../render/report');
const { suggestBetterCommit } = require('../utils/suggestions');
const { loadConfig } = require('../utils/config');
const output = require('../utils/output');

/**
 * Prompts user to select an option via readline.
 * @param {string} query - Prompt question
 * @returns {Promise<string>} User input
 */
function promptUser(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

/**
 * Suggests improvements for commit and optionally amends.
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

  const git = simpleGit({ baseDir: cwd });
  const commitRef = options.commit || 'HEAD';

  try {
    const logResult = await git.log({ [commitRef]: null, maxCount: 1 });
    if (!logResult.all || logResult.all.length === 0) {
      output.error(`Commit "${commitRef}" not found.`);
      process.exit(1);
    }

    const targetCommit = logResult.all[0];
    const parsed = parseCommit(targetCommit.message);
    const config = loadConfig(cwd);
    const ruleResults = runRules(parsed, { config });
    const failedRules = ruleResults.filter((r) => !r.passed);

    const suggestions = suggestBetterCommit(parsed, failedRules);
    const fixView = renderFixReport(targetCommit, suggestions);
    output.write(fixView);

    if (options.apply) {
      const isCI = Boolean(process.env.CI || !process.stdin.isTTY);
      let selectedIdx = 0;

      if (!isCI) {
        const choice = await promptUser('Select suggestion (1-3) or press Enter for #1: ');
        const num = parseInt(choice, 10);
        if (!isNaN(num) && num >= 1 && num <= suggestions.length) {
          selectedIdx = num - 1;
        }
      }

      const selectedMessage = suggestions[selectedIdx];
      output.info(`Amending HEAD with: "${selectedMessage}"`);

      // Amend git commit
      await git.raw(['commit', '--amend', '-m', selectedMessage]);
      output.success('Commit successfully updated!');
    } else {
      output.info('Tip: Pass --apply to interactively amend this commit message.');
    }
  } catch (err) {
    output.error(`Failed to fix commit: ${err.message}`);
    process.exit(1);
  }
}

module.exports = {
  run,
};
