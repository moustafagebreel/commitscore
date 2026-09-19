'use strict';

const colors = require('../render/colors');

/**
 * Standardized CLI output helpers (avoids raw console.log).
 */
const output = {
  /**
   * Writes text directly to stdout.
   * @param {string} text - Content to write
   */
  write(text) {
    process.stdout.write(`${text}\n`);
  },

  /**
   * Outputs success message.
   * @param {string} message - Message
   */
  success(message) {
    process.stdout.write(`${colors.green('✔')} ${message}\n`);
  },

  /**
   * Outputs informational message.
   * @param {string} message - Message
   */
  info(message) {
    process.stdout.write(`${colors.cyan('ℹ')} ${message}\n`);
  },

  /**
   * Outputs warning message.
   * @param {string} message - Message
   */
  warn(message) {
    process.stderr.write(`${colors.yellow('⚠')} ${message}\n`);
  },

  /**
   * Outputs error message.
   * @param {string} message - Message
   */
  error(message) {
    process.stderr.write(`${colors.red('✖')} ${colors.red.bold(message)}\n`);
  },
};

module.exports = output;
