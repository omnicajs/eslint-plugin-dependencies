import type { TSESLint } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/types'

import { describe, expect, it } from 'vitest'

import { getCommentsBefore } from '../../utils/get-comments-before'

describe('get-comments-before', () => {
  it('checks comments before previous token when allowed token is present', () => {
    let node = {
      range: [10, 20],
    } as TSESTree.Node
    let tokenBeforeNode = {
      loc: {
        end: {
          line: 1,
        },
      },
      value: '=',
    } as TSESTree.Token
    let commentBeforeToken = {
      loc: {
        end: {
          line: 3,
        },
      },
      type: 'Line',
    } as TSESTree.Comment
    let tokenBeforeComment = {
      loc: {
        end: {
          line: 2,
        },
      },
    } as TSESTree.Token

    let sourceCode = {
      getTokenBefore: (
        target: TSESTree.Comment | TSESTree.Token | TSESTree.Node,
      ) => {
        if (target === node) {
          return tokenBeforeNode
        }
        if (target === commentBeforeToken) {
          return tokenBeforeComment
        }
        return null
      },
      getCommentsBefore: (target: TSESTree.Token | TSESTree.Node) =>
        target === node ? [] : [commentBeforeToken],
    } as unknown as TSESLint.SourceCode

    expect(
      getCommentsBefore({
        tokenValueToIgnoreBefore: '=',
        sourceCode,
        node,
      }),
    ).toEqual([commentBeforeToken])
  })
})
