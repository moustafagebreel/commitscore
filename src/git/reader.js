'use strict';

const simpleGit = require('simple-git');

/**
 * Git repository reader and commit extractor
 */

/**
 * Checks if the given directory is inside a Git repository.
 * @param {string} [cwd=process.cwd()] - Working directory
 * @returns {Promise<boolean>} True if directory is a valid git repository
 */
async function isGitRepo(cwd = process.cwd()) {
  try {
    const git = simpleGit({ baseDir: cwd });
    return await git.checkIsRepo();
  } catch {
    return false;
  }
}

/**
 * Ensures directory is a git repository or throws descriptive error.
 * @param {import('simple-git').SimpleGit} git - simple-git instance
 * @throws {Error} Descriptive error if not a git repo
 */
async function assertGitRepo(git) {
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    throw new Error('Not a git repository. Run commit-lens inside a valid git repository.');
  }
}

/**
 * Maps raw git log entry into structured Commit object.
 * @param {Object} raw - Raw simple-git log entry
 * @returns {Object} Structured commit object
 */
function formatCommit(raw) {
  return {
    hash: raw.hash,
    message: raw.message || '',
    author: {
      name: raw.author_name || '',
      email: raw.author_email || '',
    },
    date: new Date(raw.date),
    parents: raw.parents ? raw.parents.split(' ') : [],
    body: raw.body || '',
  };
}

/**
 * Retrieves commits matching filters.
 * @param {Object} options - Filter options
 * @param {number} [options.limit=100] - Number of commits to fetch
 * @param {string} [options.since] - Starting date or ref
 * @param {string} [options.until] - Ending date or ref
 * @param {string} [options.branch] - Target branch
 * @param {string} [options.author] - Author email or name
 * @param {string} [options.cwd=process.cwd()] - Working directory
 * @returns {Promise<Array<Object>>} List of commits
 */
async function getCommits(options = {}) {
  const { limit = 100, since, until, branch, author, cwd = process.cwd() } = options;
  const git = simpleGit({ baseDir: cwd });
  await assertGitRepo(git);

  const gitOptions = {
    maxCount: limit,
  };

  if (since) gitOptions['--since'] = since;
  if (until) gitOptions['--until'] = until;
  if (author) gitOptions['--author'] = author;

  const args = branch ? [branch] : [];
  const logResult = await git.log(gitOptions, args);

  return logResult.all.map(formatCommit);
}

/**
 * Retrieves commits in a revision range (e.g. HEAD~5..HEAD or main..feature).
 * @param {Object} rangeOptions - Range parameters
 * @param {string} rangeOptions.from - Start revision
 * @param {string} rangeOptions.to - End revision
 * @param {string} [rangeOptions.cwd=process.cwd()] - Working directory
 * @returns {Promise<Array<Object>>} List of commits
 */
async function getCommitsFromRange({ from, to, cwd = process.cwd() }) {
  const git = simpleGit({ baseDir: cwd });
  await assertGitRepo(git);

  const range = from && to ? `${from}..${to}` : to || from;
  const logResult = await git.log({ [range]: null });
  return logResult.all.map(formatCommit);
}

/**
 * Retrieves the latest commit (HEAD).
 * @param {string} [cwd=process.cwd()] - Working directory
 * @returns {Promise<Object>} Latest commit
 */
async function getLastCommit(cwd = process.cwd()) {
  const commits = await getCommits({ limit: 1, cwd });
  if (commits.length === 0) {
    throw new Error('No commits found in repository.');
  }
  return commits[0];
}

/**
 * Retrieves the name of the current git branch.
 * @param {string} [cwd=process.cwd()] - Working directory
 * @returns {Promise<string>} Branch name
 */
async function getCurrentBranch(cwd = process.cwd()) {
  const git = simpleGit({ baseDir: cwd });
  await assertGitRepo(git);
  const status = await git.status();
  return status.current || 'HEAD';
}

module.exports = {
  isGitRepo,
  getCommits,
  getCommitsFromRange,
  getLastCommit,
  getCurrentBranch,
  formatCommit,
};
