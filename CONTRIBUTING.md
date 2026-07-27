# Contributing to GameStuff Blocks

Thanks for your interest in contributing. This document covers how to set up the project, the standards contributions are expected to follow, and how to submit changes.

## Getting Started

```bash
git clone https://github.com/irvangen09/gamestuff-blocks
cd gamestuff-blocks

npm install
composer install

npm run start   # development build with file watching
```

See [README.md](README.md) for the full list of available scripts.

## Coding Standards

- **PHP** — WordPress Coding Standards, OOP, one class per file, single responsibility. Run `composer lint` before submitting; `composer lint:fix` can auto-fix most style issues.
- **JavaScript** — modern, dependency-free (no jQuery). Run `npm run lint:js`.
- **CSS/SCSS** — the `.gs-` class prefix, simple selectors, avoid `!important` except where a specific comment explains why it's necessary (usually to guard against a theme's own styles cascading into a block). Run `npm run lint:css`.
- **HTML** — semantic elements matched to the meaning of the content.
- **Accessibility** — keyboard navigation and visible focus states are required, not optional, for any interactive element.
- **Internationalization** — every user-facing string must be wrapped for translation using the `gamestuff-blocks` text domain.
- **Comments** — in English, explain *why* a piece of code exists rather than restating what it does, and don't assume readers have context beyond what's in the codebase itself.

## Block Structure

Each block lives in its own folder under `src/`, does not depend on any other block, and follows the same internal file layout (`block.json`, `edit.*`, `save.*`, `render.*`/`view.*` where applicable, `style.*`, `editor.*`). Non-trivial PHP logic for a block (anything beyond rendering markup) lives in its own namespaced class under `includes/Blocks/{BlockName}/`, not as procedural functions.

Before adding a new shared utility under `src/shared/` or `includes/Services/`, make sure it's genuinely needed by more than one block — utilities that only serve a single block should stay local to that block's own folder.

## Commit Messages

Commits follow a `type(scope): summary` format, for example:

```
feat(timeline): add Timeline and Timeline Item blocks
fix(accordion): correct dark mode background blending
docs: update README installation steps
chore: bump version to 1.5.0
```

Common types: `feat`, `fix`, `docs`, `chore`, `refactor`. Commit messages and code comments should describe the change itself, not the tools used to produce it.

## Submitting Changes

1. Fork the repository and create a branch from `main`.
2. Make your change, following the standards above.
3. Confirm `npm run build` completes without errors or warnings, and `composer lint` / `npm run lint:js` / `npm run lint:css` pass.
4. Manually verify the change in both the block editor and the front end, including dark mode if your change touches styling.
5. Open a pull request describing what changed and why.

By contributing, you agree that your contributions will be licensed under the project's [GPL-2.0-or-later license](LICENSE).

## Code of Conduct

This project follows a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you're expected to uphold it.

## Reporting Issues

Use the issue tracker for bugs and feature requests. For security vulnerabilities, see [SECURITY.md](SECURITY.md) instead of opening a public issue.
