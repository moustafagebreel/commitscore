'use strict';

/**
 * Standard Conventional Commit types
 */
const CONVENTIONAL_TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
];

// Regex matching conventional commit: type(scope)!: description
const CONVENTIONAL_REGEX =
  /^(?:(?:\p{Extended_Pictographic}|:[a-z0-9_+-]+:)\s*)?([a-zA-Z0-9_-]+)(?:\(([^)]+)\))?(!)?:\s+(.*)$/u;

// Merge commit regex patterns
const MERGE_PATTERNS = [
  /^merge\s+(?:branch|tag|pull\s+request|remote-tracking)/i,
  /^merge\s+.*into\s+/i,
];

// Revert commit patterns
const REVERT_PATTERNS = [/^revert\s+["'].*["']/i, /^revert\s+commit\s+[0-9a-f]+/i, /^revert:/i];

// Initial commit patterns
const INITIAL_PATTERNS = [/^(?:initial\s+commit|init\s+commit|initial|init)$/i];

/**
 * Parses conventional commit format from header.
 * @param {string} message - Raw commit message
 * @returns {{ type: string|null, scope: string|null, description: string, body: string, footer: string }}
 */
function parseConventional(message) {
  if (!message || typeof message !== 'string') {
    return { type: null, scope: null, description: '', body: '', footer: '' };
  }

  const lines = message.trim().split(/\r?\n/);
  const header = lines[0] || '';
  const match = header.match(CONVENTIONAL_REGEX);

  const bodyAndFooter = lines.slice(1).join('\n').trim();
  const parts = bodyAndFooter.split(/\n\s*\n/);
  const body = parts.length > 1 ? parts.slice(0, -1).join('\n\n').trim() : parts[0] || '';
  const footer = parts.length > 1 ? parts[parts.length - 1].trim() : '';

  if (!match) {
    return { type: null, scope: null, description: header, body, footer };
  }

  const rawType = match[1].toLowerCase();
  const scope = match[2] ? match[2].trim() : null;
  const description = match[4] ? match[4].trim() : '';

  return {
    type: CONVENTIONAL_TYPES.includes(rawType) ? rawType : null,
    scope,
    description,
    body,
    footer,
  };
}

/**
 * Extracts commit type if conventional.
 * @param {string} message - Commit message
 * @returns {string|null} Commit type or null
 */
function extractType(message) {
  return parseConventional(message).type;
}

/**
 * Extracts commit scope if defined.
 * @param {string} message - Commit message
 * @returns {string|null} Commit scope or null
 */
function extractScope(message) {
  return parseConventional(message).scope;
}

/**
 * Verifies if the message strictly follows Conventional Commits.
 * @param {string} message - Commit message
 * @returns {boolean} True if conventional
 */
function isConventional(message) {
  const parsed = parseConventional(message);
  return Boolean(parsed.type && parsed.description);
}

/**
 * Parses any commit message into a rich metadata object.
 * @param {string} message - Raw commit message
 * @returns {{
 *   raw: string,
 *   type: string|null,
 *   scope: string|null,
 *   description: string,
 *   isConventional: boolean,
 *   isMerge: boolean,
 *   isRevert: boolean,
 *   isInitial: boolean
 * }}
 */
function parseCommit(message) {
  const raw = (message || '').trim();
  const header = raw.split(/\r?\n/)[0] || '';

  const isMerge = MERGE_PATTERNS.some((pattern) => pattern.test(header));
  const isRevert = REVERT_PATTERNS.some((pattern) => pattern.test(header));
  const isInitial = INITIAL_PATTERNS.some((pattern) => pattern.test(header));

  const conv = parseConventional(raw);

  return {
    raw,
    type: conv.type,
    scope: conv.scope,
    description: conv.description || header,
    isConventional: Boolean(conv.type && conv.description),
    isMerge,
    isRevert,
    isInitial,
  };
}

module.exports = {
  CONVENTIONAL_TYPES,
  parseCommit,
  parseConventional,
  extractType,
  extractScope,
  isConventional,
};
