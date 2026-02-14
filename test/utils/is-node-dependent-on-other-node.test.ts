/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes: maintained and adapted in this fork; see git history for file-specific modifications.
 */
import { describe, expect, it } from 'vitest'

import type { SortingNodeWithDependencies } from '../../utils/sort-nodes-by-dependencies'

import { isNodeDependentOnOtherNode } from '../../utils/is-node-dependent-on-other-node'

describe('isNodeDependentOnOtherNode', () => {
  it('should return false if the two nodes are strictly equal', () => {
    let node = createNodeWithDependencies({
      dependencyNames: [],
      dependencies: [],
    })

    expect(isNodeDependentOnOtherNode(node, node)).toBeFalsy()
  })

  it('should return true if a dependency is among the dependency names', () => {
    let node1 = createNodeWithDependencies({
      dependencyNames: ['a', 'b'],
      dependencies: [],
    })
    let node2 = createNodeWithDependencies({
      dependencyNames: [],
      dependencies: ['b'],
    })

    expect(isNodeDependentOnOtherNode(node1, node2)).toBeTruthy()
  })

  function createNodeWithDependencies({
    dependencyNames,
    dependencies,
  }: {
    dependencyNames: string[]
    dependencies: string[]
  }): SortingNodeWithDependencies {
    return {
      dependencyNames,
      dependencies,
    } as SortingNodeWithDependencies
  }
})
