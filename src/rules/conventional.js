'use strict';

const { CONVENTIONAL_TYPES } = require('../git/parser');

const RULE_WEIGHT = 25;

/**
 * Validates Conventional Commits structure: type(scope): description
 */
module.exports = {
  name: 'conventional',
  weight: RULE_WEIGHT,

  /**
   * Checks if commit follows conventional commit standards.
   * @param {Object} parsedCommit - Parsed commit object
   * @param {Object} [context={}] - Context with allowed types
   * @returns {{ passed: boolean, score: number, message: string, suggestion?: string }}
   */
  check(parsedCommit, context = {}) {
    const config =
      (context.config && context.config.rules && context.config.rules.conventional) || {};
    const allowedTypes = config.types || CONVENTIONAL_TYPES;

    if (!parsedCommit.type || !allowedTypes.includes(parsedCommit.type)) {
      return {
        passed: false,
        score: 0,
        message: 'Commit message does not follow Conventional Commits specification',
        suggestion:
          'Format message as: feat(auth): implement oauth login or fix: resolve null pointer',
      };
    }

    if (parsedCommit.scope) {
      return {
        passed: true,
        score: 100,
        message: `Conventional commit with explicit scope "${parsedCommit.scope}"`,
      };
    }

    return {
      passed: true,
      score: 80,
      message: `Conventional commit without scope (type "${parsedCommit.type}")`,
      suggestion: `Consider adding a scope: ${parsedCommit.type}(scope): ${parsedCommit.description}`,
    };
  },
};
