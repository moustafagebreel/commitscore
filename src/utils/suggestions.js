'use strict';

const CONVENTIONAL_EXAMPLES = {
  feat: 'feat(auth): add OAuth2 google login provider',
  fix: 'fix(api): handle timeout when database connection drops',
  docs: 'docs(readme): update installation instructions and CLI usage',
  style: 'style(lint): format code according to prettier guidelines',
  refactor: 'refactor(parser): simplify commit token extraction algorithm',
  perf: 'perf(git): cache commit history to speed up repeated queries',
  test: 'test(rules): add unit tests for imperative verb validation',
  build: 'build(deps): bump commander from 10.0.0 to 11.1.0',
  ci: 'ci(github): add workflow for automated testing on push',
  chore: 'chore(release): prepare changelog for v1.0.0 release',
  revert: 'revert: restore previous database migration script',
};

/**
 * Returns a canonical example for a given commit type.
 * @param {string} [type='feat'] - Commit type
 * @returns {string} Example commit message
 */
function getConventionalExample(type = 'feat') {
  return CONVENTIONAL_EXAMPLES[type] || `feat(core): implement new ${type} functionality`;
}

/**
 * Generates 3 intelligent, production-ready suggestions for poor commit messages.
 * @param {Object} parsedCommit - Parsed commit details
 * @param {Array<Object>} [_failedRules=[]] - List of failed rule results
 * @returns {string[]} 3 improved commit suggestions
 */
function suggestBetterCommit(parsedCommit, _failedRules = []) {
  const raw = (parsedCommit.raw || '').trim().toLowerCase();
  const type = parsedCommit.type || (raw.includes('fix') ? 'fix' : 'feat');
  const scope = parsedCommit.scope || 'core';
  const desc = parsedCommit.description || raw;

  // Clean description of generic placeholder words
  let cleanDesc = desc.replace(/^(wip|fix|update|changes|stuff|test|temp|tmp)\s*:?\s*/i, '').trim();

  if (!cleanDesc || cleanDesc.length < 5) {
    if (type === 'fix') {
      return [
        'fix(auth): resolve login session timeout issue',
        'fix(api): handle null response in user endpoint',
        'fix(ui): correct button alignment on mobile viewports',
      ];
    }
    return [
      `feat(${scope}): implement requested feature enhancement`,
      `refactor(${scope}): optimize performance and structure`,
      `chore(${scope}): update dependencies and configuration`,
    ];
  }

  // Ensure first character is lowercase
  cleanDesc = cleanDesc.charAt(0).toLowerCase() + cleanDesc.slice(1);

  return [
    `${type}(${scope}): ${cleanDesc}`,
    `${type}(${scope}): implement ${cleanDesc}`,
    `${type}: ${cleanDesc}`,
  ];
}

/**
 * Returns actionable advice based on failed rules.
 * @param {Array<Object>} failedRules - List of failed rule results
 * @returns {string[]} List of human tips
 */
function getGeneralTips(failedRules = []) {
  const tips = new Set();

  for (const rule of failedRules) {
    switch (rule.name) {
      case 'length':
        tips.add(
          'Keep commit headers between 10 and 72 characters; use the commit body for details.'
        );
        break;
      case 'conventional':
        tips.add('Follow the Conventional Commits format: type(scope): description.');
        break;
      case 'spam':
        tips.add(
          'Avoid vague words like "wip", "fix", or "update" without mentioning what changed.'
        );
        break;
      case 'imperative':
        tips.add(
          'Use imperative mood (e.g. "add feature" instead of "added feature" or "adds feature").'
        );
        break;
      case 'scope':
        tips.add('Specify the module or component affected in parentheses, e.g. fix(auth): ...');
        break;
      case 'capitalization':
        tips.add('Start the commit description with a lowercase letter.');
        break;
      case 'language':
        tips.add('Write commit messages consistently in English or Arabic without mixing.');
        break;
    }
  }

  if (tips.size === 0) {
    tips.add('Maintain concise, imperative commit messages with accurate conventional types.');
  }

  return Array.from(tips);
}

module.exports = {
  suggestBetterCommit,
  getGeneralTips,
  getConventionalExample,
};
