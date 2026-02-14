---
title: Getting Started
description:
  Get started with our ESLint Plugin Dependencies by following this
  comprehensive guide. Learn how to install, configure, and use our tool to
  maintain a consistent and high-quality codebase
keywords:
  - eslint
  - introduction
  - eslint plugin
  - coding standards
  - code quality
  - javascript linting
  - code consistency
  - plugin features
  - installation guide
  - configuration guide
---

# Getting Started

## Installation

Let's get started. You'll need to install [ESLint](https://eslint.org/) v8.45.0
or greater:

### npm

```bash
npm install --save-dev eslint
```

### pnpm

```bash
pnpm add --save-dev eslint
```

### yarn

```bash
yarn add --dev eslint
```

### bun

```bash
bun install --dev eslint
```

Next, install `@omnicajs/eslint-plugin-dependencies`:

### npm

```bash
npm install --save-dev @omnicajs/eslint-plugin-dependencies
```

### pnpm

```bash
pnpm add --save-dev @omnicajs/eslint-plugin-dependencies
```

### yarn

```bash
yarn add --dev @omnicajs/eslint-plugin-dependencies
```

### bun

```bash
bun install --dev @omnicajs/eslint-plugin-dependencies
```

## Usage

Add `dependencies` to the plugins section of your ESLint configuration. Then
configure the rules you want to use under the rules section.

### Flat Config

```tsx
// eslint.config.js
import dependencies from '@omnicajs/eslint-plugin-dependencies'

export default [
  {
    plugins: {
      dependencies,
    },
    rules: {
      'dependencies/sort-imports': 'error',
    },
  },
]
```

### Legacy Config

```tsx
// .eslintrc.js
module.exports = {
  plugins: ['dependencies'],
  rules: {
    'dependencies/sort-imports': 'error',
  },
}
```

## Settings

Many rules have common settings. You can set them in the `settings` field.

The highest priority is given to the settings of a particular rule. Next comes
the settings field, and then the default values.

In settings, you can set the following options:

- `type` — The type of sorting. Possible values are `'alphabetical'`,
  `'natural'`, `'line-length'`, `'custom'` or `'unsorted'`.
- `order` — The order of sorting. Possible values are `'asc'` and `'desc'`.
- `fallbackSort` — The fallback sorting type and order to use when two elements
  are equal.
- `alphabet` — The custom alphabet to use when `type` is `'custom'`.
- `ignoreCase` — Ignore case when sorting.
- `specialCharacters` — Control whether special characters should be kept,
  trimmed or removed before sorting. Values can be `'keep'`, `'trim'` or
  `'remove'`.
- `locales` - The locales of sorting. Values can be a string with a BCP 47
  language tag, or an array of such strings. See
  [String.prototype.localeCompare() - locales](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare#locales).
- `partitionByComment` — Partition the sorted elements by comments. Values can
  be `true`, `false` or regexp pattern.
- `partitionByNewLine` — Partition the sorted elements by newlines. Values can
  be `true` or `false`.
- `newlinesBetween` — Specifies how to handle newlines between groups. Values
  can be `'ignore'` or a number.
- `newlinesInside` — Specifies how to handle newlines between elements of each
  group. Values can be `'ignore'`, `'newlinesBetween'` or a number.

Example:

### Flat Config

```tsx
// eslint.config.js
import dependencies from '@omnicajs/eslint-plugin-dependencies'

export default [
  {
    plugins: {
      dependencies,
    },
    rules: {
      'dependencies/sort-imports': [
        'error',
        {
          type: 'alphabetical',
        },
      ],
      'dependencies/sort-exports': ['error'],
    },
    settings: {
      dependencies: {
        type: 'line-length',
        partitionByComment: true,
      },
    },
  },
]
```

### Legacy Config

```tsx
// .eslintrc.js
module.exports = {
  plugins: ['dependencies'],
  rules: {
    'dependencies/sort-imports': [
      'error',
      {
        type: 'alphabetical',
      },
    ],
    'dependencies/sort-exports': ['error'],
  },
  settings: {
    dependencies: {
      type: 'line-length',
      partitionByComment: true,
    },
  },
}
```
