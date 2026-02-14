/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes: maintained and adapted in this fork; see git history for file-specific modifications.
 */
import { describe, expect, it } from 'vitest'

import type { SortingNodeWithDependencies } from '../../utils/sort-nodes-by-dependencies'

import { computeNodesInCircularDependencies } from '../../utils/compute-nodes-in-circular-dependencies'

describe('computeNodesInCircularDependencies', () => {
  it('returns nodes in circular dependencies', () => {
    let nodeA = createTestNode('a')
    let nodeB = createTestNode('b')
    let nodeC = createTestNode('c')
    let nodeD = createTestNode('d')
    let nodeE = createTestNode('e')
    let nodeF = createTestNode('f')
    let nodeG = createTestNode('g')
    let nodeH = createTestNode('h')
    linkNodes([nodeA, nodeB, nodeC, nodeA])
    linkNodes([nodeD, nodeE])
    linkNodes([nodeF, nodeA])
    linkNodes([nodeC, nodeG])
    linkNodes([nodeC, nodeH, nodeA])

    expect(
      computeNodesInCircularDependencies([
        nodeA,
        nodeB,
        nodeC,
        nodeD,
        nodeE,
        nodeF,
        nodeG,
        nodeH,
      ]),
    ).toEqual(new Set([nodeA, nodeB, nodeC, nodeH]))
  })

  function createTestNode(name: string): SortingNodeWithDependencies {
    return {
      dependencies: [] as string[],
      dependencyNames: [name],
      name,
    } as SortingNodeWithDependencies
  }
})

function linkNodes(linkedNodes: SortingNodeWithDependencies[]): void {
  for (let i = 0; i < linkedNodes.length - 1; i++) {
    let node = linkedNodes[i]!
    let nextNode = linkedNodes[i + 1]!
    if (!node.dependencies.includes(nextNode.name)) {
      node.dependencies.push(nextNode.name)
    }
  }
}
