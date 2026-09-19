'use strict';

const nlp = require('compromise');

const RULE_WEIGHT = 10;
const ARABIC_REGEX = /[\u0600-\u06FF]/;

/**
 * Checks whether the description uses imperative mood (e.g. "add" instead of "added" or "adds").
 */
module.exports = {
  name: 'imperative',
  weight: RULE_WEIGHT,

  /**
   * Evaluates if commit description uses imperative mood.
   * @param {Object} parsedCommit - Parsed commit object
   * @param {Object} [_context={}] - Context
   * @returns {{ passed: boolean, score: number, message: string, suggestion?: string }}
   */
  check(parsedCommit, _context = {}) {
    const text = (parsedCommit.description || parsedCommit.raw || '').trim();
    if (!text) {
      return { passed: false, score: 0, message: 'Missing commit description' };
    }

    // Arabic descriptions follow their own grammar rules - pass gracefully
    if (ARABIC_REGEX.test(text)) {
      return {
        passed: true,
        score: 100,
        message: 'Arabic commit description detected',
      };
    }

    const words = text.split(/\s+/);
    const firstWord = words[0].toLowerCase().replace(/[^a-z]/g, '');

    if (!firstWord) {
      return { passed: false, score: 40, message: 'Cannot detect starting verb' };
    }

    // Direct check for common past tense patterns or gerunds
    if (
      firstWord.endsWith('ed') ||
      firstWord === 'ran' ||
      firstWord === 'built' ||
      firstWord === 'wrote' ||
      firstWord === 'made'
    ) {
      return {
        passed: false,
        score: 60,
        message: `Use imperative mood ("${firstWord.replace(/ed$/, '')}" instead of "${firstWord}")`,
        suggestion: `Change "${firstWord}" to base/imperative form (e.g. "add", "fix", "update").`,
      };
    }

    if (firstWord.endsWith('ing')) {
      return {
        passed: false,
        score: 60,
        message: `Gerund detected ("${firstWord}"). Use imperative mood.`,
        suggestion: `Change to imperative: "${firstWord.replace(/ing$/, '')}".`,
      };
    }

    const doc = nlp(firstWord);
    if (doc.has('#PastTense')) {
      return {
        passed: false,
        score: 60,
        message: `Verb is in past tense ("${firstWord}")`,
        suggestion: 'Use imperative form: "add", "fix", "refactor".',
      };
    }

    // Check if it's recognized as a verb or standard action word
    const isVerb = doc.has('#Verb') || doc.has('#Infinitive') || doc.has('#Imperative');
    if (!isVerb && !['revert', 'sync', 'bump', 'wip', 'chore', 'perf', 'ci'].includes(firstWord)) {
      return {
        passed: false,
        score: 40,
        message: `Commit description does not start with an action verb ("${firstWord}")`,
        suggestion:
          'Start description with an action verb like "add", "fix", "refactor", "implement".',
      };
    }

    return {
      passed: true,
      score: 100,
      message: 'Description starts with an imperative verb',
    };
  },
};
