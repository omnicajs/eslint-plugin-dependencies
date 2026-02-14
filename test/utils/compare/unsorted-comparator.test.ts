/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import { describe, expect, it } from 'vitest'

import type { SortingNode } from '../../../types/sorting-node'

import { unsortedComparator } from '../../../utils/compare/unsorted-comparator'

describe('unsorted-comparator', () => {
  it.each([
    { aName: 'a', bName: 'b' },
    { aName: 'b', bName: 'a' },
  ])('should always return 0', ({ aName, bName }) => {
    let result = unsortedComparator(
      buildTestNode({ name: aName }),
      buildTestNode({ name: bName }),
    )

    expect(result).toBe(0)
  })

  function buildTestNode({ name }: { name: string }): SortingNode {
    return {
      name,
    } as SortingNode
  }
})
