/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import type { TSESLint } from '@typescript-eslint/utils'

import { AST_NODE_TYPES } from '@typescript-eslint/utils'

import type { SortImportsNode } from './types'

import { UnreachableCaseError } from '../../utils/unreachable-case-error'

/**
 * Determines whether the given AST node is a side-effect import.
 *
 * @param props - The parameters object.
 * @param props.sourceCode - ESLint source code object for text extraction.
 * @param props.node - The AST node representing an import-like declaration.
 * @returns True if the node is a side-effect import; otherwise, false.
 */
export function isSideEffectImport({
  sourceCode,
  node,
}: {
  sourceCode: TSESLint.SourceCode
  node: SortImportsNode
}): boolean {
  switch (node.type) {
    case AST_NODE_TYPES.TSImportEqualsDeclaration:
    case AST_NODE_TYPES.VariableDeclaration:
      return false
    case AST_NODE_TYPES.ImportDeclaration:
      return (
        node.specifiers.length === 0 &&
        /* Avoid matching on named imports without specifiers */
        !/\}\s*from\s+/u.test(sourceCode.getText(node))
      )
    /* v8 ignore next 2 -- @preserve Exhaustive guard. */
    default:
      throw new UnreachableCaseError(node)
  }
}
