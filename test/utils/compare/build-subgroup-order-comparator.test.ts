/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import { describe, expect, it } from 'vitest'

import type { SortingNode } from '../../../types/sorting-node'

import { buildSubgroupOrderComparator } from '../../../utils/compare/build-subgroup-order-comparator'

describe('build-subgroup-order-comparator', () => {
  it('sorts nodes within the same subgroup in asc order', () => {
    let comparator = buildSubgroupOrderComparator({
      groups: [['group-b', 'group-a']],
      order: 'asc',
    })

    let result = comparator(
      buildTestNode({ group: 'group-b' }),
      buildTestNode({ group: 'group-a' }),
    )

    expect(result).toBe(-1)
  })

  it('sorts nodes within the same subgroup in desc order', () => {
    let comparator = buildSubgroupOrderComparator({
      groups: [['group-b', 'group-a']],
      order: 'desc',
    })

    let result = comparator(
      buildTestNode({ group: 'group-b' }),
      buildTestNode({ group: 'group-a' }),
    )

    expect(result).toBe(1)
  })

  it('returns 0 when nodes are not in the same subgroup', () => {
    let comparator = buildSubgroupOrderComparator({
      groups: ['group-a', 'group-b'],
      order: 'asc',
    })

    let result = comparator(
      buildTestNode({ group: 'group-a' }),
      buildTestNode({ group: 'group-b' }),
    )

    expect(result).toBe(0)
  })

  it('handles group overrides and newlinesBetween entries', () => {
    let comparator = buildSubgroupOrderComparator({
      groups: [{ newlinesBetween: 1 }, { group: ['group-b', 'group-a'] }],
      order: 'asc',
    })

    let result = comparator(
      buildTestNode({ group: 'group-a' }),
      buildTestNode({ group: 'group-b' }),
    )

    expect(result).toBe(1)
  })

  it('returns 0 when group override does not include the node group', () => {
    let comparator = buildSubgroupOrderComparator({
      groups: [{ group: ['group-a', 'group-b'] }],
      order: 'asc',
    })

    let result = comparator(
      buildTestNode({ group: 'group-c' }),
      buildTestNode({ group: 'group-b' }),
    )

    expect(result).toBe(0)
  })

  it('throws on unsupported group options', () => {
    let comparator = buildSubgroupOrderComparator({
      groups: [{ foo: 'bar' } as unknown as { group: string[] }],
      order: 'asc',
    })

    expect(() => {
      comparator(
        buildTestNode({ group: 'group-a' }),
        buildTestNode({ group: 'group-b' }),
      )
    }).toThrowError()
  })

  function buildTestNode({ group }: { group: string }): SortingNode {
    return {
      node: {} as SortingNode['node'],
      isEslintDisabled: false,
      name: 'test-node',
      partitionId: 0,
      size: 0,
      group,
    }
  }
})
