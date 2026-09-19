'use strict';

const lengthRule = require('../src/rules/length');
const conventionalRule = require('../src/rules/conventional');
const spamRule = require('../src/rules/spam');
const languageRule = require('../src/rules/language');
const scopeRule = require('../src/rules/scope');
const imperativeRule = require('../src/rules/imperative');
const capitalizationRule = require('../src/rules/capitalization');
const { runRules, rules } = require('../src/rules');
const { parseCommit } = require('../src/git/parser');

describe('src/rules', () => {
  test('exports all 7 rules', () => {
    expect(rules).toHaveLength(7);
  });

  describe('length rule', () => {
    test('passes for optimal message length', () => {
      const commit = parseCommit('feat(auth): add google oauth login');
      const res = lengthRule.check(commit);
      expect(res.passed).toBe(true);
      expect(res.score).toBe(100);
    });

    test('fails with score 0 if too short (<10 chars)', () => {
      const commit = parseCommit('fix bug');
      const res = lengthRule.check(commit);
      expect(res.passed).toBe(false);
      expect(res.score).toBe(0);
      expect(res.message).toMatch(/too short/i);
    });

    test('fails with score 50 if too long (>72 chars)', () => {
      const longMsg = 'feat(core): ' + 'a'.repeat(75);
      const commit = parseCommit(longMsg);
      const res = lengthRule.check(commit);
      expect(res.passed).toBe(false);
      expect(res.score).toBe(50);
      expect(res.message).toMatch(/too long/i);
    });

    test('handles empty message', () => {
      const commit = parseCommit('');
      const res = lengthRule.check(commit);
      expect(res.passed).toBe(false);
      expect(res.score).toBe(0);
    });
  });

  describe('conventional rule', () => {
    test('scores 100 for full conventional commit with scope', () => {
      const commit = parseCommit('feat(ui): add dark mode button');
      const res = conventionalRule.check(commit);
      expect(res.passed).toBe(true);
      expect(res.score).toBe(100);
    });

    test('scores 80 for conventional commit without scope', () => {
      const commit = parseCommit('fix: resolve null pointer error');
      const res = conventionalRule.check(commit);
      expect(res.passed).toBe(true);
      expect(res.score).toBe(80);
    });

    test('scores 0 for non-conventional commit', () => {
      const commit = parseCommit('updated user interface');
      const res = conventionalRule.check(commit);
      expect(res.passed).toBe(false);
      expect(res.score).toBe(0);
    });
  });

  describe('spam rule', () => {
    test('scores 0 for single forbidden placeholder word', () => {
      const commit = parseCommit('wip');
      const res = spamRule.check(commit);
      expect(res.passed).toBe(false);
      expect(res.score).toBe(0);
    });

    test('scores 0 for multi-word spam', () => {
      const commit = parseCommit('update stuff');
      const res = spamRule.check(commit);
      expect(res.passed).toBe(false);
      expect(res.score).toBe(0);
    });

    test('scores 50 for spam word with short extra words', () => {
      const commit = parseCommit('fix now');
      const res = spamRule.check(commit);
      expect(res.passed).toBe(false);
      expect(res.score).toBe(50);
    });

    test('scores 100 for clean descriptive commit', () => {
      const commit = parseCommit('feat(billing): implement invoice pdf generation');
      const res = spamRule.check(commit);
      expect(res.passed).toBe(true);
      expect(res.score).toBe(100);
    });
  });

  describe('language rule', () => {
    test('scores 100 for standard English commit', () => {
      const commit = parseCommit('feat(api): optimize database connection pooling');
      const res = languageRule.check(commit);
      expect(res.passed).toBe(true);
      expect(res.score).toBe(100);
    });

    test('scores 100 for pure Arabic commit message', () => {
      const commit = parseCommit('إضافة ميزة تسجيل الدخول عبر البريد الإلكتروني');
      const res = languageRule.check(commit);
      expect(res.passed).toBe(true);
      expect(res.score).toBe(100);
    });

    test('scores 60 for mixed Arabic and English', () => {
      const commit = parseCommit('إصلاح مشكلة الـ timeout في الـ database');
      const res = languageRule.check(commit);
      expect(res.score).toBe(60);
    });
  });

  describe('scope rule', () => {
    test('scores 100 when scope is present', () => {
      const commit = parseCommit('feat(auth): add jwt validation');
      const res = scopeRule.check(commit);
      expect(res.passed).toBe(true);
      expect(res.score).toBe(100);
    });

    test('scores 60 when missing scope on feat/fix', () => {
      const commit = parseCommit('feat: add jwt validation');
      const res = scopeRule.check(commit);
      expect(res.passed).toBe(false);
      expect(res.score).toBe(60);
    });

    test('scores 100 when missing scope on docs/chore', () => {
      const commit = parseCommit('docs: update installation instructions');
      const res = scopeRule.check(commit);
      expect(res.passed).toBe(true);
      expect(res.score).toBe(100);
    });
  });

  describe('imperative rule', () => {
    test('scores 100 for imperative verb', () => {
      const commit = parseCommit('feat(auth): add multi-factor authentication');
      const res = imperativeRule.check(commit);
      expect(res.passed).toBe(true);
      expect(res.score).toBe(100);
    });

    test('scores 60 for past tense verb', () => {
      const commit = parseCommit('feat(auth): added multi-factor authentication');
      const res = imperativeRule.check(commit);
      expect(res.passed).toBe(false);
      expect(res.score).toBe(60);
    });

    test('scores 100 for Arabic descriptions', () => {
      const commit = parseCommit('إضافة خاصية جديدة للبحث السريع');
      const res = imperativeRule.check(commit);
      expect(res.score).toBe(100);
    });
  });

  describe('capitalization rule', () => {
    test('scores 100 for lowercase first letter', () => {
      const commit = parseCommit('feat(api): implement rate limiting');
      const res = capitalizationRule.check(commit);
      expect(res.passed).toBe(true);
      expect(res.score).toBe(100);
    });

    test('scores 70 for capitalized first letter', () => {
      const commit = parseCommit('feat(api): Implement rate limiting');
      const res = capitalizationRule.check(commit);
      expect(res.passed).toBe(true);
      expect(res.score).toBe(70);
    });

    test('scores 0 for ALL CAPS description', () => {
      const commit = parseCommit('feat(api): FIX EVERYTHING NOW PLEASE');
      const res = capitalizationRule.check(commit);
      expect(res.passed).toBe(false);
      expect(res.score).toBe(0);
    });
  });

  describe('runRules orchestration', () => {
    test('evaluates all active rules and respects rule disabled config', () => {
      const commit = parseCommit('feat(test): add unit tests');
      const results = runRules(commit, {
        config: {
          rules: {
            length: { enabled: false },
          },
        },
      });

      expect(results).toHaveLength(7);
      const lengthRes = results.find((r) => r.name === 'length');
      expect(lengthRes.weight).toBe(0);
      expect(lengthRes.score).toBe(100);
    });
  });
});
