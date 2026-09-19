'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { DEFAULT_WEIGHTS } = require('../scoring/weights');
const { CONVENTIONAL_TYPES } = require('../git/parser');

const CONFIG_FILES = [
  '.commit-lensrc',
  '.commit-lensrc.json',
  '.commit-lensrc.yaml',
  '.commit-lensrc.yml',
];

/**
 * Returns default commit-lens configuration object.
 * @returns {Object} Default configuration
 */
function getDefaultConfig() {
  return {
    rules: {
      length: {
        enabled: true,
        min: 10,
        max: 72,
        weight: DEFAULT_WEIGHTS.length,
      },
      conventional: {
        enabled: true,
        types: CONVENTIONAL_TYPES,
        requireScope: false,
        weight: DEFAULT_WEIGHTS.conventional,
      },
      spam: {
        enabled: true,
        words: [
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
        ],
        weight: DEFAULT_WEIGHTS.spam,
      },
      language: {
        enabled: true,
        preferred: ['en', 'ar'],
        weight: DEFAULT_WEIGHTS.language,
      },
      scope: {
        enabled: true,
        weight: DEFAULT_WEIGHTS.scope,
      },
      imperative: {
        enabled: true,
        weight: DEFAULT_WEIGHTS.imperative,
      },
      capitalization: {
        enabled: true,
        weight: DEFAULT_WEIGHTS.capitalization,
      },
    },
    scoring: {
      passThreshold: 70,
      failCI: 60,
    },
    ignore: {
      commits: ['^Merge\\b', '^Revert\\b', '^Initial\\b'],
      authors: [],
    },
  };
}

/**
 * Validates a configuration object structure.
 * @param {Object} config - Config to validate
 * @returns {boolean} True if valid
 */
function validateConfig(config) {
  if (!config || typeof config !== 'object') return false;
  if (config.rules && typeof config.rules !== 'object') return false;
  if (config.scoring) {
    if (
      typeof config.scoring.passThreshold === 'number' &&
      (config.scoring.passThreshold < 0 || config.scoring.passThreshold > 100)
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Deeply merges user config with default configuration.
 * @param {Object} userConfig - User supplied overrides
 * @param {Object} defaults - Baseline default config
 * @returns {Object} Merged configuration
 */
function mergeConfig(userConfig = {}, defaults = getDefaultConfig()) {
  const result = JSON.parse(JSON.stringify(defaults));

  if (userConfig.rules) {
    for (const [ruleName, ruleProps] of Object.entries(userConfig.rules)) {
      result.rules[ruleName] = {
        ...(result.rules[ruleName] || {}),
        ...ruleProps,
      };
    }
  }

  if (userConfig.scoring) {
    result.scoring = { ...result.scoring, ...userConfig.scoring };
  }

  if (userConfig.ignore) {
    result.ignore = {
      commits: userConfig.ignore.commits || result.ignore.commits,
      authors: userConfig.ignore.authors || result.ignore.authors,
    };
  }

  return result;
}

/**
 * Locates and loads configuration file from target directory.
 * @param {string} [cwd=process.cwd()] - Current directory
 * @returns {Object} Merged configuration object
 */
function loadConfig(cwd = process.cwd()) {
  const defaults = getDefaultConfig();

  for (const filename of CONFIG_FILES) {
    const filePath = path.join(cwd, filename);
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        let parsed = null;
        if (filename.endsWith('.yaml') || filename.endsWith('.yml')) {
          parsed = yaml.load(raw);
        } else {
          parsed = JSON.parse(raw);
        }

        if (validateConfig(parsed)) {
          return mergeConfig(parsed, defaults);
        }
      } catch {
        // Fallback to defaults on read/parse error
        return defaults;
      }
    }
  }

  return defaults;
}

module.exports = {
  loadConfig,
  getDefaultConfig,
  validateConfig,
  mergeConfig,
};
