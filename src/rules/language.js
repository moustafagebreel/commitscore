'use strict';

const franc = require('franc');

const RULE_WEIGHT = 15;
const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
const LATIN_REGEX = /[a-zA-Z]/;

/**
 * Checks commit language (Arabic and English are fully supported).
 */
module.exports = {
  name: 'language',
  weight: RULE_WEIGHT,

  /**
   * Evaluates text language.
   * @param {Object} parsedCommit - Parsed commit object
   * @param {Object} [_context={}] - Context
   * @returns {{ passed: boolean, score: number, message: string, suggestion?: string }}
   */
  check(parsedCommit, _context = {}) {
    const text = (parsedCommit.description || parsedCommit.raw || '').trim();
    if (!text) {
      return { passed: false, score: 0, message: 'No text to analyze language' };
    }

    const hasArabic = ARABIC_REGEX.test(text);
    // Exclude conventional type prefix like "feat:" when checking for Latin in description
    const cleanDesc = (parsedCommit.description || text).trim();
    const hasLatin = LATIN_REGEX.test(cleanDesc);

    // Pure Arabic (acceptable)
    if (hasArabic && !hasLatin) {
      return {
        passed: true,
        score: 100,
        message: 'Commit message is written in clean Arabic',
      };
    }

    // Mixed Arabic and English
    if (hasArabic && hasLatin) {
      return {
        passed: true,
        score: 60,
        message: 'Commit message mixes Arabic and English',
        suggestion: 'Prefer sticking to either pure English or pure Arabic for consistency.',
      };
    }

    // Check English or other languages
    const detected = franc(text, { minLength: 3 });
    if (detected === 'eng' || detected === 'und' || hasLatin) {
      // Short phrases often return 'und' in franc, but if Latin and standard words, treat as English
      return {
        passed: true,
        score: 100,
        message: 'Commit message is in English',
      };
    }

    // Other unsupported languages
    return {
      passed: false,
      score: 40,
      message: `Detected foreign language (${detected})`,
      suggestion: 'Use English or Arabic for commit messages to maintain team readability.',
    };
  },
};
