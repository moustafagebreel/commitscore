<div align="center">

# 🔍 commit-lens

**Analyze, score, and elevate your Git commit quality.**  
_Because clear git history makes great teams._

[![npm version](https://img.shields.io/npm/v/commitscore.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/commitscore)
[![build](https://img.shields.io/github/actions/workflow/status/moustafagebreel/commit-lens/test.yml?branch=main&style=flat-square)](https://github.com/moustafagebreel/commit-lens/actions)
[![license](https://img.shields.io/github/license/moustafagebreel/commit-lens.svg?style=flat-square)](LICENSE)
[![node](https://img.shields.io/node/v/commitscore.svg?style=flat-square)](package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

[English](README.md) • [العربية](README.ar.md)

</div>

---

## ⚡ Overview

Every developer occasionally writes vague commits like `"fix"`, `"wip"`, or `"update stuff"`. Over time, this turns git history into a black box where finding why a change was made becomes tedious archaeology.

**commit-lens** (`commitscore`) is an automated CLI analyzer that inspects your repository commits, grades them on a **100-point scale**, pinpoints weaknesses, and offers instant actionable improvements. It seamlessly integrates into your daily workflow via CLI commands, pre-commit hooks, and CI/CD pipelines.

```
┌────────────────────────────────────────────────────────┐
│  COMMIT LENS - Commit Quality Analysis                 │
│  Branch: main  |  Total: 100 commits  |  Analyzed: 94  │
│                                                        │
│  Score: 88/100 🟡 Good                                 │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Installation

Install globally via npm:

```bash
npm install -g commitscore
```

Or run directly without installing using `npx`:

```bash
npx commitscore
```

### Basic Commands

```bash
# Analyze the last 100 commits on the current branch
commit-lens analyze

# Check commit quality in CI pipeline (fails if below threshold)
commit-lens check --min-score 70 --fail-on 60

# Interactively suggest and fix the latest commit message
commit-lens fix --apply

# Install the pre-commit quality gate
commit-lens install-hook

# Generate a .commit-lensrc.json configuration file
commit-lens init
```

---

## 📊 Quality Scoring Engine

Each commit is evaluated by 7 specialized rules summing up to a weighted score of **100 points**:

| Rule                 | Weight  | Description                                      | Pass Criteria                                  |
| :------------------- | :-----: | :----------------------------------------------- | :--------------------------------------------- |
| **`conventional`**   | **25%** | Verifies Conventional Commits standard format    | `type(scope): description`                     |
| **`spam`**           | **20%** | Catches generic placeholder & low-effort words   | No `"wip"`, `"fix"`, `"stuff"`, etc.           |
| **`length`**         | **15%** | Evaluates commit message header length           | Between 10 and 72 characters                   |
| **`language`**       | **15%** | Validates language readability                   | Clean English or Arabic (no random mixing)     |
| **`scope`**          | **10%** | Ensures specificity for `feat` and `fix` commits | Explicit scope specified in parentheses        |
| **`imperative`**     | **10%** | Enforces imperative mood action verbs            | Starts with `"add"`, not `"added"` or `"adds"` |
| **`capitalization`** | **5%**  | Standardizes lowercase conventional formatting   | Description begins with lowercase letter       |

### Grading System

- **90 – 100** 🟢 **Excellent**: Outstanding, pristine git commit history.
- **70 – 89** 🟡 **Good**: Standard compliant with minor room for improvement.
- **50 – 69** 🟠 **Fair**: Multiple generic or non-conventional commits.
- **0 – 49** 🔴 **Poor**: Frequent vague commits requiring active review.

> [!NOTE]
> Merge commits (`Merge branch...`), reverts (`Revert "..."`), and repository initial commits are automatically identified and excluded from penalty calculations.

---

## 🛠️ CLI Reference

### `commit-lens analyze [options]`

Analyzes repository commits and renders detailed visual breakdown.

| Option                 | Default | Description                           |
| :--------------------- | :------ | :------------------------------------ |
| `-l, --last <count>`   | `100`   | Number of recent commits to analyze   |
| `--since <date>`       | —       | Analyze commits since date or git ref |
| `--until <date>`       | —       | Analyze commits until date or git ref |
| `-b, --branch <name>`  | Current | Specific branch to evaluate           |
| `-a, --author <email>` | —       | Filter commits by author email        |
| `-f, --format <type>`  | `text`  | Output format: `text` or `json`       |
| `-e, --export <path>`  | —       | Export analysis JSON to file          |

### `commit-lens check [options]`

Designed for CI/CD environments. Returns exit code `1` if quality requirements are not met.

```bash
commit-lens check --min-score 75 --fail-on 65
```

### `commit-lens fix [options]`

Analyzes commit message issues and suggests 3 conventional commit alternatives.

```bash
# View suggestions for HEAD
commit-lens fix

# Interactively choose and apply amend
commit-lens fix --apply
```

### `commit-lens install-hook [--force]`

Installs pre-commit / commit-msg hooks into `.git/hooks/` to review commits before they are finalized.

- **Ultra-fast**: Executes in `< 50ms`.
- **Fail-open**: Never disrupts git workflows on unexpected errors.
- **Interactive**: Allows confirmation to proceed if score is below threshold.

---

## ⚙️ Configuration (`.commit-lensrc.json`)

Generate a starter configuration with `commit-lens init`:

```json
{
  "rules": {
    "length": {
      "enabled": true,
      "min": 10,
      "max": 72,
      "weight": 15
    },
    "conventional": {
      "enabled": true,
      "types": [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert"
      ],
      "weight": 25
    },
    "spam": {
      "enabled": true,
      "words": ["wip", "fix", "update", "changes", "stuff", "test", "temp", "tmp", "minor", "more"],
      "weight": 20
    },
    "language": {
      "enabled": true,
      "preferred": ["en", "ar"],
      "weight": 15
    },
    "scope": {
      "enabled": true,
      "weight": 10
    },
    "imperative": {
      "enabled": true,
      "weight": 10
    },
    "capitalization": {
      "enabled": true,
      "weight": 5
    }
  },
  "scoring": {
    "passThreshold": 70,
    "failCI": 60
  },
  "ignore": {
    "commits": ["^Merge\\b", "^Revert\\b", "^Initial\\b"],
    "authors": []
  }
}
```

YAML format (`.commit-lensrc.yaml`) is also natively supported.

---

## 🤖 GitHub Action

Integrate `commit-lens` into your GitHub Pull Request workflow:

```yaml
# .github/workflows/commit-quality.yml
name: Commit Quality Check

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  commit-lens:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run commit-lens
        uses: antigravity/commit-lens@v1
        with:
          min-score: '70'
          fail-on: '60'
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

---

## ❓ FAQ

**Q: Does commit-lens support Arabic commit messages?**  
A: Yes! Arabic commits are fully supported and evaluated for length, clarity, and capitalization compatibility.

**Q: What happens if a commit contains emojis (e.g. Gitmoji)?**  
A: Emojis are parsed and respected automatically without breaking conventional commit matching.

**Q: What if the pre-commit hook encounters an error?**  
A: The hook follows a strict **fail-open** policy. It will never block your commit if an unexpected runtime condition arises.

---

## 📄 License

MIT © [Moustafa Gebreel](https://moustafagebreel.online)
