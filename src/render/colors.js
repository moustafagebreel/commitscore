'use strict';

const chalk = require('chalk');

/**
 * Terminal colors and style helpers with automatic support for disabling colors.
 */
const colors = {
  bold: chalk.bold,
  dim: chalk.dim,
  gray: chalk.gray,
  cyan: chalk.cyan,
  green: chalk.green,
  yellow: chalk.yellow,
  red: chalk.red,
  orange: chalk.keyword ? chalk.keyword('orange') : chalk.yellow,
  blue: chalk.blue,
  magenta: chalk.magenta,
  white: chalk.white,

  /**
   * Returns appropriate color formatter for numeric score (0-100).
   * @param {number} score - Score
   * @returns {Function} Chalk color function
   */
  scoreColor(score) {
    if (score >= 90) return colors.green;
    if (score >= 70) return colors.yellow;
    if (score >= 50) return colors.orange;
    return colors.red;
  },

  /**
   * Returns color formatter based on grade string.
   * @param {string} grade - 'Excellent' | 'Good' | 'Fair' | 'Poor'
   * @returns {Function} Chalk color function
   */
  gradeColor(grade) {
    switch ((grade || '').toLowerCase()) {
      case 'excellent':
        return colors.green;
      case 'good':
        return colors.yellow;
      case 'fair':
        return colors.orange;
      case 'poor':
      default:
        return colors.red;
    }
  },

  /**
   * Returns color function for progress bar percentage.
   * @param {number} percentage - 0 to 100
   * @returns {Function} Chalk color function
   */
  barColor(percentage) {
    return colors.scoreColor(percentage);
  },
};

module.exports = colors;
