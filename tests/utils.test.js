'use strict';

const { formatDate, formatRelative, groupByDay, getDateRange } = require('../src/utils/date');
const {
  suggestBetterCommit,
  getGeneralTips,
  getConventionalExample,
} = require('../src/utils/suggestions');

describe('src/utils/date', () => {
  test('formatDate outputs YYYY-MM-DD', () => {
    const d = new Date('2026-05-15T12:00:00Z');
    expect(formatDate(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('formatRelative produces human relative string', () => {
    const now = new Date();
    expect(formatRelative(now)).toBe('just now');

    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelative(twoDaysAgo)).toBe('2 days ago');
  });

  test('groupByDay groups commits by date key', () => {
    const commits = [
      { date: new Date('2026-01-01T10:00:00Z'), message: 'c1' },
      { date: new Date('2026-01-01T15:00:00Z'), message: 'c2' },
      { date: new Date('2026-01-02T12:00:00Z'), message: 'c3' },
    ];
    const grouped = groupByDay(commits);
    expect(Object.keys(grouped)).toHaveLength(2);
    expect(grouped['2026-01-01']).toHaveLength(2);
    expect(grouped['2026-01-02']).toHaveLength(1);
  });

  test('getDateRange returns object with from and to', () => {
    const range = getDateRange(7);
    expect(range.from).toBeDefined();
    expect(range.to).toBeDefined();
  });
});

describe('src/utils/suggestions', () => {
  test('getConventionalExample returns example for all types', () => {
    expect(getConventionalExample('feat')).toContain('feat');
    expect(getConventionalExample('fix')).toContain('fix');
    expect(getConventionalExample('chore')).toContain('chore');
    expect(getConventionalExample('unknown')).toContain('feat');
  });

  test('suggestBetterCommit returns 3 improved versions', () => {
    const commit = { raw: 'fix', type: 'fix', scope: null, description: 'fix' };
    const suggestions = suggestBetterCommit(commit, [{ name: 'spam' }]);
    expect(suggestions).toHaveLength(3);
    expect(suggestions[0]).toMatch(/^fix\(/);
  });

  test('getGeneralTips returns tips for failed rules', () => {
    const tips = getGeneralTips([{ name: 'length' }, { name: 'conventional' }]);
    expect(tips.length).toBeGreaterThanOrEqual(2);
  });
});
