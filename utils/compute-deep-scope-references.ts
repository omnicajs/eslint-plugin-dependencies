/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes: maintained and adapted in this fork; see git history for file-specific modifications.
 */
import type { TSESLint } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/types'

/**
 * Recursively computes all scope references deeply for a given node.
 *
 * @param node - The AST node.
 * @param sourceCode - The source code object.
 * @returns The list of scope references.
 */
export function computeDeepScopeReferences(
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
): TSESLint.Scope.Reference[] {
  return computeScopeReference(sourceCode.getScope(node))

  function computeScopeReference(
    scope: TSESLint.Scope.Scope,
  ): TSESLint.Scope.Reference[] {
    return [
      ...scope.references,
      ...scope.childScopes.flatMap(computeScopeReference),
    ]
  }
}
