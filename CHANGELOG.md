# Change Log

All notable changes to the "Docker Wingman" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.0] - 2026-04
- Fix broken imports/exports that prevented extension from loading
- Remove dead code copied from Conda Wingman (unused YAML parsing functions)
- Add null safety guards throughout (sendCommandToTerminal, getOpenDocumentPath, activeFileIsDockerfile)
- Add clickable Docker Hub links for FROM base images in Dockerfiles
- Add hover tooltips showing Docker Hub image info (description, stars, pulls)
- Add docker availability check on activation
- Add configurable status bar visibility (dockerWingman.showStatusBarItems setting)
- Add showAll/hideAll status bar helpers with config listener
- Fix named-argument antipattern in status bar item constructors
- Fix test files (renamed from conda references, updated glob API for v11)
- Migrate ESLint from .eslintrc.json to flat config (eslint.config.js)
- Update GitHub Actions to v4
- Replace deprecated vsce with @vscode/vsce
- Remove unused js-yaml dependency
- Fix keywords (removed YAML, added Container/Dockerfile)
- Bump engines.vscode to ^1.95.0 to match @types/vscode
- Clean up README (remove plan notes, add new feature docs)
- var → const/let throughout

## [0.0.2] - 2024-10
- Fixing dependabot alterts
- Changing VSMarketplace background colour
- Setup CD

## [0.0.1] - 2024-10
- Initial release of extension to VSCode Extension Marketplace