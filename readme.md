# ESLint Plugin Dependencies

[![Version](https://img.shields.io/npm/v/%40omnicajs%2Feslint-plugin-dependencies.svg?color=4a32c3&labelColor=26272b)](https://npmjs.com/package/@omnicajs/eslint-plugin-dependencies)
[![GitHub License](https://img.shields.io/badge/license-MIT-232428.svg?color=4a32c3&labelColor=26272b)](license.md)

An ESLint plugin focused on consistent `import` / `export` declaration order and
structure.

This plugin defines rules for sorting and structuring `import` and `export`
declarations.

All rules are automatically fixable.

## Documentation

See [docs](docs/README.md).

## Installation

You'll first need to install [ESLint](https://eslint.org) v8.45.0 or greater:

```sh
npm install --save-dev eslint
```

Next, install `@omnicajs/eslint-plugin-dependencies`:

```sh
npm install --save-dev @omnicajs/eslint-plugin-dependencies
```

## Usage

Add `@omnicajs/eslint-plugin-dependencies` to the plugins section of the ESLint
configuration file and define the list of rules you will use.

### Flat Config ([`eslint.config.js`](https://eslint.org/docs/latest/use/configure/configuration-files))

```js
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
          type: 'natural',
          order: 'asc',
        },
      ],
    },
  },
]
```

### Legacy Config ([`.eslintrc.js`](https://eslint.org/docs/latest/use/configure/configuration-files-deprecated))

<!-- prettier-ignore -->
```js
module.exports = {
  plugins: [
    'dependencies',
  ],
  rules: {
    'dependencies/sort-imports': [
      'error',
      {
        type: 'natural',
        order: 'asc',
      }
    ]
  }
}
```

## Configs

The easiest way to use `@omnicajs/eslint-plugin-dependencies` is to use
ready-made configs. Config files use import/export rules from the plugin, but
you can override them.

### Flat Config ([`eslint.config.js`](https://eslint.org/docs/latest/use/configure/configuration-files))

<!-- prettier-ignore -->
```js
import dependencies from '@omnicajs/eslint-plugin-dependencies'

export default [
  dependencies.configs['recommended-natural'],
]
```

### Legacy Config ([`.eslintrc.js`](https://eslint.org/docs/latest/use/configure/configuration-files-deprecated))

<!-- prettier-ignore -->
```js
module.exports = {
  extends: [
    'plugin:dependencies/recommended-natural-legacy',
  ],
}
```

### List of Configs

| Name                                                                 | Description                                                         |
| :------------------------------------------------------------------- | :------------------------------------------------------------------ |
| [recommended-alphabetical](docs/configs/recommended-alphabetical.md) | Import/export rules with alphabetical sorting in ascending order    |
| [recommended-natural](docs/configs/recommended-natural.md)           | Import/export rules with natural sorting in ascending order         |
| [recommended-line-length](docs/configs/recommended-line-length.md)   | Import/export rules with sorting by line length in descending order |
| [recommended-custom](docs/configs/recommended-custom.md)             | Import/export rules with sorting by your own custom order           |

## Rules

🔧 Automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).

| Name                                                           | Description                                | 🔧  |
| :------------------------------------------------------------- | :----------------------------------------- | :-- |
| [sort-export-attributes](docs/rules/sort-export-attributes.md) | Enforce sorted export attributes           | 🔧  |
| [sort-exports](docs/rules/sort-exports.md)                     | Enforce sorted exports                     | 🔧  |
| [sort-import-attributes](docs/rules/sort-import-attributes.md) | Enforce sorted import attributes           | 🔧  |
| [sort-imports](docs/rules/sort-imports.md)                     | Enforce sorted imports                     | 🔧  |
| [sort-named-exports](docs/rules/sort-named-exports.md)         | Enforce sorted named exports               | 🔧  |
| [sort-named-imports](docs/rules/sort-named-imports.md)         | Enforce sorted named imports               | 🔧  |
| [import-style](docs/rules/import-style.md)                     | Enforce explicit module import style       | 🔧  |
| separate-type-imports                                          | Enforce dedicated type import declarations | 🔧  |
| separate-type-partitions                                       | Enforce partitions for type-only imports   | 🔧  |

## Versioning Policy

This plugin is following [Semantic Versioning](https://semver.org/) and
[ESLint's Semantic Versioning Policy](https://github.com/eslint/eslint#semantic-versioning-policy).

## Contributing

See [Contributing Guide](contributing.md).
