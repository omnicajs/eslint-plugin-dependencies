/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import type { TSESTree } from '@typescript-eslint/types'
import type { TSESLint } from '@typescript-eslint/utils'

import { AST_NODE_TYPES } from '@typescript-eslint/utils'

import type {
  SortImportAttributesSortingNode,
  PartitionsOptions,
  Options,
} from './sort-import-attributes/types'

import {
  partitionByCommentJsonSchema,
  partitionByNewLineJsonSchema,
} from '../utils/json-schemas/common-partition-json-schemas'
import {
  MISSED_SPACING_ERROR,
  EXTRA_SPACING_ERROR,
  GROUP_ORDER_ERROR,
  ORDER_ERROR,
} from '../utils/report-errors'
import { validateNewlinesAndPartitionConfiguration } from '../utils/validate-newlines-and-partition-configuration'
import { defaultComparatorByOptionsComputer } from '../utils/compare/default-comparator-by-options-computer'
import { buildOptionsByGroupIndexComputer } from '../utils/build-options-by-group-index-computer'
import { buildCommonGroupsJsonSchemas } from '../utils/json-schemas/common-groups-json-schemas'
import { validateCustomSortConfiguration } from '../utils/validate-custom-sort-configuration'
import { validateGroupsConfiguration } from '../utils/validate-groups-configuration'
import { buildCommonJsonSchemas } from '../utils/json-schemas/common-json-schemas'
import { getEslintDisabledLines } from '../utils/get-eslint-disabled-lines'
import { isNodeEslintDisabled } from '../utils/is-node-eslint-disabled'
import { doesCustomGroupMatch } from '../utils/does-custom-group-match'
import { sortNodesByGroups } from '../utils/sort-nodes-by-groups'
import { createEslintRule } from '../utils/create-eslint-rule'
import { reportAllErrors } from '../utils/report-all-errors'
import { shouldPartition } from '../utils/should-partition'
import { computeGroup } from '../utils/compute-group'
import { rangeToDiff } from '../utils/range-to-diff'
import { getSettings } from '../utils/get-settings'
import { isSortable } from '../utils/is-sortable'
import { complete } from '../utils/complete'

const ORDER_ERROR_ID = 'unexpectedImportAttributesOrder'
const GROUP_ORDER_ERROR_ID = 'unexpectedImportAttributesGroupOrder'
const EXTRA_SPACING_ERROR_ID = 'extraSpacingBetweenImportAttributes'
const MISSED_SPACING_ERROR_ID = 'missedSpacingBetweenImportAttributes'

type MessageId =
  | typeof MISSED_SPACING_ERROR_ID
  | typeof EXTRA_SPACING_ERROR_ID
  | typeof GROUP_ORDER_ERROR_ID
  | typeof ORDER_ERROR_ID

let defaultOptions: Required<Options[0]> = {
  partitions: {
    splitBy: {
      comments: false,
      newlines: false,
    },
  },
  fallbackSort: { type: 'unsorted' },
  newlinesInside: 'newlinesBetween',
  specialCharacters: 'keep',
  newlinesBetween: 'ignore',
  type: 'alphabetical',
  ignoreCase: true,
  customGroups: [],
  locales: 'en-US',
  alphabet: '',
  order: 'asc',
  groups: [],
}

