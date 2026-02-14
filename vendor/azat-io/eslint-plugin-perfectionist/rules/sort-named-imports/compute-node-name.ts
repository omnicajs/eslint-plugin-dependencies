/* Authorship: Hugo (https://github.com/hugop95). Source history: https://github.com/azat-io/eslint-plugin-perfectionist/commits/main/rules/sort-named-imports/compute-node-name.ts */
import type { TSESTree } from '@typescript-eslint/types'

import { AST_NODE_TYPES } from '@typescript-eslint/utils'

import { UnreachableCaseError } from '../../utils/unreachable-case-error'

/**
 * Computes the name of an import specifier node.
 *
 * @param node - The import specifier node.
 * @param ignoreAlias - Whether to ignore the alias and use the local name.
 * @returns The computed name of the import specifier.
 */
export function computeNodeName(
  node: TSESTree.ImportSpecifier,
  ignoreAlias: boolean,
): string {
  if (!ignoreAlias) {
    return node.local.name
  }

  switch (node.imported.type) {
    case AST_NODE_TYPES.Identifier:
      return node.imported.name
    case AST_NODE_TYPES.Literal:
      return node.imported.value
    /* v8 ignore next 2 -- @preserve Exhaustive guard. */
    default:
      throw new UnreachableCaseError(node.imported)
  }
}
