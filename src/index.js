'use strict';

const gitReader = require('./git/reader');
const gitParser = require('./git/parser');
const rulesEngine = require('./rules');
const scoring = require('./scoring/calculator');
const weights = require('./scoring/weights');
const render = require('./render/report');
const charts = require('./render/charts');
const colors = require('./render/colors');
const configUtils = require('./utils/config');
const suggestions = require('./utils/suggestions');
const dateUtils = require('./utils/date');
const output = require('./utils/output');

module.exports = {
  ...gitReader,
  ...gitParser,
  ...rulesEngine,
  ...scoring,
  ...weights,
  ...render,
  ...charts,
  ...configUtils,
  ...suggestions,
  ...dateUtils,
  colors,
  output,
};
