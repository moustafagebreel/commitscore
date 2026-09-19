'use strict';

const {
  calculateCommitScore,
  calculateOverallScore,
  getGrade,
  getRuleBreakdown,
} = require('../src/scoring/calculator');
const { DEFAULT_WEIGHTS } = require('../src/scoring/weights');

describe('src/scoring', () => {
  test('default weights sum up to exactly 100', () => {
    const sum = Object.values(DEFAULT_WEIGHTS).reduce((acc, w) => acc + w, 0);
    expect(sum).toBe(100);
  });

  describe('calculateCommitScore', () => {
    test('returns null for merge commits', () => {
      const commit = { isMerge: true, isRevert: false, isInitial: false };
      const score = calculateCommitScore(commit, [{ name: 'length', weight: 15, score: 0 }]);
      expect(score).toBeNull();
    });

    test('returns null for revert commits', () => {
      const commit = { isMerge: false, isRevert: true, isInitial: false };
      const score = calculateCommitScore(commit, [{ name: 'length', weight: 15, score: 0 }]);
      expect(score).toBeNull();
    });

    test('returns null for initial commits', () => {
      const commit = { isMerge: false, isRevert: false, isInitial: true };
      const score = calculateCommitScore(commit, [{ name: 'length', weight: 15, score: 0 }]);
      expect(score).toBeNull();
    });

    test('calculates correct weighted score', () => {
      const commit = { isMerge: false, isRevert: false, isInitial: false };
      const results = [
        { name: 'ruleA', weight: 50, score: 100 },
        { name: 'ruleB', weight: 50, score: 50 },
      ];
      const score = calculateCommitScore(commit, results);
      expect(score).toBe(75);
    });
  });

  describe('calculateOverallScore', () => {
    test('calculates average across valid commits and skips ignored commits', () => {
      const commits = [
        { isMerge: false, isRevert: false, isInitial: false },
        { isMerge: true, isRevert: false, isInitial: false }, // should be ignored
        { isMerge: false, isRevert: false, isInitial: false },
      ];
      const ruleResultsPerCommit = [
        [{ name: 'rule', weight: 100, score: 80 }],
        [{ name: 'rule', weight: 100, score: 0 }],
        [{ name: 'rule', weight: 100, score: 100 }],
      ];

      const overall = calculateOverallScore(commits, ruleResultsPerCommit);
      expect(overall).toBe(90); // (80 + 100) / 2 = 90
    });

    test('returns 100 if all commits are ignored', () => {
      const commits = [{ isMerge: true, isRevert: false, isInitial: false }];
      const overall = calculateOverallScore(commits, [[]]);
      expect(overall).toBe(100);
    });
  });

  describe('getGrade', () => {
    test('returns Excellent for 90-100', () => {
      const g = getGrade(95);
      expect(g.label).toBe('Excellent');
      expect(g.emoji).toBe('🟢');
      expect(g.color).toBe('green');
    });

    test('returns Good for 70-89', () => {
      const g = getGrade(78);
      expect(g.label).toBe('Good');
      expect(g.emoji).toBe('🟡');
      expect(g.color).toBe('yellow');
    });

    test('returns Fair for 50-69', () => {
      const g = getGrade(55);
      expect(g.label).toBe('Fair');
      expect(g.emoji).toBe('🟠');
      expect(g.color).toBe('orange');
    });

    test('returns Poor for 0-49', () => {
      const g = getGrade(30);
      expect(g.label).toBe('Poor');
      expect(g.emoji).toBe('🔴');
      expect(g.color).toBe('red');
    });
  });

  describe('getRuleBreakdown', () => {
    test('correctly aggregates stats per rule', () => {
      const results = [
        [
          { name: 'length', weight: 15, score: 100, passed: true },
          { name: 'spam', weight: 20, score: 0, passed: false },
        ],
        [
          { name: 'length', weight: 15, score: 50, passed: false },
          { name: 'spam', weight: 20, score: 100, passed: true },
        ],
      ];

      const breakdown = getRuleBreakdown(results);
      expect(breakdown.length.averageScore).toBe(75);
      expect(breakdown.length.passedCount).toBe(1);
      expect(breakdown.length.failedCount).toBe(1);
      expect(breakdown.spam.averageScore).toBe(50);
    });
  });
});
