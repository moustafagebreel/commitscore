'use strict';

const fs = require('fs');
const path = require('path');
const { isGitRepo } = require('../git/reader');
const output = require('../utils/output');

/**
 * Installs commit quality hook into repository .git/hooks directory.
 * @param {Object} options - Command options
 * @param {Object} [_globalOptions={}] - Global CLI flags
 */
async function run(options = {}, _globalOptions = {}) {
  const cwd = process.cwd();

  const repoCheck = await isGitRepo(cwd);
  if (!repoCheck) {
    output.error('Not a git repository. Cannot install hook.');
    process.exit(1);
  }

  const hooksDir = path.join(cwd, '.git', 'hooks');
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  const targetHookPath = path.join(hooksDir, 'commit-msg');
  const sourceHookPath = path.resolve(__dirname, '..', '..', 'hooks', 'pre-commit.js');

  if (!fs.existsSync(sourceHookPath)) {
    output.error(`Source hook file not found at ${sourceHookPath}`);
    process.exit(1);
  }

  if (fs.existsSync(targetHookPath) && !options.force) {
    output.warn('Hook already exists in .git/hooks/commit-msg. Use --force to overwrite.');
    return;
  }

  try {
    const hookContent = `#!/usr/bin/env node\n${fs.readFileSync(sourceHookPath, 'utf8')}`;
    fs.writeFileSync(targetHookPath, hookContent, { mode: 0o755 });

    // Also install as pre-commit if requested or as backup
    const preCommitPath = path.join(hooksDir, 'pre-commit');
    if (!fs.existsSync(preCommitPath) || options.force) {
      fs.writeFileSync(preCommitPath, hookContent, { mode: 0o755 });
    }

    output.success('Git commit quality hook installed successfully in .git/hooks/');
    output.info('Every commit will now be validated before being finalized.');
  } catch (err) {
    output.error(`Failed to install hook: ${err.message}`);
    process.exit(1);
  }
}

module.exports = {
  run,
};
