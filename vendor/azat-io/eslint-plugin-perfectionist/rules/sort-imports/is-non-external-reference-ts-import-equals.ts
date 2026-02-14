/* Authorship: Hugo (https://github.com/hugop95). Source history: https://github.com/azat-io/eslint-plugin-perfectionist/commits/main/rules/sort-imports/is-non-external-reference-ts-import-equals.ts */
import type { TSESTree } from '@typescript-eslint/types'

import { AST_NODE_TYPES } from '@typescript-eslint/utils'

import type { SortImportsNode } from './types'

/**
 * Determines whether the given AST node is a non-external-reference TS import
 * equals declaration.
 *
 * @param node - The AST node representing an import-like declaration.
 * @returns True if the node is a non-external-reference TS import equals
 *   declaration; otherwise, false.
 */
export function isNonExternalReferenceTsImportEquals(
  node: SortImportsNode,
): node is TSESTree.TSImportEqualsDeclaration {
  if (node.type !== AST_NODE_TYPES.TSImportEqualsDeclaration) {
    return false
  }

  return node.moduleReference.type !== AST_NODE_TYPES.TSExternalModuleReference
}
