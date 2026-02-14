/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 37b7de36139fd321dd947dcefceb67b6d780c126 License: MIT Local changes: fork-native test coverage derived from upstream rule behavior.
 */
import { describe, expect, it } from 'vitest'

import type { SortingNode } from '../../../types/sorting-node'

import { defaultComparatorByOptionsComputer } from '../../../utils/compare/default-comparator-by-options-computer'

describe('default-comparator-by-options-computer', () => {
  it('returns unsorted comparator for subgroup-order when groups are not provided', () => {
    let comparator = defaultComparatorByOptionsComputer({
      fallbackSort: {
        type: 'alphabetical',
      },
      specialCharacters: 'keep',
      type: 'subgroup-order',
      ignoreCase: true,
      locales: 'en-US',
      alphabet: '',
      order: 'asc',
    })

    expect(
      comparator({ name: 'b' } as SortingNode, { name: 'a' } as SortingNode),
    ).toBe(0)
  })
})
