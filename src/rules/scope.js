'use strict';

const RULE_WEIGHT = 10;
const SCOPE_CRITICAL_TYPES = ['feat', 'fix'];

/**
 * Checks presence and specificity of commit scope.
 */
module.exports = {
  name: 'scope',
  weight: RULE_WEIGHT,

  /**
   * Evaluates scope presence.
   * @param {Object} parsedCommit - Parsed commit object
   * @param {Object} [_context={}] - Context
   * @returns {{ passed: boolean, score: number, message: string, suggestion?: string }}
   */
  check(parsedCommit, _context = {}) {
    if (parsedCommit.scope) {
      return {
        passed: true,
        score: 100,
        message: `Clear scope specified: (${parsedCommit.scope})`,
      };
    }

    const type = parsedCommit.type;
    if (type && SCOPE_CRITICAL_TYPES.includes(type)) {
      return {
        passed: false,
        score: 60,
        message: `Missing scope for "${type}" commit`,
        suggestion: `Specify which module or feature was affected: ${type}(module): ${parsedCommit.description}`,
      };
    }

    if (type) {
      // For chore, docs, test, etc. scope is optional
      return {
        passed: true,
        score: 100,
        message: `Scope is optional for "${type}" commits`,
      };
    }

    return {
      passed: false,
      score: 50,
      message: 'No commit scope found',
      suggestion: 'Use format: type(scope): description',
    };
  },
};
