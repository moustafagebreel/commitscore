'use strict';

const fs = require('fs');
const path = require('path');
const { getDefaultConfig } = require('../utils/config');
const output = require('../utils/output');

/**
 * Initializes a standard .commit-lensrc.json configuration file.
 * @param {Object} options - Command options
 * @param {Object} [_globalOptions={}] - Global CLI flags
 */
async function run(options = {}, _globalOptions = {}) {
  const cwd = process.cwd();
  const configPath = path.join(cwd, '.commit-lensrc.json');

  if (fs.existsSync(configPath) && !options.force) {
    output.warn('Configuration file .commit-lensrc.json already exists. Use --force to overwrite.');
    return;
  }

  try {
    const config = getDefaultConfig();
    const content = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, `${content}\n`, 'utf8');

    output.success('Created .commit-lensrc.json with default configuration.');
    output.info('You can customize rule weights, forbidden spam words, and pass thresholds.');
  } catch (err) {
    output.error(`Failed to create configuration: ${err.message}`);
    process.exit(1);
  }
}

module.exports = {
  run,
};
