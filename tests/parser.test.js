'use strict';

const {
  parseCommit,
  parseConventional,
  extractType,
  extractScope,
  isConventional,
} = require('../src/git/parser');

describe('src/git/parser', () => {
  describe('parseConventional', () => {
    test('parses type, scope, and description cleanly', () => {
      const parsed = parseConventional('feat(auth): add remember me checkbox');
      expect(parsed.type).toBe('feat');
      expect(parsed.scope).toBe('auth');
      expect(parsed.description).toBe('add remember me checkbox');
    });

    test('parses conventional commit without scope', () => {
      const parsed = parseConventional('fix: prevent duplicate form submissions');
      expect(parsed.type).toBe('fix');
      expect(parsed.scope).toBeNull();
      expect(parsed.description).toBe('prevent duplicate form submissions');
    });

    test('parses breaking change mark (!)', () => {
      const parsed = parseConventional('feat(api)!: drop legacy v1 endpoints');
      expect(parsed.type).toBe('feat');
      expect(parsed.scope).toBe('api');
      expect(parsed.description).toBe('drop legacy v1 endpoints');
    });

    test('supports emojis in conventional commit header', () => {
      const parsed = parseConventional('✨ feat(ui): add modern card component');
      expect(parsed.type).toBe('feat');
      expect(parsed.scope).toBe('ui');
      expect(parsed.description).toBe('add modern card component');
    });

    test('extracts body and footer', () => {
      const message =
        'fix(db): handle connection retry limit\n\nDetailed explanation of why retries failed.\n\nCloses #123';
      const parsed = parseConventional(message);
      expect(parsed.body).toBe('Detailed explanation of why retries failed.');
      expect(parsed.footer).toBe('Closes #123');
    });
  });

  describe('utility extraction functions', () => {
    test('extractType returns type or null', () => {
      expect(extractType('feat: add stuff')).toBe('feat');
      expect(extractType('random commit message')).toBeNull();
    });

    test('extractScope returns scope or null', () => {
      expect(extractScope('feat(router): add subroutes')).toBe('router');
      expect(extractScope('feat: add subroutes')).toBeNull();
    });

    test('isConventional identifies valid conventional commits', () => {
      expect(isConventional('chore: update dependencies')).toBe(true);
      expect(isConventional('fixed a typo')).toBe(false);
    });
  });

  describe('parseCommit metadata and special patterns', () => {
    test('detects merge commits', () => {
      const m1 = parseCommit('Merge branch "main" into staging');
      const m2 = parseCommit('Merge pull request #42 from author/feature');
      expect(m1.isMerge).toBe(true);
      expect(m2.isMerge).toBe(true);
      expect(m1.isConventional).toBe(false);
    });

    test('detects revert commits', () => {
      const r1 = parseCommit('Revert "feat(ui): add new header"');
      const r2 = parseCommit('revert: undo previous release');
      expect(r1.isRevert).toBe(true);
      expect(r2.isRevert).toBe(true);
    });

    test('detects initial commits', () => {
      const i1 = parseCommit('Initial commit');
      const i2 = parseCommit('init');
      expect(i1.isInitial).toBe(true);
      expect(i2.isInitial).toBe(true);
    });

    test('handles empty or malformed strings gracefully', () => {
      const parsed = parseCommit('');
      expect(parsed.raw).toBe('');
      expect(parsed.type).toBeNull();
      expect(parsed.isConventional).toBe(false);
    });
  });
});
