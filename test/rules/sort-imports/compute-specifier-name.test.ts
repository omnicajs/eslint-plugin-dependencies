/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 707b2c4cf694a84dac45eaf9a885edf69522ca2a License: MIT Local changes: fork-native test coverage derived from upstream rule behavior.
 */
import type { TSESTree } from '@typescript-eslint/types'
import type { TSESLint } from '@typescript-eslint/utils'

import typescriptParser from '@typescript-eslint/parser'
import { describe, expect, it } from 'vitest'

import { computeSourceSpecifierName } from '../../../rules/sort-imports/compute-specifier-name'

describe('compute-specifier-name', () => {
  let sourceCodeStub = {
    getText: () => '',
  } as unknown as TSESLint.SourceCode

  it('reads source name from literal key in require object pattern', () => {
    let node = parseFirstNode(
      "const { 'quoted': localName } = require('pkg')",
    ) as TSESTree.VariableDeclaration

    let result = computeSourceSpecifierName({
      sourceCode: sourceCodeStub,
      node,
    })

    expect(result).toBe('quoted')
  })

  it('returns null for computed key in require object pattern', () => {
    let node = parseFirstNode(
      "const { [factory()]: localName } = require('pkg')",
    ) as TSESTree.VariableDeclaration

    let result = computeSourceSpecifierName({
      sourceCode: sourceCodeStub,
      node,
    })

    expect(result).toBeNull()
  })

  it('reads source name from literal import specifier', () => {
    let node = parseFirstNode(
      "import { 'quoted' as localName } from 'pkg'",
    ) as TSESTree.ImportDeclaration

    let result = computeSourceSpecifierName({
      sourceCode: sourceCodeStub,
      node,
    })

    expect(result).toBe('quoted')
  })
})

function parseFirstNode(code: string): TSESTree.Node {
  let program = typescriptParser.parse(code, {
    sourceType: 'module',
  })

  return program.body[0] as TSESTree.Node
}
