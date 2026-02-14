/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes: maintained and adapted in this fork; see git history for file-specific modifications.
 */
import type { TSESLint } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/types'

import { AST_NODE_TYPES } from '@typescript-eslint/utils'

import type { SortImportsNode } from './types'

import { UnreachableCaseError } from '../../utils/unreachable-case-error'

export function computeSourceSpecifierName({
  sourceCode,
  node,
}: {
  sourceCode: TSESLint.SourceCode
  node: SortImportsNode
}): string | null {
  switch (node.type) {
    case AST_NODE_TYPES.TSImportEqualsDeclaration:
      return node.id.name
    case AST_NODE_TYPES.VariableDeclaration:
      return computeVariableDeclarationSourceName(node, sourceCode)
    case AST_NODE_TYPES.ImportDeclaration:
      return computeImportDeclarationSourceName(node)
    /* v8 ignore next 2 -- @preserve Exhaustive guard. */
    default:
      throw new UnreachableCaseError(node)
  }
}

export function computeSpecifierName({
  sourceCode,
  node,
}: {
  sourceCode: TSESLint.SourceCode
  node: SortImportsNode
}): string | null {
  switch (node.type) {
    case AST_NODE_TYPES.TSImportEqualsDeclaration:
      return node.id.name
    case AST_NODE_TYPES.VariableDeclaration:
      return computeVariableDeclarationAliasName(node, sourceCode)
    case AST_NODE_TYPES.ImportDeclaration:
      return computeImportDeclarationAliasName(node)
    /* v8 ignore next 2 -- @preserve Exhaustive guard. */
    default:
      throw new UnreachableCaseError(node)
  }
}

function computeVariableDeclarationAliasName(
  node: TSESTree.VariableDeclaration,
  sourceCode: TSESLint.SourceCode,
): string | null {
  let [declaration] = node.declarations

  switch (declaration.id.type) {
    case AST_NODE_TYPES.ObjectPattern:
      return computeObjectPatternPropertyName(declaration.id.properties[0])
    case AST_NODE_TYPES.ArrayPattern:
      if (!declaration.id.elements[0]) {
        return null
      }
      return sourceCode.getText(declaration.id.elements[0])
    case AST_NODE_TYPES.Identifier:
      return declaration.id.name
    /* v8 ignore next 2 -- @preserve Exhaustive guard. */
    default:
      throw new UnreachableCaseError(declaration.id)
  }

  function computeObjectPatternPropertyName(
    property: TSESTree.RestElement | TSESTree.Property | undefined,
  ): string | null {
    if (!property) {
      return null
    }
    switch (property.type) {
      case AST_NODE_TYPES.RestElement:
        return sourceCode.getText(property.argument)
      case AST_NODE_TYPES.Property:
        return sourceCode.getText(property.value)
      /* v8 ignore next 2 -- @preserve Exhaustive guard. */
      default:
        throw new UnreachableCaseError(property)
    }
  }
}

function computeObjectPatternPropertySourceName(
  property: TSESTree.RestElement | TSESTree.Property | undefined,
): string | null {
  if (!property) {
    return null
  }
  switch (property.type) {
    case AST_NODE_TYPES.RestElement:
      return null
    case AST_NODE_TYPES.Property:
      if (property.key.type === AST_NODE_TYPES.Identifier) {
        return property.key.name
      }
      if (property.key.type === AST_NODE_TYPES.Literal) {
        return `${property.key.value}`
      }
      return null
    /* v8 ignore next 2 -- @preserve Exhaustive guard. */
    default:
      throw new UnreachableCaseError(property)
  }
}

function computeVariableDeclarationSourceName(
  node: TSESTree.VariableDeclaration,
  sourceCode: TSESLint.SourceCode,
): string | null {
  let [declaration] = node.declarations

  switch (declaration.id.type) {
    case AST_NODE_TYPES.ObjectPattern:
      return computeObjectPatternPropertySourceName(declaration.id.properties[0])
    case AST_NODE_TYPES.ArrayPattern:
    case AST_NODE_TYPES.Identifier:
      return computeVariableDeclarationAliasName(node, sourceCode)
    /* v8 ignore next 2 -- @preserve Exhaustive guard. */
    default:
      throw new UnreachableCaseError(declaration.id)
  }
}

function computeImportDeclarationAliasName(
  node: TSESTree.ImportDeclaration,
): string | null {
  let [specifier] = node.specifiers
  if (!specifier) {
    return null
  }

  switch (specifier.type) {
    case AST_NODE_TYPES.ImportNamespaceSpecifier:
      return specifier.local.name
    case AST_NODE_TYPES.ImportDefaultSpecifier:
      return specifier.local.name
    case AST_NODE_TYPES.ImportSpecifier:
      return specifier.local.name
    /* v8 ignore next 2 -- @preserve Exhaustive guard. */
    default:
      throw new UnreachableCaseError(specifier)
  }
}

function computeImportDeclarationSourceName(
  node: TSESTree.ImportDeclaration,
): string | null {
  let [specifier] = node.specifiers
  if (!specifier) {
    return null
  }

  switch (specifier.type) {
    case AST_NODE_TYPES.ImportNamespaceSpecifier:
    case AST_NODE_TYPES.ImportDefaultSpecifier:
      return specifier.local.name
    case AST_NODE_TYPES.ImportSpecifier:
      return getImportSpecifierImportedName(specifier)
    /* v8 ignore next 2 -- @preserve Exhaustive guard. */
    default:
      throw new UnreachableCaseError(specifier)
  }
}

function getImportSpecifierImportedName(
  specifier: TSESTree.ImportSpecifier,
): string {
  if (specifier.imported.type === AST_NODE_TYPES.Identifier) {
    return specifier.imported.name
  }
  return specifier.imported.value
}
