# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-19

### Added

- **Core CLI Engine**: Complete `commit-lens` command-line utility with `analyze`, `check`, `fix`, `install-hook`, and `init` commands.
- **7-Rule Quality Analyzer**:
  - `conventional`: Validates Conventional Commits structure (`type(scope): description`).
  - `spam`: Catches low-effort placeholder words (`wip`, `fix`, `stuff`, etc.).
  - `length`: Validates 10-72 characters header length limit.
  - `language`: Full native support for English and Arabic commit messages.
  - `scope`: Enforces specific scopes for `feat` and `fix` commits.
  - `imperative`: Enforces imperative action verbs in descriptions.
  - `capitalization`: Standardizes lowercase start in conventional descriptions.
- **Scoring & Grading System**: 100-point weighted score with visual grades (Excellent, Good, Fair, Poor).
- **Git Integration**: Full history reader, commit parser, merge/revert detection, and amend automation.
- **Pre-commit Quality Gate**: Ultra-fast (<50ms) hook with interactive confirmation and fail-open resilience.
- **CI/CD Integration**: `check` command with custom fail thresholds and native GitHub Action (`action.yml`).
- **Rich Terminal Rendering**: Beautiful boxen cards, CLI tables, sparkline quality trends, and ASCII score gauges.
- **Comprehensive Configuration**: Support for `.commit-lensrc.json` and `.commit-lensrc.yaml`.
- **Full Documentation**: English and Arabic READMEs with examples and configuration guides.
