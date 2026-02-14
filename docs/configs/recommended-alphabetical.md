---
title: recommended-alphabetical
description: Explore the recommended alphabetical ESLint Plugin Dependencies configuration for sorting and organizing your code. Improve code readability and maintain a consistent coding style with this setup
shortDescription: All plugin rules with alphabetical sorting in ascending order
keywords:
  - eslint
  - recommended alphabetical config
  - eslint configuration
  - coding standards
  - code quality
  - javascript linting
  - alphabetical sorting
  - @omnicajs/eslint-plugin-dependencies
---

Configuration for the `@omnicajs/eslint-plugin-dependencies` plugin, which
provides all plugin rules with predefined options: alphabetical sorting in
ascending order.

Uses
[localeCompare](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare)
to sort elements.

It makes it just a bit faster to find a declaration in a large list. Remember,
you read code far more than you write it.

## When to Use

Use the `recommended-alphabetical` configuration when you want to enforce a
consistent alphabetical order across various data structures in your codebase.

This configuration is particularly useful for large projects where readability
and maintainability are crucial.

It helps quickly locate declarations and ensures that similar elements are
grouped together, reducing cognitive load for developers navigating the code.

## Usage

### Flat Config

```tsx
// eslint.config.js
import dependencies from '@omnicajs/eslint-plugin-dependencies'

export default [dependencies.configs['recommended-alphabetical']]
```

### Legacy Config

```tsx
// .eslintrc.js
module.exports = {
  extends: ['plugin:dependencies/recommended-alphabetical-legacy'],
}
```
