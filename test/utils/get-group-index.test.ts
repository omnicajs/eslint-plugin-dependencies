/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import { describe, expect, it } from 'vitest'

import type { SortingNode } from '../../types/sorting-node'

import { getGroupIndex } from '../../utils/get-group-index'

describe('get-group-index', () => {
  it('should return the first index matching a string group', () => {
    expect(
      getGroupIndex(
        [
          'group',
          ['group'],
          { commentAbove: 'foo', group: 'group' },
          { commentAbove: 'foo', group: ['group'] },
        ],
        createSortingNode('group'),
      ),
    ).toBe(0)
  })

  it('should return the first index matching a string array group', () => {
    expect(
      getGroupIndex(
        [
          ['group'],
          'group',
          { commentAbove: 'foo', group: 'group' },
          { commentAbove: 'foo', group: ['group'] },
        ],
        createSortingNode('group'),
      ),
    ).toBe(0)
  })

  it('should return the first index matching an object-based string group', () => {
    expect(
      getGroupIndex(
        [
          { commentAbove: 'foo', group: 'group' },
          'group',
          ['group'],
          { commentAbove: 'foo', group: ['group'] },
        ],
        createSortingNode('group'),
      ),
    ).toBe(0)
  })

  it('should return the first index matching an object-based string array group', () => {
    expect(
      getGroupIndex(
        [
          { commentAbove: 'foo', group: ['group'] },
          'group',
          ['group'],
          { commentAbove: 'foo', group: 'group' },
        ],
        createSortingNode('group'),
      ),
    ).toBe(0)
  })

  function createSortingNode(group: string): SortingNode {
    return { group } as SortingNode
  }
})
