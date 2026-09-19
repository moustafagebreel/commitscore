'use strict';

const colors = require('./colors');
const { getGrade } = require('../scoring/calculator');

const SPARK_CHARS = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

/**
 * Renders a visual progress bar.
 * @param {number} value - Current value
 * @param {number} max - Maximum value
 * @param {number} [width=20] - Total character width
 * @param {Function} [colorFn] - Optional color formatter
 * @returns {string} Formatted bar string
 */
function renderBar(value, max, width = 20, colorFn) {
  const safeMax = max <= 0 ? 100 : max;
  const clampedVal = Math.max(0, Math.min(value, safeMax));
  const ratio = clampedVal / safeMax;
  const filledCount = Math.round(ratio * width);
  const emptyCount = Math.max(0, width - filledCount);

  const filled = '█'.repeat(filledCount);
  const empty = '░'.repeat(emptyCount);

  const formatter = colorFn || colors.barColor(Math.round(ratio * 100));
  return `${formatter(filled)}${colors.gray(empty)}`;
}

/**
 * Renders a percentage progress bar.
 * @param {number} percentage - 0 to 100
 * @param {number} [width=20] - Total character width
 * @returns {string} Formatted bar with percentage label
 */
function renderPercentageBar(percentage, width = 20) {
  const p = Math.max(0, Math.min(100, Math.round(percentage || 0)));
  const bar = renderBar(p, 100, width);
  const colorFn = colors.scoreColor(p);
  return `${bar} ${colorFn(`${p}%`.padStart(4))}`;
}

/**
 * Renders sparkline trend from numeric data array.
 * @param {Array<number>} data - Series of scores
 * @param {number} [width=20] - Maximum points to render
 * @returns {string} Visual sparkline trend
 */
function renderTrend(data, width = 20) {
  if (!Array.isArray(data) || data.length === 0) {
    return colors.gray('No trend data');
  }

  const slice = data.slice(-width);
  const min = Math.min(...slice);
  const max = Math.max(...slice);
  const range = max - min || 1;

  const sparkline = slice
    .map((val) => {
      const idx = Math.min(
        SPARK_CHARS.length - 1,
        Math.floor(((val - min) / range) * (SPARK_CHARS.length - 1))
      );
      const colorFn = colors.scoreColor(val);
      return colorFn(SPARK_CHARS[idx]);
    })
    .join('');

  return sparkline;
}

/**
 * Renders a score gauge summary with emoji and grade.
 * @param {number} score - Score (0-100)
 * @returns {string} e.g. "Score: 67/100 🟡 Good"
 */
function renderScoreGauge(score) {
  const s = Math.max(0, Math.min(100, Math.round(score || 0)));
  const grade = getGrade(s);
  const colorFn = colors.gradeColor(grade.label);
  return `${colors.bold('Score:')} ${colorFn(`${s}/100`)} ${grade.emoji} ${colors.bold(grade.label)}`;
}

module.exports = {
  renderBar,
  renderPercentageBar,
  renderTrend,
  renderScoreGauge,
};
