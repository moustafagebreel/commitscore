'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Fail-open protection: never block git on unhandled script exceptions
try {
  // Dynamically resolve src directory whether running from hooks/ or .git/hooks/
  let baseDir = path.resolve(__dirname, '..');
  if (!fs.existsSync(path.join(baseDir, 'src'))) {
    baseDir = path.resolve(__dirname, '..', '..');
  }
  if (!fs.existsSync(path.join(baseDir, 'src'))) {
    baseDir = process.cwd();
  }

  const { parseCommit } = require(path.join(baseDir, 'src', 'git', 'parser'));
  const { runRules } = require(path.join(baseDir, 'src', 'rules'));
  const { calculateCommitScore, getGrade } = require(path.join(baseDir, 'src', 'scoring', 'calculator'));
  const { loadConfig } = require(path.join(baseDir, 'src', 'utils', 'config'));
  const colors = require(path.join(baseDir, 'src', 'render', 'colors'));

  // Locate commit message file
  const msgFile = process.argv[2] || path.resolve(process.cwd(), '.git', 'COMMIT_EDITMSG');

  if (!fs.existsSync(msgFile)) {
    // Fail-open
    process.exit(0);
  }

  const rawMessage = fs.readFileSync(msgFile, 'utf8');
  // Strip comments (lines starting with #)
  const cleanMessage = rawMessage
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n')
    .trim();

  if (!cleanMessage) {
    process.exit(0);
  }

  const parsed = parseCommit(cleanMessage);

  // Ignore merge, revert, and initial commits
  if (parsed.isMerge || parsed.isRevert || parsed.isInitial) {
    process.exit(0);
  }

  const config = loadConfig(process.cwd());
  const minScore = config.scoring?.passThreshold ?? 70;

  const ruleResults = runRules(parsed, { config });
  const score = calculateCommitScore(parsed, ruleResults);

  if (score === null || score >= minScore) {
    process.exit(0);
  }

  // Quality score is below threshold
  const grade = getGrade(score);
  process.stderr.write('\n');
  process.stderr.write(
    `${colors.yellow('⚠ [commit-lens] Commit Quality Warning:')} Score ${colors.scoreColor(score)(`${score}/100`)} (${grade.label})\n`
  );
  process.stderr.write(`Threshold required: ${minScore}/100\n\n`);

  process.stderr.write('Detected issues:\n');
  for (const res of ruleResults) {
    if (!res.passed) {
      process.stderr.write(`  • ${colors.red(res.name)}: ${res.message}\n`);
      if (res.suggestion) {
        process.stderr.write(`    ↳ ${colors.gray(res.suggestion)}\n`);
      }
    }
  }
  process.stderr.write('\n');

  const isCI = Boolean(process.env.CI || !process.stdin.isTTY);
  if (isCI) {
    // In CI environments, do not block interactively
    process.exit(0);
  }

  // Interactive prompt using /dev/tty on Unix or stdin on Windows
  let inputSource = process.stdin;
  try {
    if (process.platform !== 'win32' && fs.existsSync('/dev/tty')) {
      inputSource = fs.createReadStream('/dev/tty');
    }
  } catch {
    inputSource = process.stdin;
  }

  const rl = readline.createInterface({
    input: inputSource,
    output: process.stderr,
  });

  rl.question(colors.bold('Do you still want to proceed with this commit? [y/N]: '), (answer) => {
    rl.close();
    if (answer.trim().toLowerCase() === 'y' || answer.trim().toLowerCase() === 'yes') {
      process.exit(0);
    } else {
      process.stderr.write(colors.red('Commit aborted. Please refine your commit message.\n\n'));
      process.exit(1);
    }
  });
} catch (err) {
  // Fail-open: Never block developer git workflow on internal unexpected hook crash
  process.stderr.write(`[commit-lens hook warning] Could not verify commit: ${err.message}\n`);
  process.exit(0);
}
