# ESLint Plugin Dependencies

<img
  src="https://raw.githubusercontent.com/omnicajs/eslint-plugin-dependencies/main/docs/public/logo.svg"
  alt="ESLint Plugin Dependencies logo"
  align="right"
  height="160"
  width="160"
/>

[![Version](https://img.shields.io/npm/v/%40omnicajs%2Feslint-plugin-dependencies.svg?color=4a32c3&labelColor=26272b)](https://npmjs.com/package/@omnicajs/eslint-plugin-dependencies)
[![Monthly Download](https://img.shields.io/npm/dm/%40omnicajs%2Feslint-plugin-dependencies.svg?color=4a32c3&labelColor=26272b)](https://npmjs.com/package/@omnicajs/eslint-plugin-dependencies)
[![Code Coverage](https://img.shields.io/codecov/c/github/omnicajs/eslint-plugin-dependencies.svg?color=4a32c3&labelColor=26272b)](https://npmjs.com/package/@omnicajs/eslint-plugin-dependencies)
[![GitHub License](https://img.shields.io/badge/license-MIT-232428.svg?color=4a32c3&labelColor=26272b)](https://github.com/omnicajs/eslint-plugin-dependencies/blob/main/license.md)

An ESLint plugin that sets rules to format your code and make it consistent.

This plugin defines rules for sorting and structuring `import` and `export`
declarations.

All rules are automatically fixable. It's safe!

## Why

Sorting imports and properties in software development offers numerous benefits:

- **Readability**: Finding declarations in a sorted, large list is a little
  faster. Remember that you read the code much more often than you write it.

- **Maintainability**: Sorting imports and properties is considered a good
  practice in software development, contributing to code quality and consistency
  across the codebase.

- **Code Review and Collaboration**: If you set rules that say you can only do
  things one way, no one will have to spend time thinking about how to do it.

- **Code Uniformity**: When all code looks exactly the same, it is very hard to
  see who wrote it, which makes achieving the lofty goal of _collective code
  ownership_ easier.

- **Aesthetics**: This not only provides functional benefits, but also gives the
  code an aesthetic appeal, visually pleasing and harmonious structure. Take
  your code to a beauty salon!

## Documentation

See [docs](https://dependencies.omnicajs.dev).

### Alphabetical Sorting

<picture>
  <source
    srcset="https://raw.githubusercontent.com/omnicajs/eslint-plugin-dependencies/main/docs/public/examples/example-alphabetical-light.webp"
    media="(prefers-color-scheme: light)"
  />
  <source
    srcset="https://raw.githubusercontent.com/omnicajs/eslint-plugin-dependencies/main/docs/public/examples/example-alphabetical-dark.webp"
    media="(prefers-color-scheme: dark)"
  />
  <img
    src="https://raw.githubusercontent.com/omnicajs/eslint-plugin-dependencies/main/docs/public/examples/example-alphabetical-light.webp"
    alt="ESLint Plugin Dependencies alphabetical usage example"
  />
</picture>

### Sorting by Line Length

<picture>
  <source
    srcset="https://raw.githubusercontent.com/omnicajs/eslint-plugin-dependencies/main/docs/public/examples/example-line-length-light.webp"
    media="(prefers-color-scheme: light)"
  />
  <source
    srcset="https://raw.githubusercontent.com/omnicajs/eslint-plugin-dependencies/main/docs/public/examples/example-line-length-dark.webp"
    media="(prefers-color-scheme: dark)"
  />
  <img
    src="https://raw.githubusercontent.com/omnicajs/eslint-plugin-dependencies/main/docs/public/examples/example-line-length-light.webp"
    alt="ESLint Plugin Dependencies line length usage example"
  />
</picture>

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
ready-made
configs. Config files use all the rules of the current plugin, but you can
override them.

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

| Name                                                                                   | Description                                                      |
| :------------------------------------------------------------------------------------- | :--------------------------------------------------------------- |
| [recommended-alphabetical](https://dependencies.omnicajs.dev/configs/recommended-alphabetical) | All plugin rules with alphabetical sorting in ascending order    |
| [recommended-natural](https://dependencies.omnicajs.dev/configs/recommended-natural)           | All plugin rules with natural sorting in ascending order         |
| [recommended-line-length](https://dependencies.omnicajs.dev/configs/recommended-line-length)   | All plugin rules with sorting by line length in descending order |
| [recommended-custom](https://dependencies.omnicajs.dev/configs/recommended-custom)             | All plugin rules with sorting by your own custom order           |

## Rules

<!-- begin auto-generated rules list -->

🔧 Automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).

| Name                                                                                     | Description                                   | 🔧  |
| :--------------------------------------------------------------------------------------- | :-------------------------------------------- | :-- |
| [sort-export-attributes](https://dependencies.omnicajs.dev/rules/sort-export-attributes)         | Enforce sorted export attributes              | 🔧  |
| [sort-exports](https://dependencies.omnicajs.dev/rules/sort-exports)                             | Enforce sorted exports                        | 🔧  |
| [sort-import-attributes](https://dependencies.omnicajs.dev/rules/sort-import-attributes)         | Enforce sorted import attributes              | 🔧  |
| [sort-imports](https://dependencies.omnicajs.dev/rules/sort-imports)                             | Enforce sorted imports                        | 🔧  |
| [sort-named-exports](https://dependencies.omnicajs.dev/rules/sort-named-exports)                 | Enforce sorted named exports                  | 🔧  |
| [sort-named-imports](https://dependencies.omnicajs.dev/rules/sort-named-imports)                 | Enforce sorted named imports                  | 🔧  |
| [import-style](https://dependencies.omnicajs.dev/rules/import-style)                             | Enforce explicit module import style          | 🔧  |
| separate-type-imports                                                                      | Enforce dedicated type import declarations    | 🔧  |
| separate-type-partitions                                                                    | Enforce partitions for type-only imports      | 🔧  |

<!-- end auto-generated rules list -->

## FAQ

### Can I automatically fix problems in the editor?

Yes. To do this, you need to enable autofix in ESLint when you save the file in
your editor. You may find instructions for your editor
[here](https://dependencies.omnicajs.dev/guide/integrations).

### Is it safe?

Overall, yes. We want to make sure that the work of the plugin does not
negatively affect the behavior of the code. For example, the plugin takes into
account spread operators in JSX and objects, comments to the code. Safety is our
priority. If you encounter any problem, you can create an
[issue](https://github.com/omnicajs/eslint-plugin-dependencies/issues/new/choose).

### Why not use Prettier?

I love Prettier. However, this is not its area of responsibility. Prettier is
used for formatting, and ESLint for styling. For example, changing the order of
imports can affect how the code works (console.log calls, fetch, style loading).
Prettier should not change the AST. There is a cool article about this:
["The Blurry Line Between Formatting and Style"](https://blog.joshuakgoldberg.com/the-blurry-line-between-formatting-and-style)
by **@joshuakgoldberg**.

## Versioning Policy

This plugin is following [Semantic Versioning](https://semver.org/) and
[ESLint's Semantic Versioning Policy](https://github.com/eslint/eslint#semantic-versioning-policy).

## Contributing

See
[Contributing Guide](https://github.com/omnicajs/eslint-plugin-dependencies/blob/main/contributing.md).

## License

MIT &copy; [Azat S.](https://azat.io)
