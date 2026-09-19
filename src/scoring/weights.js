'use strict';

/**
 * Standard rule weights in commit quality calculation (Total = 100).
 */
const DEFAULT_WEIGHTS = {
  length: 15,
  conventional: 25,
  spam: 20,
  language: 15,
  scope: 10,
  imperative: 10,
  capitalization: 5,
};

module.exports = {
  DEFAULT_WEIGHTS,
};
