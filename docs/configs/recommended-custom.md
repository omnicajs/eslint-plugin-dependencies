---
title: recommended-custom
description: Learn more about the recommended custom ESLint Plugin Dependencies configuration for sorting and organizing your code. Take customization to new levels while maintaining a consistent coding style with this setup
shortDescription: All plugin rules with your own custom sorting
keywords:
  - eslint
  - recommended custom config
  - eslint configuration
  - coding standards
  - code quality
  - javascript linting
  - custom sorting
  - @omnicajs/eslint-plugin-dependencies
---
Configuration for the `@omnicajs/eslint-plugin-dependencies` plugin, which provides all plugin rules with your predefined custom ordered alphabet.

This configuration allows you to define your own custom order for sorting elements in your codebase as you desire.

## When to Use

Each rule in `@omnicajs/eslint-plugin-dependencies` offers many options that should suit most use cases.

If this is not enough, you may define your own alphabet and use the `recommended-custom` configuration to enforce a consistent custom order across various data structures in your codebase.

Use this configuration to precisely tune how elements should be sorted while keeping readability and maintainability at their highest levels.

## Usage

You must provide an `alphabet` option in the `dependencies` settings object or for each rule individually.
This option should be a string that represents an ordered alphabet.

Example: `01234564789abcdef...`

Use the `Alphabet` utility class from `@omnicajs/eslint-plugin-dependencies/alphabet` to quickly generate a custom alphabet.

### Flat Config

```tsx
// eslint.config.js
import { Alphabet } from '@omnicajs/eslint-plugin-dependencies/alphabet'
import dependencies from '@omnicajs/eslint-plugin-dependencies'
import naturalCompare from 'natural-compare-lite';

const myCustomAlphabet = Alphabet
  .generateRecommendedAlphabet()
  .sortingBy((a, b) => naturalCompare(a, b))
  .getCharacters();

export default [
  {
    ...dependencies.configs['recommended-custom'],
    settings: {
      dependencies: {
          alphabet: myCustomAlphabet
      }
    }
  }
]
```

### Legacy Config

```tsx
// .eslintrc.js
import { Alphabet } from '@omnicajs/eslint-plugin-dependencies/alphabet'
import dependencies from '@omnicajs/eslint-plugin-dependencies'
import naturalCompare from 'natural-compare-lite';

const myCustomAlphabet = Alphabet
  .generateRecommendedAlphabet()
  .sortingBy((a, b) => naturalCompare(a, b))
  .getCharacters();

module.exports = {
  extends: [
    'plugin:dependencies/recommended-custom-legacy',
  ],
  settings: {
    dependencies: {
        alphabet: myCustomAlphabet
    }
  }
}
```

## Alphabet class

The `Alphabet` class from `@omnicajs/eslint-plugin-dependencies/alphabet` provides a set of methods to generate and manipulate alphabets.

### Static generators

#### - `static generateCompleteAlphabet(): Alphabet`

Generates an alphabet containing all characters from the Unicode standard except for irrelevant [Unicode planes](https://en.wikipedia.org/wiki/Plane_(Unicode)).
Contains the Unicode planes 0, 1, 2 and 3.

#### - `static generateRecommendedAlphabet(): Alphabet`

Generates an alphabet containing relevant characters from the Unicode standard. Contains the [Unicode planes](https://en.wikipedia.org/wiki/Plane_(Unicode)) 0 and 1.

#### - `static generateFrom(values: string[] | string): Alphabet`

Generates an alphabet from the given characters.

### Adding/Removing characters

#### - `pushCharacters(values: string[] | string): this`

Adds specific characters to the end of the alphabet.

#### - `removeCharacters(values: string[] | string): this`

Removes specific characters from the alphabet.

#### - `removeUnicodeRange({ start: number; end: number }): this`

Removes specific characters from the alphabet by their range

### Sorters

#### - `sortByLocaleCompare(locales?: Intl.LocalesArgument): this`

Sorts the alphabet by the locale order of the characters.

#### - `sortByNaturalSort(locale?: string): this`

Sorts the alphabet by the natural order of the characters using [natural-orderby](https://github.com/yobacca/natural-orderby).

#### - `sortByCharCodeAt(): this`

Sorts the alphabet by the character code point.

#### - `sortBy(sortingFunction: (characterA: string, characterB: string) => number): this`

Sorts the alphabet by the sorting function provided

#### - `reverse(): this`

Reverses the alphabet.

### Other methods

#### - `prioritizeCase(casePriority: 'lowercase' | 'uppercase'): this`

For each character with a lower and upper case, permutes the two cases so that the alphabet is ordered by the case priority entered.

```ts
Alphabet.generateFrom('aAbBcdCD')
.prioritizeCase('uppercase')
// Returns 'AaBbCDcd'
````

#### - `placeAllWithCaseBeforeAllWithOtherCase(caseToComeFirst: 'uppercase' | 'lowercase'): this`

Permutes characters with cases so that all characters with the entered case are put before the other characters.

```ts
Alphabet.generateFrom('aAbBcCdD')
.placeAllWithCaseBeforeAllWithOtherCase('lowercase')
// Returns 'abcdABCD'
````

#### - `placeCharacterBefore({ characterBefore: string; characterAfter: string }): this`

Places a specific character right before another character in the alphabet.

```ts
Alphabet.generateFrom('ab-cd/')
.placeCharacterBefore({ characterBefore: '/', characterAfter: '-' })
// Returns 'ab/-cd'
```

#### - `placeCharacterAfter({ characterBefore: string; characterAfter: string }): this`

Places a specific character right after another character in the alphabet.

```ts
Alphabet.generateFrom('ab-cd/')
.placeCharacterAfter({ characterBefore: '/', characterAfter: '-' })
// Returns 'abcd/-'
```

#### - `getCharacters(): string`

Retrieves the characters from the alphabet.
