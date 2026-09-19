#!/usr/bin/env node
'use strict';

// Suppress output only in CI or test environments
if (process.env.CI || process.env.NODE_ENV === 'test') {
  process.exit(0);
}

try {
  const boxen = require('boxen');
  const chalk = require('chalk');
  const pkg = require('../package.json');

  const lines = [
    `${chalk.bold.cyan('🔍 commitscore')} ${chalk.gray(`v${pkg.version}`)}`,
    chalk.yellow('Analyze, score, and elevate your Git commit quality!'),
    '',
    chalk.bold('🚀 Quick Commands:'),
    `  ${chalk.green('commitscore')} ${chalk.gray('             # Run complete commit quality audit')}`,
    `  ${chalk.green('commitscore fix --apply')} ${chalk.gray(' # Smart interactive commit correction')}`,
    `  ${chalk.green('commitscore install-hook')} ${chalk.gray('# Protect your repo with pre-commit gate')}`,
    '',
    `${chalk.gray('⭐ GitHub:')}  ${chalk.cyan('https://github.com/moustafagebreel/commitscore')}`,
    `${chalk.gray('🌐 Author:')}  ${chalk.cyan('https://moustafagebreel.online')}`,
    '',
    chalk.dim('Thank you for using commitscore! Happy clean committing ✨'),
  ];

  const banner = boxen(lines.join('\n'), {
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderStyle: 'round',
    borderColor: 'cyan',
    align: 'left',
  });

  process.stdout.write(`${banner}\n`);
} catch {
  // Silent fail-safe: installation must never fail due to banner rendering
  process.exit(0);
}
