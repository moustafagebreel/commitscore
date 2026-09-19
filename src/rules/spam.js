'use strict';

const DEFAULT_FORBIDDEN = [
  'wip',
  'fix',
  'update',
  'changes',
  'stuff',
  'asdf',
  'test',
  'temp',
  'tmp',
  'minor',
  'major',
  'some',
  'random',
  'whatever',
  'work',
  'progress',
  'continued',
  'more',
  'again',
  'misc',
];

const RULE_WEIGHT = 20;

/**
 * Detects low-effort, spam, or placeholder commit messages.
 */
module.exports = {
  name: 'spam',
  weight: RULE_WEIGHT,

  /**
   * Evaluates message against spam/placeholder word list.
   * @param {Object} parsedCommit - Parsed commit object
   * @param {Object} [context={}] - Context containing custom words
   * @returns {{ passed: boolean, score: number, message: string, suggestion?: string }}
   */
  check(parsedCommit, context = {}) {
    const config = (context.config && context.config.rules && context.config.rules.spam) || {};
    const words = (config.words || DEFAULT_FORBIDDEN).map((w) => w.toLowerCase());

    const description = (parsedCommit.description || parsedCommit.raw || '').trim().toLowerCase();
    const cleanHeader = description.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
    const tokens = cleanHeader.split(/\s+/).filter(Boolean);

    if (tokens.length === 0) {
      return {
        passed: false,
        score: 0,
        message: 'Empty commit message detected',
        suggestion: 'Write a meaningful summary of the changes made.',
      };
    }

    // Exact single forbidden word (e.g. "wip", "fix", "update stuff")
    const isOnlyForbidden = tokens.every((token) => words.includes(token));
    if (isOnlyForbidden) {
      return {
        passed: false,
        score: 0,
        message: `Vague or placeholder commit message ("${parsedCommit.raw}")`,
        suggestion: 'Replace generic words with what specifically was added, fixed, or updated.',
      };
    }

    // Contains forbidden word as the main verb/token but has some extra words
    const matchedWords = tokens.filter((token) => words.includes(token));
    if (matchedWords.length > 0 && tokens.length <= 3) {
      return {
        passed: false,
        score: 50,
        message: `Contains generic placeholder words (${matchedWords.join(', ')}) with minimal detail`,
        suggestion: 'Elaborate on what specific component or behavior was affected.',
      };
    }

    return {
      passed: true,
      score: 100,
      message: 'No spam or placeholder words detected',
    };
  },
};
