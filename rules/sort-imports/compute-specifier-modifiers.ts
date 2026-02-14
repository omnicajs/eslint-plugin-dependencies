/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes: maintained and adapted in this fork; see git history for file-specific modifications.
 */
import type { TSESTree } from '@typescript-eslint/types'

import { AST_NODE_TYPES } from '@typescript-eslint/utils'

import type { SortImportsNode } from './types'

type Modifier = 'wildcard' | 'default' | 'named'

/**
 * Computes the specifier modifiers of an import-like AST node.
 *
 * @param node - The AST node representing an import-like declaration.
 * @returns A list of specifier modifiers.
 */
export function computeSpecifierModifiers(node: SortImportsNode): Modifier[] {
  if (node.type !== AST_NODE_TYPES.ImportDeclaration) {
    return []
  }

  return computeImportDeclarationModifiers(node)
}

function computeImportDeclarationModifiers(
  node: TSESTree.ImportDeclaration,
): Modifier[] {
  let importClauses = node.specifiers

  return [
    ...(hasSpecifier(importClauses, AST_NODE_TYPES.ImportDefaultSpecifier) ?
      ['default' as const]
    : []),
    ...(hasSpecifier(importClauses, AST_NODE_TYPES.ImportNamespaceSpecifier) ?
      ['wildcard' as const]
    : []),
    ...(hasSpecifier(importClauses, AST_NODE_TYPES.ImportSpecifier) ?
      ['named' as const]
    : []),
  ]
}

function hasSpecifier(
  importClauses: TSESTree.ImportClause[],
  specifier:
    | AST_NODE_TYPES.ImportNamespaceSpecifier
    | AST_NODE_TYPES.ImportDefaultSpecifier
    | AST_NODE_TYPES.ImportSpecifier,
): boolean {
  return importClauses.some(importClause => importClause.type === specifier)
}
