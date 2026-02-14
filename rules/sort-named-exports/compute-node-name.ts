/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import type { TSESTree } from '@typescript-eslint/types'

import { AST_NODE_TYPES } from '@typescript-eslint/utils'

import { UnreachableCaseError } from '../../utils/unreachable-case-error'

/**
 * Computes the name of an export specifier node.
 *
 * @param node - The export specifier node.
 * @param ignoreAlias - Whether to ignore the alias and use the local name.
 * @returns The computed name of the export specifier.
 */
export function computeNodeName(
  node: TSESTree.ExportSpecifier,
  ignoreAlias: boolean,
): string {
  let identifierToCheck = ignoreAlias ? node.local : node.exported

  switch (identifierToCheck.type) {
    case AST_NODE_TYPES.Identifier:
      return identifierToCheck.name
    case AST_NODE_TYPES.Literal:
      return identifierToCheck.value
    /* v8 ignore next 2 -- @preserve Exhaustive guard. */
    default:
      throw new UnreachableCaseError(identifierToCheck)
  }
}
