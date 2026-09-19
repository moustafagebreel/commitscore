'use strict';

const lengthRule = require('./length');
const conventionalRule = require('./conventional');
const spamRule = require('./spam');
const languageRule = require('./language');
const scopeRule = require('./scope');
const imperativeRule = require('./imperative');
const capitalizationRule = require('./capitalization');

/**
 * Registry of all available quality rules
 */
const rules = [
  lengthRule,
  conventionalRule,
  spamRule,
  languageRule,
  scopeRule,
  imperativeRule,
  capitalizationRule,
];

/**
 * Evaluates a parsed commit against all registered quality rules.
 * @param {Object} parsedCommit - Parsed commit details
 * @param {Object} [context={}] - Configuration and context
 * @returns {Array<{ name: string, weight: number, passed: boolean, score: number, message: string, suggestion?: string }>}
 */
function runRules(parsedCommit, context = {}) {
  const config = context.config || {};
  const rulesConfig = config.rules || {};

  return rules.map((rule) => {
    const ruleConf = rulesConfig[rule.name] || {};
    if (ruleConf.enabled === false) {
      return {
        name: rule.name,
        weight: 0,
        passed: true,
        score: 100,
        message: 'Rule disabled by configuration',
      };
    }

    const effectiveWeight = ruleConf.weight !== undefined ? ruleConf.weight : rule.weight;
    const result = rule.check(parsedCommit, context);

    return {
      name: rule.name,
      weight: effectiveWeight,
      passed: result.passed,
      score: Math.max(0, Math.min(100, Math.round(result.score))),
      message: result.message,
      suggestion: result.suggestion,
    };
  });
}

module.exports = {
  rules,
  runRules,
};
