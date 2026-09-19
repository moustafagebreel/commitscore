'use strict';

const { getDefaultConfig, validateConfig, mergeConfig } = require('../src/utils/config');

describe('src/utils/config', () => {
  test('getDefaultConfig returns full configuration schema', () => {
    const config = getDefaultConfig();
    expect(config.rules).toBeDefined();
    expect(config.rules.length.min).toBe(10);
    expect(config.rules.length.max).toBe(72);
    expect(config.scoring.passThreshold).toBe(70);
    expect(config.scoring.failCI).toBe(60);
    expect(Array.isArray(config.ignore.commits)).toBe(true);
  });

  test('validateConfig returns true for valid objects and false for invalid', () => {
    expect(validateConfig(getDefaultConfig())).toBe(true);
    expect(validateConfig(null)).toBe(false);
    expect(validateConfig('invalid string')).toBe(false);
    expect(validateConfig({ scoring: { passThreshold: 150 } })).toBe(false);
  });

  test('mergeConfig merges nested rules while preserving defaults', () => {
    const defaults = getDefaultConfig();
    const user = {
      rules: {
        length: { min: 20 },
      },
      scoring: {
        passThreshold: 85,
      },
    };

    const merged = mergeConfig(user, defaults);
    expect(merged.rules.length.min).toBe(20);
    expect(merged.rules.length.max).toBe(72); // preserved default
    expect(merged.scoring.passThreshold).toBe(85);
    expect(merged.scoring.failCI).toBe(60); // preserved default
  });
});
