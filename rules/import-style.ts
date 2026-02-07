import type { TSESTree } from '@typescript-eslint/types'

import { AST_NODE_TYPES } from '@typescript-eslint/utils'

import { createEslintRule } from '../utils/create-eslint-rule'

export type Options = [
  {
    maxSingleLineSpecifiers?: number
    maxSingleLineLength?: number
    singleLineSpacing?: boolean
    forceSingleLine?: boolean
  },
]

type MessageId = 'formatImport'

let defaultOptions: Required<Options[number]> = {
  maxSingleLineSpecifiers: 3,
  maxSingleLineLength: 120,
  singleLineSpacing: true,
  forceSingleLine: true,
}

export default createEslintRule<Options, MessageId>({
  create: context => ({
    ImportDeclaration: node => {
      let { sourceCode } = context
      let namedSpecifiers = node.specifiers.filter(
        (specifier): specifier is TSESTree.ImportSpecifier =>
          specifier.type === AST_NODE_TYPES.ImportSpecifier,
      )
      if (namedSpecifiers.length === 0) {
        return
      }

      let options = { ...defaultOptions, ...context.options[0] }
      if (!options.forceSingleLine) {
        return
      }

      if (hasCommentsInNamedBlock(node, sourceCode)) {
        return
      }

      let defaultSpecifier = node.specifiers.find(
        specifier => specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier,
      )
      let totalSpecifiers =
        namedSpecifiers.length + (defaultSpecifier ? 1 : 0)

      if (totalSpecifiers > options.maxSingleLineSpecifiers) {
        return
      }

      let sourceText = sourceCode.getText(node.source)
      let suffixText = sourceCode.text.slice(
        node.source.range[1],
        node.range[1],
      )
      let indentation = getImportIndentation(node, sourceCode)
      let { importKind } = node
      let singleLineNamedText = buildSingleLineNamedText(
        namedSpecifiers,
        sourceCode,
      )

      let singleLineImportText = buildImportDeclarationText({
        defaultText: defaultSpecifier ? sourceCode.getText(defaultSpecifier) : null,
        singleLineSpacing: options.singleLineSpacing,
        namedText: singleLineNamedText,
        importKind,
        suffixText,
        sourceText,
      })

      if (
        indentation.length + singleLineImportText.length >
        options.maxSingleLineLength
      ) {
        return
      }

      let currentText = sourceCode.getText(node)
      if (currentText === singleLineImportText) {
        return
      }

      context.report({
        fix: fixer => fixer.replaceText(node, singleLineImportText),
        messageId: 'formatImport',
        node,
      })
    },
  }),
  meta: {
    schema: {
      items: {
        properties: {
          maxSingleLineSpecifiers: {
            description:
              'Maximum number of specifiers allowed for a single-line import.',
            type: 'number',
          },
          forceSingleLine: {
            description:
              'Controls whether multi-line imports are collapsed into single lines.',
            type: 'boolean',
          },
          maxSingleLineLength: {
            description:
              'Maximum line length allowed for a single-line import.',
            type: 'number',
          },
          singleLineSpacing: {
            description: 'Controls spacing inside braces for single-line imports.',
            type: 'boolean',
          },
        },
        additionalProperties: false,
        type: 'object',
      },
      uniqueItems: true,
      type: 'array',
    },
    docs: {
      description: 'Enforce consistent formatting for import declarations.',
      recommended: false,
    },
    messages: {
      formatImport: 'Format import declaration according to style rules.',
    },
    fixable: 'code',
    type: 'layout',
  },
  defaultOptions: [defaultOptions],
  name: 'import-style',
})

type TSESLintSourceCode = Readonly<{
  getText(node: TSESTree.Node): string
  text: string
}>

function buildImportDeclarationText({
  singleLineSpacing = true,
  defaultText,
  suffixText,
  importKind,
  sourceText,
  namedText,
}: {
  importKind: 'value' | 'type'
  defaultText?: string | null
  singleLineSpacing?: boolean
  suffixText: string
  sourceText: string
  namedText: string
}): string {
  let namedClause = singleLineSpacing ? `{ ${namedText} }` : `{${namedText}}`

  let importClauseParts = [defaultText ?? null, namedClause].filter(Boolean)

  let importClause = importClauseParts.join(', ')
  let importKeyword = importKind === 'type' ? 'import type' : 'import'

  return `${importKeyword} ${importClause} from ${sourceText}${suffixText}`
}

function hasCommentsInNamedBlock(
  node: TSESTree.ImportDeclaration,
  sourceCode: TSESLintSourceCode,
): boolean {
  let text = sourceCode.getText(node)
  let openIndex = text.indexOf('{')
  /* v8 ignore next -- @preserve Named imports always include braces in valid syntax. */
  if (openIndex === -1) {
    return false
  }
  let closeIndex = text.indexOf('}', openIndex + 1)
  /* v8 ignore next -- @preserve Named imports always include a closing brace in valid syntax. */
  if (closeIndex === -1) {
    return false
  }
  let namedBlock = text.slice(openIndex + 1, closeIndex)
  return /\/\*|\/\//u.test(namedBlock)
}

function getImportIndentation(
  node: TSESTree.ImportDeclaration,
  sourceCode: TSESLintSourceCode,
): string {
  let lineStartIndex = sourceCode.text.lastIndexOf('\n', node.range[0] - 1)
  let start = lineStartIndex === -1 ? 0 : lineStartIndex + 1
  return sourceCode.text.slice(start, node.range[0])
}

function buildSingleLineNamedText(
  specifiers: TSESTree.ImportSpecifier[],
  sourceCode: TSESLintSourceCode,
): string {
  return specifiers.map(specifier => sourceCode.getText(specifier)).join(', ')
}
