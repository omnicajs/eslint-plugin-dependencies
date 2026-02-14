/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 37b7de36139fd321dd947dcefceb67b6d780c126 License: MIT Local changes:
 * fork-native test coverage derived from upstream rule behavior.
 */
import type { TSESLint } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/types'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { SortingNode } from '../../types/sorting-node'

import { makeOrderFixes } from '../../utils/make-order-fixes'
import { getNodeRange } from '../../utils/get-node-range'

vi.mock('../../utils/get-node-range', () => ({
  getNodeRange: vi.fn(),
}))

describe('make-order-fixes', () => {
  beforeEach(() => {
    vi.mocked(getNodeRange).mockReset()
  })

  it('passes ignoreHighestBlockComment for both source and target first nodes', () => {
    let firstNode = createSortingNode({
      start: 0,
      end: 10,
      line: 1,
    })
    let secondNode = createSortingNode({
      start: 10,
      end: 20,
      line: 2,
    })
    let nodes = [firstNode, secondNode]
    let sortedNodes = [secondNode, firstNode]

    vi.mocked(getNodeRange).mockImplementation(({ node }) =>
      node === firstNode.node ? [0, 10] : [10, 20],
    )

    let sourceCode = {
      getTokensAfter: () => [],
      getText: () => 'value',
      text: 'firstsecond',
    } as unknown as TSESLint.SourceCode
    let fixer = {
      replaceTextRange: (range, text) =>
        ({
          range,
          text,
        }) as TSESLint.RuleFix,
    } as TSESLint.RuleFixer

    let fixes = makeOrderFixes({
      ignoreFirstNodeHighestBlockComment: true,
      sortedNodes,
      sourceCode,
      fixer,
      nodes,
    })

    expect(fixes).toHaveLength(2)
    expect(vi.mocked(getNodeRange).mock.calls).toHaveLength(4)
    expect(
      vi
        .mocked(getNodeRange)
        .mock.calls.some(
          ([parameters]) =>
            parameters.ignoreHighestBlockComment === true &&
            parameters.node === firstNode.node,
        ),
    ).toBeTruthy()
  })
})

function createSortingNode({
  start,
  line,
  end,
}: {
  start: number
  line: number
  end: number
}): SortingNode {
  return {
    node: {
      loc: {
        start: {
          line,
        },
        end: {
          line,
        },
      },
      range: [start, end],
    } as TSESTree.Node,
    addSafetySemicolonWhenInline: false,
  } as SortingNode
}
