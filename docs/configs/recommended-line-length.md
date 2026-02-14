---
title: recommended-line-length
description: Check out the recommended line-length ESLint configuration to maintain optimal line lengths in your code. Enhance readability and consistency with this setup
shortDescription: All plugin rules with sorting by line length in descending order
keywords:
  - eslint
  - recommended line length config
  - eslint configuration
  - coding standards
  - code quality
  - javascript linting
  - line length sorting
  - line length configuration
  - @omnicajs/eslint-plugin-dependencies
  - eslint line length
  - line length rules
  - line length configuration
  - line length settings
  - line length options
  - line length best practices
  - line length guidelines
  - line length recommendations
---
Configuration for the `@omnicajs/eslint-plugin-dependencies` plugin, which provides all plugin rules with preset options: sorting by string length in descending order.

This configuration will make your code prettier and more visually pleasing.

## When to Use

Use the `recommended-line-length` configuration when you want your code to look neat and visually pleasing.

This configuration is especially useful for projects where the aesthetic appearance of the code is important and where developers appreciate clean alignment and visual harmony. It helps create code that is easier to read and perceive by minimizing visual clutter and enhancing the overall structure of the code.

## Usage

### Flat Config

```tsx
// eslint.config.js
import dependencies from '@omnicajs/eslint-plugin-dependencies'

export default [
  dependencies.configs['recommended-line-length'],
]
```

### Legacy Config

```tsx
// .eslintrc.js
module.exports = {
  extends: [
    'plugin:dependencies/recommended-line-length-legacy',
  ],
}
```
