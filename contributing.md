# Contributing

Hello! It's great that you are interested in contributing to ESLint Plugin
Dependencies. Before submitting your contribution, please take a moment to read
the following guide:

## Installation

This project uses the [pnpm](https://pnpm.io) package manager. Therefore, to
work with the project, you need to install it.

How to set up a project locally and run tests:

1. Clone repo:

```sh
git clone git@github.com:omnicajs/eslint-plugin-dependencies.git
```

2. Install dependencies:

```sh
pnpm install
```

3. Run tests:

```sh
pnpm test
```

## Pull Request Guidelines

Before create pull request fork this repo and create a new branch.

ESLint Plugin Dependencies aims to be lightweight, so think before adding new
dependencies to your project.

Commit messages must follow the
[commit message convention](https://conventionalcommits.org/) so that changelogs
can be automatically generated.

Make sure tests pass.

When a PR includes borrowed code, include this checklist in the PR description
and mark each item explicitly:

- [ ] I documented provenance in each borrowed/adapted module header.
- [ ] I added a minimal snapshot under `vendor/<source-repo>/...`.
- [ ] I copied required license text files into the same `vendor/...` subtree.
- [ ] I updated `vendor/manifest.json` with repository, commit, files, and
  license metadata.
- [ ] I verified license compatibility against this contributing guide.

## Fork Manifesto

This fork is focused on one area only: `import` and `export` declarations.

Our scope includes:

- ordering and grouping of `import` / `export` declarations,
- deterministic rebuilds of declaration blocks based on rule configuration,
- diagnostics for patterns that violate the configured structure.

Our scope excludes:

- adding rules outside `import` / `export` workflows,
- adding overlapping rules when another plugin already provides a solution that
  covers 100% of the required use cases for this fork.

When proposing a new rule, include:

- the concrete unresolved use case,
- why existing plugins do not fully cover it,
- expected behavior with valid and invalid examples.

## Borrowed Code Policy

If a module is based on borrowed code, contributors must document provenance and
license details in two places: the module header and the `vendor/` snapshot.

### 1) Module Header Requirement

Every borrowed or adapted module must include a top-level comment with:

- original author or organization,
- source repository URL,
- exact commit hash used as the base,
- source license identifier,
- short note describing local modifications.

Use this template:

```ts
/**
 * Borrowed/adapted from: <org-or-author>/<repo>
 * Source: <repository-url>
 * Commit: <full-commit-hash>
 * License: <SPDX-id>
 * Local changes: <short description>
 */
```

### 2) `vendor/` Snapshot Requirement

For every borrowing event, create a minimal snapshot under `vendor/` using the
source repository name in the path.

Example:

```txt
vendor/@azat-io/eslint-plugin-perfectionist/<copied-files>
```

Rules:

- copy only borrowed files and required neighboring artifacts,
- include the source license text in the same `vendor/...` subtree,
- keep borrowed files traceable to the commit hash declared in module headers.

## License Compatibility (Short Guide)

This section is an engineering guideline, not legal advice.

- Permissive licenses (`MIT`, `BSD-2-Clause`, `BSD-3-Clause`, `Apache-2.0`,
  `ISC`) are allowed by default when attribution and notice requirements are
  preserved.
- Copyleft licenses (`MPL-*`, `LGPL-*`, `GPL-*`, `AGPL-*`) are denied by
  default. They may be used only after explicit maintainer approval in the PR
  before code import, with obligations documented in both module headers and
  `vendor/manifest.json`.
- `UNLICENSED` or unclear licensing is treated as not borrowable.

Before borrowing code:

- verify the source license in the upstream repository,
- confirm obligations (copyright notice, NOTICE files, patent clauses),
- copy required license texts into `vendor/...`,
- document provenance in module headers.

## Additional information

This plugin uses
[@typescript-eslint/parser](https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/parser).
When developing, I recommend using [AST explorer](https://ast-explorer.dev). It
makes development much easier.
