#!/usr/bin/env node
'use strict';

const { Command } = require('commander');
const pkg = require('../package.json');

const program = new Command();

program
  .name('commit-lens')
  .description(pkg.description)
  .version(pkg.version, '-v, --version', 'output current version')
  .option('--verbose', 'enable verbose logging')
  .option('--no-color', 'disable colored terminal output');

// Command: analyze (default)
program
  .command('analyze', { isDefault: true })
  .description('Perform full commit quality analysis')
  .option('-l, --last <count>', 'number of recent commits to inspect', '100')
  .option('--since <date>', 'analyze commits since date/ref')
  .option('--until <date>', 'analyze commits until date/ref')
  .option('-b, --branch <name>', 'analyze specific git branch')
  .option('-a, --author <email>', 'filter commits by author')
  .option('-f, --format <type>', 'output format ("text" or "json")', 'text')
  .option('-e, --export <path>', 'export analysis results to file')
  .action(async (options) => {
    const analyzeCmd = require('../src/commands/analyze');
    await analyzeCmd.run(options, program.opts());
  });

// Command: check (for CI)
program
  .command('check')
  .description('Verify commit quality threshold for CI pipelines')
  .option('--min-score <score>', 'minimum acceptable score (0-100)', '70')
  .option('--fail-on <score>', 'score threshold below which CI exits with code 1', '60')
  .option('-l, --last <count>', 'number of commits to check', '50')
  .option('-b, --branch <name>', 'target branch')
  .action(async (options) => {
    const checkCmd = require('../src/commands/check');
    await checkCmd.run(options, program.opts());
  });

// Command: fix
program
  .command('fix')
  .description('Suggest and apply improvements for recent commit messages')
  .option('-c, --commit <hash>', 'specific commit hash to fix (defaults to HEAD)', 'HEAD')
  .option('--apply', 'interactively amend commit with chosen suggestion')
  .action(async (options) => {
    const fixCmd = require('../src/commands/fix');
    await fixCmd.run(options, program.opts());
  });

// Command: install-hook
program
  .command('install-hook')
  .description('Install Git pre-commit hook to evaluate messages automatically')
  .option('--force', 'overwrite existing pre-commit hook')
  .action(async (options) => {
    const installHookCmd = require('../src/commands/install-hook');
    await installHookCmd.run(options, program.opts());
  });

// Command: init
program
  .command('init')
  .description('Create .commit-lensrc.json configuration file in current repository')
  .option('--force', 'overwrite existing configuration file')
  .action(async (options) => {
    const initCmd = require('../src/commands/init');
    await initCmd.run(options, program.opts());
  });

program.parseAsync(process.argv).catch((err) => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
