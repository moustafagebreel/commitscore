'use strict';

const DEFAULT_MIN = 10;
const DEFAULT_MAX = 72;
const RULE_WEIGHT = 15;

/**
 * Checks if the commit message header length adheres to best practices (10-72 chars).
 */
module.exports = {
  name: 'length',
  weight: RULE_WEIGHT,

  /**
   * Evaluates message length.
   * @param {Object} parsedCommit - Parsed commit object
   * @param {Object} [context={}] - Evaluation context with configuration
   * @returns {{ passed: boolean, score: number, message: string, suggestion?: string }}
   */
  check(parsedCommit, context = {}) {
    const config = (context.config && context.config.rules && context.config.rules.length) || {};
    const min = config.min ?? DEFAULT_MIN;
    const max = config.max ?? DEFAULT_MAX;

    const raw = parsedCommit.raw || '';
    const header = raw.split(/\r?\n/)[0].trim();
    const len = header.length;

    if (len === 0) {
      return {
        passed: false,
        score: 0,
        message: 'Commit message is empty',
        suggestion: 'Provide a clear summary of changes between 10 and 72 characters.',
      };
    }

    if (len < min) {
      return {
        passed: false,
        score: 0,
        message: `Commit message header is too short (${len}/${min} chars)`,
        suggestion: `Expand the message to at least ${min} characters explaining what changed and why.`,
      };
    }

    if (len > max) {
      return {
        passed: false,
        score: 50,
        message: `Commit message header is too long (${len}/${max} chars)`,
        suggestion: `Shorten header to ${max} characters or fewer; put detailed explanations in the commit body.`,
      };
    }

    return {
      passed: true,
      score: 100,
      message: `Optimal header length (${len} characters)`,
    };
  },
};
