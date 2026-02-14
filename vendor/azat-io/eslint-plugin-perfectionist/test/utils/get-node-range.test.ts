import type { TSESLint } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/types'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCommentsBefore } from '../../utils/get-comments-before'
import { getNodeRange } from '../../utils/get-node-range'

vi.mock('../../utils/get-comments-before', () => ({
  getCommentsBefore: vi.fn(),
}))

describe('get-node-range', () => {
  beforeEach(() => {
    vi.mocked(getCommentsBefore).mockReset()
  })

  it('uses parenthesized token range and ignores the highest block comment', () => {
    let node = {
      loc: {
        start: {
          line: 3,
        },
        end: {
          line: 3,
        },
      },
      parent: {
        type: 'ExpressionStatement',
      },
      range: [10, 20],
    } as TSESTree.Node
    let blockComment = {
      loc: {
        start: {
          line: 1,
        },
        end: {
          line: 1,
        },
      },
      value: 'header',
      range: [2, 3],
      type: 'Block',
    } as TSESTree.Comment
    let lineComment = {
      loc: {
        start: {
          line: 2,
        },
        end: {
          line: 2,
        },
      },
      value: 'context',
      range: [4, 5],
      type: 'Line',
    } as TSESTree.Comment

    vi.mocked(getCommentsBefore).mockReturnValue([blockComment, lineComment])

    let openingParen = {
      type: 'Punctuator',
      range: [1, 2],
      value: '(',
    } as TSESTree.Token
    let closingParen = {
      type: 'Punctuator',
      range: [8, 9],
      value: ')',
    } as TSESTree.Token
    let sourceCode = {
      getTokenBefore: (target: TSESTree.Token | TSESTree.Node) => {
        if (target === node) {
          return openingParen
        }
        if (target === openingParen) {
          return null
        }
        return null
      },
      getTokenAfter: (target: TSESTree.Token | TSESTree.Node) => {
        if (target === node) {
          return closingParen
        }
        if (target === closingParen) {
          return null
        }
        return null
      },
    } as unknown as TSESLint.SourceCode

    expect(
      getNodeRange({
        ignoreHighestBlockComment: true,
        sourceCode,
        node,
      }),
    ).toEqual([4, 9])
  })
})
