/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 37b7de36139fd321dd947dcefceb67b6d780c126 License: MIT Local changes: fork-native test coverage derived from upstream rule behavior.
 */
import type { TSESLint } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/types'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { SortingNodeWithDependencies } from '../../utils/sort-nodes-by-dependencies'

import { computeDependenciesBySortingNode } from '../../utils/compute-dependencies-by-sorting-node'
import { computeDeepScopeReferences } from '../../utils/compute-deep-scope-references'

vi.mock('../../utils/compute-deep-scope-references', () => ({
  computeDeepScopeReferences: vi.fn(),
}))

type TestSortingNode = Pick<
  SortingNodeWithDependencies,
  'dependencyNames' | 'node'
>

describe('compute-dependencies-by-sorting-node', () => {
  let sourceCode = {} as TSESLint.SourceCode
  let computeDeepScopeReferencesMock = vi.mocked(computeDeepScopeReferences)

  beforeEach(() => {
    computeDeepScopeReferencesMock.mockReset()
  })

  it('skips dependency collection when referencing node is ignored', () => {
    let referencingSortingNode = createSortingNode([0, 100])
    let referencedSortingNode = createSortingNode([200, 300])
    let reference = createReference({
      resolvedIdentifiers: [createIdentifier([210, 211])],
      identifier: createIdentifier([10, 11]),
    })

    computeDeepScopeReferencesMock.mockImplementation(node =>
      node === referencingSortingNode.node ? [reference] : [],
    )

    let result = computeDependenciesBySortingNode({
      shouldIgnoreSortingNodeComputer: node => node === referencingSortingNode,
      sortingNodes: [referencingSortingNode, referencedSortingNode],
      sourceCode,
    })

    expect(result.size).toBe(0)
  })

  it('returns no dependencies when identifier is ignored', () => {
    let referencingSortingNode = createSortingNode([0, 100])
    let referencedSortingNode = createSortingNode([200, 300])
    let reference = createReference({
      resolvedIdentifiers: [createIdentifier([210, 211])],
      identifier: createIdentifier([10, 11]),
    })

    computeDeepScopeReferencesMock.mockImplementation(node =>
      node === referencingSortingNode.node ? [reference] : [],
    )

    let result = computeDependenciesBySortingNode({
      sortingNodes: [referencingSortingNode, referencedSortingNode],
      shouldIgnoreIdentifierComputer: () => true,
      sourceCode,
    })

    expect(result.get(referencingSortingNode)).toEqual([])
  })

  it('returns no dependencies when resolved identifier list is empty', () => {
    let referencingSortingNode = createSortingNode([0, 100])
    let referencedSortingNode = createSortingNode([200, 300])
    let reference = createReference({
      identifier: createIdentifier([10, 11]),
      resolvedIdentifiers: [],
    })

    computeDeepScopeReferencesMock.mockImplementation(node =>
      node === referencingSortingNode.node ? [reference] : [],
    )

    let result = computeDependenciesBySortingNode({
      sortingNodes: [referencingSortingNode, referencedSortingNode],
      sourceCode,
    })

    expect(result.get(referencingSortingNode)).toEqual([])
  })

  it('returns no dependencies when referenced node is ignored', () => {
    let referencingSortingNode = createSortingNode([0, 100])
    let referencedSortingNode = createSortingNode([200, 300])
    let reference = createReference({
      resolvedIdentifiers: [createIdentifier([210, 211])],
      identifier: createIdentifier([10, 11]),
    })

    computeDeepScopeReferencesMock.mockImplementation(node =>
      node === referencingSortingNode.node ? [reference] : [],
    )

    let result = computeDependenciesBySortingNode({
      shouldIgnoreSortingNodeComputer: node => node === referencedSortingNode,
      sortingNodes: [referencingSortingNode, referencedSortingNode],
      sourceCode,
    })

    expect(result.get(referencingSortingNode)).toEqual([])
  })
})

function createReference({
  resolvedIdentifiers,
  identifier,
}: {
  resolvedIdentifiers: TSESTree.Identifier[]
  identifier: TSESTree.Identifier
}): TSESLint.Scope.Reference {
  return {
    resolved: {
      identifiers: resolvedIdentifiers,
    },
    identifier,
  } as unknown as TSESLint.Scope.Reference
}

function createIdentifier(range: [number, number]): TSESTree.Identifier {
  return {
    type: 'Identifier',
    name: 'identifier',
    range,
  } as TSESTree.Identifier
}

function createSortingNode(range: [number, number]): TestSortingNode {
  return {
    node: {
      range,
    } as TSESTree.Node,
    dependencyNames: [],
  }
}
