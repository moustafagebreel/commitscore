'use strict';

const RULE_WEIGHT = 5;

/**
 * Checks description casing conventions.
 * Conventional Commits recommend starting description with lowercase and avoiding ALL CAPS.
 */
module.exports = {
  name: 'capitalization',
  weight: RULE_WEIGHT,

  /**
   * Evaluates capitalization of commit description.
   * @param {Object} parsedCommit - Parsed commit object
   * @param {Object} [_context={}] - Context
   * @returns {{ passed: boolean, score: number, message: string, suggestion?: string }}
   */
  check(parsedCommit, _context = {}) {
    const text = (parsedCommit.description || parsedCommit.raw || '').trim();
    if (!text) {
      return { passed: false, score: 0, message: 'Missing description' };
    }

    // Filter letters to check if all caps
    const lettersOnly = text.replace(/[^a-zA-Z]/g, '');

    // If description has letters and all letters are uppercase -> ALL CAPS (score 0)
    if (lettersOnly.length >= 4 && lettersOnly === lettersOnly.toUpperCase()) {
      return {
        passed: false,
        score: 0,
        message: 'Commit description is in ALL CAPS',
        suggestion: 'Avoid shouting; use lowercase sentence casing.',
      };
    }

    const firstChar = text.charAt(0);
    // If not an alphabet letter (e.g. Arabic, number, symbol), pass with 100
    if (!/[a-zA-Z]/.test(firstChar)) {
      return {
        passed: true,
        score: 100,
        message: 'Valid initial character',
      };
    }

    // Starts with lowercase -> 100
    if (firstChar === firstChar.toLowerCase()) {
      return {
        passed: true,
        score: 100,
        message: 'Description begins with lowercase letter',
      };
    }

    // Starts with uppercase -> 70
    return {
      passed: true,
      score: 70,
      message:
        'Description begins with uppercase letter (prefer lowercase in Conventional Commits)',
      suggestion: `Change "${firstChar}" to "${firstChar.toLowerCase()}": ${firstChar.toLowerCase() + text.slice(1)}`,
    };
  },
};
