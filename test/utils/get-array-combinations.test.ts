/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import { describe, expect, it } from 'vitest'

import { getArrayCombinations } from '../../utils/get-array-combinations'

describe('get-array-combinations', () => {
  it('gets array combinations', () => {
    expect(getArrayCombinations(['a', 'b', 'c', 'd'], 3)).toStrictEqual([
      ['a', 'b', 'c'],
      ['a', 'b', 'd'],
      ['a', 'c', 'd'],
      ['b', 'c', 'd'],
    ])
  })
})