export default createEslintRule<Options, MessageId>({
  create: context => ({
    ImportDeclaration: node => {
      let attributes: TSESTree.ImportAttribute[] | undefined = node.attributes
      if (!isSortable(attributes)) {
        return
      }

      let { sourceCode, id } = context
      let settings = getSettings(context.settings)
      let options = complete(context.options.at(0), settings, defaultOptions)
      let partitionSplitByOptions = getPartitionSplitByOptions(
        options.partitions,
      )
      validateCustomSortConfiguration(options)
      validateGroupsConfiguration({
        selectors: [],
        modifiers: [],
        options,
      })
      validateNewlinesAndPartitionConfiguration({
        ...options,
        partitionByNewLine: partitionSplitByOptions.newlines,
      })

      let eslintDisabledLines = getEslintDisabledLines({
        ruleName: id,
        sourceCode,
      })
      let optionsByGroupIndexComputer =
        buildOptionsByGroupIndexComputer(options)

      let formattedMembers: SortImportAttributesSortingNode[][] = [[]]
      for (let attribute of attributes) {
        let name = getAttributeName(attribute, sourceCode)

        let group = computeGroup({
          customGroupMatcher: customGroup =>
            doesCustomGroupMatch({
              elementName: name,
              selectors: [],
              modifiers: [],
              customGroup,
            }),
          predefinedGroups: [],
          options,
        })

        let sortingNode: Omit<SortImportAttributesSortingNode, 'partitionId'> =
          {
            isEslintDisabled: isNodeEslintDisabled(
              attribute,
              eslintDisabledLines,
            ),
            size: rangeToDiff(attribute, sourceCode),
            node: attribute,
            group,
            name,
          }

        let lastSortingNode = formattedMembers.at(-1)?.at(-1)
        if (
          shouldPartition({
            options: {
              partitionByComment: partitionSplitByOptions.comments,
              partitionByNewLine: partitionSplitByOptions.newlines,
            },
            lastSortingNode,
            sortingNode,
            sourceCode,
          })
        ) {
          formattedMembers.push([])
        }

        formattedMembers.at(-1)!.push({
          ...sortingNode,
          partitionId: formattedMembers.length,
        })
      }

      for (let nodes of formattedMembers) {
        function createSortNodesExcludingEslintDisabled(
          sortingNodes: SortImportAttributesSortingNode[],
        ) {
          return function (
            ignoreEslintDisabledNodes: boolean,
          ): SortImportAttributesSortingNode[] {
            return sortNodesByGroups({
              comparatorByOptionsComputer: defaultComparatorByOptionsComputer,
              optionsByGroupIndexComputer,
              ignoreEslintDisabledNodes,
              groups: options.groups,
              nodes: sortingNodes,
            })
          }
        }

        reportAllErrors<MessageId>({
          availableMessageIds: {
            missedSpacingBetweenMembers: MISSED_SPACING_ERROR_ID,
            extraSpacingBetweenMembers: EXTRA_SPACING_ERROR_ID,
            unexpectedGroupOrder: GROUP_ORDER_ERROR_ID,
            unexpectedOrder: ORDER_ERROR_ID,
          },
          options: {
            ...options,
            partitionByComment: partitionSplitByOptions.comments,
          },
          sortNodesExcludingEslintDisabled:
            createSortNodesExcludingEslintDisabled(nodes),
          context,
          nodes,
        })
      }
    },
  }),
  meta: {
    schema: {
      items: {
        properties: {
          ...buildCommonJsonSchemas(),
          ...buildCommonGroupsJsonSchemas(),
          partitions: {
            oneOf: [
              {
                enum: ['merge'],
                type: 'string',
              },
              {
                properties: {
                  splitBy: {
                    properties: {
                      comments: partitionByCommentJsonSchema,
                      newlines: partitionByNewLineJsonSchema,
                    },
                    additionalProperties: false,
                    type: 'object',
                  },
                },
                additionalProperties: false,
                type: 'object',
              },
            ],
          },
        },
        additionalProperties: false,
        type: 'object',
      },
      uniqueItems: true,
      type: 'array',
    },
    messages: {
      [MISSED_SPACING_ERROR_ID]: MISSED_SPACING_ERROR,
      [EXTRA_SPACING_ERROR_ID]: EXTRA_SPACING_ERROR,
      [GROUP_ORDER_ERROR_ID]: GROUP_ORDER_ERROR,
      [ORDER_ERROR_ID]: ORDER_ERROR,
    },
    docs: {
      url: 'https://dependencies.omnicajs.dev/rules/sort-import-attributes',
      description: 'Enforce sorted import attributes.',
      recommended: true,
    },
    type: 'suggestion',
    fixable: 'code',
  },
  defaultOptions: [defaultOptions],
  name: 'sort-import-attributes',
})

/**
 * Extracts the name of an import attribute for sorting purposes.
 *
 * For identifier keys, returns the identifier name. For literal keys, returns
 * the string value. Falls back to source code text if needed.
 *
 * @param attribute - The import attribute AST node.
 * @param sourceCode - The ESLint source code object.
 * @returns The attribute name to use for sorting.
 */
function getAttributeName(
  attribute: TSESTree.ImportAttribute,
  sourceCode: TSESLint.SourceCode,
): string {
  let { key } = attribute
  if (key.type === AST_NODE_TYPES.Identifier) {
    return key.name
  }
  return key.value?.toString() ?? sourceCode.getText(attribute)
}

function getPartitionSplitByOptions(
  partitions: Required<Options[number]>['partitions'],
): PartitionsOptions['splitBy'] {
  if (partitions === 'merge') {
    return {
      comments: false,
      newlines: false,
    }
  }

  return partitions.splitBy
}
