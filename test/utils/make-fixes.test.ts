/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 37b7de36139fd321dd947dcefceb67b6d780c126 License: MIT Local changes: fork-native test coverage derived from upstream rule behavior.
 */
import type { TSESLint } from '@typescript-eslint/utils'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { makeNewlinesBetweenFixes } from '../../utils/make-newlines-between-fixes'
import { makeCommentAboveFixes } from '../../utils/make-comment-above-fixes'
import { makeCommentAfterFixes } from '../../utils/make-comment-after-fixes'
import { makeOrderFixes } from '../../utils/make-order-fixes'
import { makeFixes } from '../../utils/make-fixes'

vi.mock('../../utils/make-order-fixes', () => ({
  makeOrderFixes: vi.fn(),
}))
vi.mock('../../utils/make-comment-after-fixes', () => ({
  makeCommentAfterFixes: vi.fn(),
}))
vi.mock('../../utils/make-newlines-between-fixes', () => ({
  makeNewlinesBetweenFixes: vi.fn(),
}))
vi.mock('../../utils/make-comment-above-fixes', () => ({
  makeCommentAboveFixes: vi.fn(),
}))

describe('make-fixes', () => {
  beforeEach(() => {
    vi.mocked(makeOrderFixes).mockReset()
    vi.mocked(makeCommentAfterFixes).mockReset()
    vi.mocked(makeNewlinesBetweenFixes).mockReset()
    vi.mocked(makeCommentAboveFixes).mockReset()
  })

  it('returns order fixes without computing newlines when groups are missing', () => {
    let orderFix = {
      range: [0, 1],
      text: 'a',
    } as unknown as TSESLint.RuleFix

    vi.mocked(makeOrderFixes).mockReturnValue([orderFix])
    vi.mocked(makeCommentAfterFixes).mockReturnValue([])

    let result = makeFixes({
      sourceCode: {} as TSESLint.SourceCode,
      fixer: {} as TSESLint.RuleFixer,
      hasCommentAboveMissing: true,
      sortedNodes: [],
      nodes: [],
    })

    expect(result).toEqual([orderFix])
    expect(makeNewlinesBetweenFixes).not.toHaveBeenCalled()
    expect(makeCommentAboveFixes).not.toHaveBeenCalled()
  })
})
