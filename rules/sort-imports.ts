/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes: fork
 * migration, vNext imports/partitions contract, casingPriority pre-sort, and
 * related validation updates.
 */
import type { TSESLint } from '@typescript-eslint/utils'
import type { TSESTree } from '@typescript-eslint/types'

import { AST_NODE_TYPES } from '@typescript-eslint/utils'

import type {
  SortImportsSortingNode,
  PartitionsOptions,
  ImportsOptions,
  Modifier,
  Selector,
  Options,
} from './sort-imports/types'
import type { PartitionByCommentOption } from '../types/common-partition-options'
import type { NewlinesInsideOption } from '../types/common-groups-options'
import type { CustomOrderFixesParameters } from '../utils/make-fixes'

import {
  additionalCustomGroupMatchOptionsJsonSchema,
  partitionsOrderStabilityJsonSchema,
  importsCasingPriorityJsonSchema,
  TYPE_IMPORT_FIRST_TYPE_OPTION,
  partitionsOrderByJsonSchema,
  importsOrderByJsonSchema,
  allModifiers,
  allSelectors,
} from './sort-imports/types'
import {
  MISSED_COMMENT_ABOVE_ERROR,
  DEPENDENCY_ORDER_ERROR,
  MISSED_SPACING_ERROR,
  EXTRA_SPACING_ERROR,
  GROUP_ORDER_ERROR,
  ORDER_ERROR,
} from '../utils/report-errors'
import {
  useExperimentalDependencyDetectionJsonSchema,
  buildCommonJsonSchemas,
  buildRegexJsonSchema,
} from '../utils/json-schemas/common-json-schemas'
import {
  partitionByCommentJsonSchema,
  partitionByNewLineJsonSchema,
} from '../utils/json-schemas/common-partition-json-schemas'
import { isNonExternalReferenceTsImportEquals } from './sort-imports/is-non-external-reference-ts-import-equals'
import {
  computeSourceSpecifierName,
  computeSpecifierName,
} from './sort-imports/compute-specifier-name'
import { validateSideEffectsConfiguration } from './sort-imports/validate-side-effects-configuration'
import { buildOptionsByGroupIndexComputer } from '../utils/build-options-by-group-index-computer'
import { computeDependenciesBySortingNode } from '../utils/compute-dependencies-by-sorting-node'
import { buildCommonGroupsJsonSchemas } from '../utils/json-schemas/common-groups-json-schemas'
import { validateCustomSortConfiguration } from '../utils/validate-custom-sort-configuration'
import { comparatorByOptionsComputer } from './sort-imports/comparator-by-options-computer'
import { readClosestTsConfigByPath } from './sort-imports/read-closest-ts-config-by-path'
import { computeSpecifierModifiers } from './sort-imports/compute-specifier-modifiers'
import { validateGroupsConfiguration } from '../utils/validate-groups-configuration'
import { isGroupWithOverridesOption } from '../utils/is-group-with-overrides-option'
import { getOptionsWithCleanGroups } from '../utils/get-options-with-clean-groups'
import { computeCommonSelectors } from './sort-imports/compute-common-selectors'
import { isSideEffectOnlyGroup } from './sort-imports/is-side-effect-only-group'
import { computeDependencyNames } from './sort-imports/compute-dependency-names'
import { getNewlinesBetweenOption } from '../utils/get-newlines-between-option'
import { generatePredefinedGroups } from '../utils/generate-predefined-groups'
import { sortNodesByDependencies } from '../utils/sort-nodes-by-dependencies'
import { getEslintDisabledLines } from '../utils/get-eslint-disabled-lines'
import { computeDependencies } from './sort-imports/compute-dependencies'
import { isSideEffectImport } from './sort-imports/is-side-effect-import'
import { isNodeEslintDisabled } from '../utils/is-node-eslint-disabled'
import { doesCustomGroupMatch } from '../utils/does-custom-group-match'
import { UnreachableCaseError } from '../utils/unreachable-case-error'
import { isNodeOnSingleLine } from '../utils/is-node-on-single-line'
import { computeNodeName } from './sort-imports/compute-node-name'
import { sortNodesByGroups } from '../utils/sort-nodes-by-groups'
import { createEslintRule } from '../utils/create-eslint-rule'
import { reportAllErrors } from '../utils/report-all-errors'
import { shouldPartition } from '../utils/should-partition'
import { getGroupIndex } from '../utils/get-group-index'
import { getNodeRange } from '../utils/get-node-range'
import { computeGroup } from '../utils/compute-group'
import { rangeToDiff } from '../utils/range-to-diff'
import { getSettings } from '../utils/get-settings'
import { isSortable } from '../utils/is-sortable'
import { complete } from '../utils/complete'

/**
 * Cache computed groups by modifiers and selectors for performance.
 */
let cachedGroupsByModifiersAndSelectors = new Map<string, string[]>()

const ORDER_ERROR_ID = 'unexpectedImportsOrder'
const GROUP_ORDER_ERROR_ID = 'unexpectedImportsGroupOrder'
const EXTRA_SPACING_ERROR_ID = 'extraSpacingBetweenImports'
const MISSED_SPACING_ERROR_ID = 'missedSpacingBetweenImports'
const MISSED_COMMENT_ABOVE_ERROR_ID = 'missedCommentAboveImport'
const DEPENDENCY_ORDER_ERROR_ID = 'unexpectedImportsDependencyOrder'

export type MessageId =
  | typeof MISSED_COMMENT_ABOVE_ERROR_ID
  | typeof DEPENDENCY_ORDER_ERROR_ID
  | typeof MISSED_SPACING_ERROR_ID
  | typeof EXTRA_SPACING_ERROR_ID
  | typeof GROUP_ORDER_ERROR_ID
  | typeof ORDER_ERROR_ID

let defaultOptions: Required<Options[number]> = {
  groups: [
    'type-import',
    ['value-builtin', 'value-external'],
    'type-internal',
    'value-internal',
    ['type-parent', 'type-sibling', 'type-index'],
    ['value-parent', 'value-sibling', 'value-index'],
    'ts-equals-import',
    'unknown',
  ],
  partitions: {
    splitBy: {
      comments: false,
      newlines: false,
    },
    orderStability: 'stable',
    orderBy: 'source',
    maxImports: null,
  },
  imports: {
    splitDeclarations: false,
    sortSideEffects: false,
    maxLineLength: null,
    casingPriority: [],
    orderBy: 'path',
  },
  useExperimentalDependencyDetection: true,
  internalPattern: ['^~/.+', '^@/.+'],
  fallbackSort: { type: 'unsorted' },
  specialCharacters: 'keep',
  tsconfig: { rootDir: '' },
  type: 'alphabetical',
  environment: 'node',
  newlinesBetween: 1,
  newlinesInside: 0,
  customGroups: [],
  ignoreCase: true,
  locales: 'en-US',
  alphabet: '',
  order: 'asc',
}

interface SortImportsSpecifierSortingNode extends SortImportsSortingNode {
  specifierKind?: 'namespace' | 'default' | 'named'
  parentImportNode?: TSESTree.ImportDeclaration
  parentSortingNode: SortImportsSortingNode
  specifier?: TSESTree.ImportClause
}

type SortImportsOptions = {
  partitions: NormalizedPartitionsOptions | 'merge'
  imports: NormalizedImportsOptions
} & Omit<Required<Options[number]>, 'partitions' | 'imports'>

interface PartitionSortingInfo {
  sortedPartitions: PartitionInfo[]
  partitions: PartitionInfo[]
  separatorsBetween: string[]
  regionStart: number
  regionEnd: number
}

interface PartitionInfo {
  nodeSet: Set<SortImportsSortingNode>
  nodes: SortImportsSortingNode[]
  isTypeOnly: boolean
  start: number
  end: number
}

export default createEslintRule<Options, MessageId>({
  create: context => {
    let settings = getSettings(context.settings)

    let userOptions = context.options.at(0)
    let rawOptions = getOptionsWithCleanGroups(
      complete(userOptions, settings, defaultOptions),
    )
    validateSortImportsConfiguration(rawOptions)
    let options = normalizeSortImportsOptions(rawOptions)
    normalizeNewlinesInsideForPartitionPreserve(options)

    validateGroupsConfiguration({
      selectors: allSelectors,
      modifiers: allModifiers,
      options,
    })
    validateCustomSortConfiguration(options)
    validateSideEffectsConfiguration({
      sortSideEffects: options.imports.sortSideEffects,
      groups: options.groups,
    })

    let tsconfigRootDirectory = options.tsconfig.rootDir
    let tsConfigOutput =
      tsconfigRootDirectory ?
        readClosestTsConfigByPath({
          tsconfigFilename: options.tsconfig.filename ?? 'tsconfig.json',
          tsconfigRootDir: tsconfigRootDirectory,
          filePath: context.physicalFilename,
          contextCwd: context.cwd,
        })
      : null

    let { sourceCode, filename, id } = context
    let eslintDisabledLines = getEslintDisabledLines({
      ruleName: id,
      sourceCode,
    })
    let sortingNodesWithoutPartitionId: Omit<
      SortImportsSortingNode,
      'partitionId'
    >[] = []

    let flatGroups = new Set(options.groups.flat())
    let shouldRegroupSideEffectNodes = flatGroups.has('side-effect')
    let shouldRegroupSideEffectStyleNodes = flatGroups.has('side-effect-style')

    function registerNode(
      node:
        | TSESTree.TSImportEqualsDeclaration
        | TSESTree.VariableDeclaration
        | TSESTree.ImportDeclaration,
    ): void {
      let name = computeNodeName({
        sourceCode,
        node,
      })

      let commonSelectors = computeCommonSelectors({
        tsConfigOutput,
        filename,
        options,
        name,
      })

      let selectors: Selector[] = []
      let modifiers: Modifier[] = []
      let group: string | null = null

      if (
        node.type !== AST_NODE_TYPES.VariableDeclaration &&
        node.importKind === 'type'
      ) {
        selectors.push('type')
        modifiers.push('type')
      }

      let isSideEffect = isSideEffectImport({ sourceCode, node })
      let isStyleValue = isStyle(name)
      let isStyleSideEffect = isSideEffect && isStyleValue

      if (!isNonExternalReferenceTsImportEquals(node)) {
        if (isStyleSideEffect) {
          selectors.push('side-effect-style')
        }

        if (isSideEffect) {
          selectors.push('side-effect')
          modifiers.push('side-effect')
        }

        if (isStyleValue) {
          selectors.push('style')
        }

        for (let selector of commonSelectors) {
          selectors.push(selector)
        }
      }
      selectors.push('import')

      if (!modifiers.includes('type')) {
        modifiers.push('value')
      }

      if (node.type === AST_NODE_TYPES.TSImportEqualsDeclaration) {
        modifiers.push('ts-equals')
      }

      if (node.type === AST_NODE_TYPES.VariableDeclaration) {
        modifiers.push('require')
      }

      modifiers.push(...computeSpecifierModifiers(node))

      if (isNodeOnSingleLine(node)) {
        modifiers.push('singleline')
      } else {
        modifiers.push('multiline')
      }

      group ??=
        computeGroupExceptUnknown({
          selectors,
          modifiers,
          options,
          name,
        }) ?? 'unknown'

      let hasMultipleImportDeclarations =
        node.type === AST_NODE_TYPES.ImportDeclaration &&
        isSortable(node.specifiers)
      let size = rangeToDiff(node, sourceCode)
      if (
        hasMultipleImportDeclarations &&
        size > options.imports.maxLineLength
      ) {
        size = name.length + 10
      }
      sortingNodesWithoutPartitionId.push({
        isIgnored:
          !options.imports.sortSideEffects &&
          isSideEffect &&
          !shouldRegroupSideEffectNodes &&
          (!isStyleSideEffect || !shouldRegroupSideEffectStyleNodes),
        dependencies:
          options.useExperimentalDependencyDetection ?
            []
          : computeDependencies(node),
        sourceSpecifierName: computeSourceSpecifierName({ sourceCode, node }),
        isEslintDisabled: isNodeEslintDisabled(node, eslintDisabledLines),
        dependencyNames: computeDependencyNames({ sourceCode, node }),
        specifierName: computeSpecifierName({ sourceCode, node }),
        isTypeImport: modifiers.includes('type'),
        addSafetySemicolonWhenInline: true,
        group,
        size,
        name,
        node,
      })
    }

    return {
      VariableDeclaration: node => {
        if (
          node.declarations[0].init?.type === AST_NODE_TYPES.CallExpression &&
          node.declarations[0].init.callee.type === AST_NODE_TYPES.Identifier &&
          node.declarations[0].init.callee.name === 'require' &&
          node.declarations[0].init.arguments[0]?.type ===
            AST_NODE_TYPES.Literal
        ) {
          registerNode(node)
        }
      },
      'Program:exit': () => {
        sortImportNodes({
          sortingNodesWithoutPartitionId,
          context,
          options,
        })
      },
      TSImportEqualsDeclaration: registerNode,
      ImportDeclaration: registerNode,
    }
  },
  meta: {
    schema: {
      items: {
        properties: {
          ...buildCommonJsonSchemas({
            allowedAdditionalTypeValues: [TYPE_IMPORT_FIRST_TYPE_OPTION],
          }),
          ...buildCommonGroupsJsonSchemas({
            additionalCustomGroupMatchProperties:
              additionalCustomGroupMatchOptionsJsonSchema,
            allowedAdditionalTypeValues: [TYPE_IMPORT_FIRST_TYPE_OPTION],
          }),
          partitions: {
            oneOf: [
              {
                enum: ['merge'],
                type: 'string',
              },
              {
                properties: {
                  maxImports: {
                    oneOf: [
                      {
                        type: 'integer',
                        minimum: 1,
                      },
                      {
                        type: 'null',
                      },
                    ],
                  },
                  splitBy: {
                    properties: {
                      comments: partitionByCommentJsonSchema,
                      newlines: partitionByNewLineJsonSchema,
                    },
                    additionalProperties: false,
                    type: 'object',
                  },
                  orderStability: partitionsOrderStabilityJsonSchema,
                  orderBy: partitionsOrderByJsonSchema,
                },
                additionalProperties: false,
                type: 'object',
              },
            ],
            description: 'vNext partition configuration.',
          },
          imports: {
            properties: {
              maxLineLength: {
                oneOf: [
                  {
                    type: 'integer',
                    minimum: 1,
                  },
                  {
                    type: 'null',
                  },
                ],
              },
              splitDeclarations: {
                type: 'boolean',
              },
              sortSideEffects: {
                type: 'boolean',
              },
              casingPriority: importsCasingPriorityJsonSchema,
              orderBy: importsOrderByJsonSchema,
            },
            description: 'vNext import sorting configuration.',
            additionalProperties: false,
            type: 'object',
          },
          tsconfig: {
            properties: {
              rootDir: {
                description: 'Specifies the tsConfig root directory.',
                type: 'string',
              },
              filename: {
                description: 'Specifies the tsConfig filename.',
                type: 'string',
              },
            },
            additionalProperties: false,
            required: ['rootDir'],
            type: 'object',
          },
          environment: {
            description: 'Specifies the environment.',
            enum: ['node', 'bun'],
            type: 'string',
          },
          useExperimentalDependencyDetection:
            useExperimentalDependencyDetectionJsonSchema,
          internalPattern: buildRegexJsonSchema(),
        },
        additionalProperties: false,
        type: 'object',
      },
      uniqueItems: true,
      type: 'array',
    },
    messages: {
      [MISSED_COMMENT_ABOVE_ERROR_ID]: MISSED_COMMENT_ABOVE_ERROR,
      [DEPENDENCY_ORDER_ERROR_ID]: DEPENDENCY_ORDER_ERROR,
      [MISSED_SPACING_ERROR_ID]: MISSED_SPACING_ERROR,
      [EXTRA_SPACING_ERROR_ID]: EXTRA_SPACING_ERROR,
      [GROUP_ORDER_ERROR_ID]: GROUP_ORDER_ERROR,
      [ORDER_ERROR_ID]: ORDER_ERROR,
    },
    docs: {
      url: 'https://dependencies.omnicajs.dev/rules/sort-imports',
      description: 'Enforce sorted imports.',
      recommended: true,
    },
    type: 'suggestion',
    fixable: 'code',
  },
  defaultOptions: [defaultOptions],
  name: 'sort-imports',
})

type NormalizedImportsOptions = Omit<ImportsOptions, 'maxLineLength'> & {
  maxLineLength: number
}

type NormalizedPartitionsOptions = Omit<PartitionsOptions, 'maxImports'> & {
  maxImports: number
}

function sortImportNodes({
  sortingNodesWithoutPartitionId,
  options,
  context,
}: {
  sortingNodesWithoutPartitionId: Omit<SortImportsSortingNode, 'partitionId'>[]
  context: Readonly<TSESLint.RuleContext<MessageId, Options>>
  options: SortImportsOptions
}): void {
  let { sourceCode } = context
  let optionsByGroupIndexComputer = buildOptionsByGroupIndexComputer(options)

  let contentSeparatedSortingNodeGroups: Omit<
    SortImportsSortingNode,
    'partitionId'
  >[][] = [[]]
  for (let sortingNodeWithoutPartitionId of sortingNodesWithoutPartitionId) {
    let lastGroup = contentSeparatedSortingNodeGroups.at(-1)!
    let lastSortingNode = lastGroup.at(-1)

    if (
      lastSortingNode &&
      hasContentBetweenNodes(lastSortingNode, sortingNodeWithoutPartitionId)
    ) {
      lastGroup = []
      contentSeparatedSortingNodeGroups.push(lastGroup)
    }

    lastGroup.push(sortingNodeWithoutPartitionId)
  }

  for (let [
    contentGroupIndex,
    contentSeparatedSortingNodeGroup,
  ] of contentSeparatedSortingNodeGroups.entries()) {
    let sortingNodes: SortImportsSortingNode[] =
      contentSeparatedSortingNodeGroup.map(node => ({
        ...node,
        partitionId: contentGroupIndex + 1,
      }))
    let {
      partitionsInSortedOrder,
      partitionsInSourceOrder,
      partitionKeyByNode,
    } = buildPartitionGroups({
      nodes: sortingNodes,
      sourceCode,
      options,
    })

    if (options.useExperimentalDependencyDetection) {
      let dependenciesBySortingNode = computeDependenciesBySortingNode({
        sortingNodes,
        sourceCode,
      })
      for (let sortingNode of sortingNodes) {
        sortingNode.dependencies =
          dependenciesBySortingNode
            .get(sortingNode)
            ?.flatMap(({ dependencyNames }) => dependencyNames) ?? []
      }
    }

    let expandedSortingNodeGroupsSource =
      options.imports.splitDeclarations ?
        partitionsInSourceOrder.map(nodes =>
          expandSortingNodesBySpecifier({
            sourceCode,
            options,
            nodes,
          }),
        )
      : (partitionsInSourceOrder as SortImportsSpecifierSortingNode[][])
    let expandedGroupsByPartition = new Map<
      SortImportsSortingNode[],
      SortImportsSpecifierSortingNode[]
    >(
      partitionsInSourceOrder.map((partition, index) => [
        partition,
        expandedSortingNodeGroupsSource[index]!,
      ]),
    )
    let expandedSortingNodeGroupsForSorting = partitionsInSortedOrder.map(
      partition => expandedGroupsByPartition.get(partition)!,
    )

    let expandedSortingNodes =
      options.imports.splitDeclarations ?
        expandedSortingNodeGroupsSource.flat()
      : (sortingNodes as SortImportsSpecifierSortingNode[])
    let usesSpecifierSorting =
      options.imports.splitDeclarations &&
      expandedSortingNodes.some(node => node.specifier)

    let partitionOrderInfo =
      (
        (usesSpecifierSorting || shouldSortPartitions(options)) &&
        partitionsInSourceOrder.length > 0
      ) ?
        buildPartitionOrderInfo({
          sortedPartitions: partitionsInSortedOrder,
          partitions: partitionsInSourceOrder,
          sourceCode,
          options,
        })
      : null

    let sortedNodesForIgnore =
      usesSpecifierSorting ?
        createSortNodesExcludingEslintDisabled(
          expandedSortingNodeGroupsForSorting,
        )(false)
      : null
    let sortedNodeIndexForIgnore =
      sortedNodesForIgnore ?
        new Map(sortedNodesForIgnore.map((node, index) => [node, index]))
      : null

    let partitionOrderFixes =
      shouldSortPartitions(options) && partitionOrderInfo ?
        createPartitionOrderFixes({
          partitionSortingInfo: partitionOrderInfo,
          sourceCode,
          options,
        })
      : undefined

    let shouldPartitionNewlinesInside =
      isPartitionByNewLineEnabled(options) ||
      Boolean(getPartitionByCommentOption(options)) ||
      getPartitionMaxImports(options) !== Infinity

    function newlinesBetweenValueGetter({
      computedNewlinesBetween,
      right,
      left,
    }: {
      computedNewlinesBetween: ReturnType<typeof getNewlinesBetweenOption>
      right: SortImportsSpecifierSortingNode
      left: SortImportsSpecifierSortingNode
    }): ReturnType<typeof getNewlinesBetweenOption> {
      if (computedNewlinesBetween === 'ignore') {
        return 'ignore'
      }
      if (
        usesSpecifierSorting &&
        left.parentSortingNode === right.parentSortingNode
      ) {
        return 'ignore'
      }

      let leftGroupNode = usesSpecifierSorting ? left.parentSortingNode : left
      let rightGroupNode =
        usesSpecifierSorting ? right.parentSortingNode : right
      let leftGroupIndex = getGroupIndex(options.groups, leftGroupNode)
      let rightGroupIndex = getGroupIndex(options.groups, rightGroupNode)
      if (leftGroupIndex !== rightGroupIndex) {
        return computedNewlinesBetween
      }

      if (shouldPartitionNewlinesInside && options.partitions !== 'merge') {
        let leftPartitionKey = partitionKeyByNode.get(leftGroupNode)
        let rightPartitionKey = partitionKeyByNode.get(rightGroupNode)
        if (
          leftPartitionKey !== undefined &&
          leftPartitionKey === rightPartitionKey
        ) {
          return 'ignore'
        }

        if (
          leftPartitionKey !== undefined &&
          rightPartitionKey !== undefined &&
          (isPartitionByNewLineEnabled(options) ||
            Boolean(getPartitionByCommentOption(options)))
        ) {
          return 'ignore'
        }
      }

      return computedNewlinesBetween
    }

    reportAllErrors<MessageId, SortImportsSpecifierSortingNode>({
      availableMessageIds: {
        unexpectedDependencyOrder: DEPENDENCY_ORDER_ERROR_ID,
        missedSpacingBetweenMembers: MISSED_SPACING_ERROR_ID,
        extraSpacingBetweenMembers: EXTRA_SPACING_ERROR_ID,
        missedCommentAbove: MISSED_COMMENT_ABOVE_ERROR_ID,
        unexpectedGroupOrder: GROUP_ORDER_ERROR_ID,
        unexpectedOrder: ORDER_ERROR_ID,
      },
      shouldIgnoreOrder:
        usesSpecifierSorting ?
          (left, right) =>
            shouldIgnoreSpecifierOrder({
              sortedNodeIndex: sortedNodeIndexForIgnore!,
              sortedNodes: sortedNodesForIgnore!,
              right,
              left,
            })
        : undefined,
      customOrderFixes:
        usesSpecifierSorting && partitionOrderInfo !== null ?
          createSpecifierAwareOrderFixes({
            partitionInfo: partitionOrderInfo,
            sourceCode,
            options,
          })
        : partitionOrderFixes,
      sortNodesExcludingEslintDisabled: createSortNodesExcludingEslintDisabled(
        expandedSortingNodeGroupsForSorting,
      ),
      options: {
        ...options,
        partitionByComment: getPartitionByCommentOption(options),
      },
      customOrderFixesAreSingleRange:
        usesSpecifierSorting || !!partitionOrderFixes,
      nodes: expandedSortingNodes,
      newlinesBetweenValueGetter,
      context,
    })
  }

  function createSortNodesExcludingEslintDisabled(
    nodeGroups: SortImportsSpecifierSortingNode[][],
  ) {
    return function (
      ignoreEslintDisabledNodes: boolean,
    ): SortImportsSpecifierSortingNode[] {
      let nodesSortedByGroups = nodeGroups.flatMap(nodes =>
        sortNodesByGroups({
          isNodeIgnoredForGroup: ({ groupIndex }) => {
            if (options.imports.sortSideEffects) {
              return false
            }
            return isSideEffectOnlyGroup(options.groups[groupIndex])
          },
          isNodeIgnored: node => node.isIgnored,
          optionsByGroupIndexComputer,
          comparatorByOptionsComputer,
          ignoreEslintDisabledNodes,
          groups: options.groups,
          nodes,
        }),
      )

      return sortNodesByDependencies(nodesSortedByGroups, {
        ignoreEslintDisabledNodes,
      })
    }
  }

  function hasContentBetweenNodes(
    left: Pick<SortImportsSortingNode, 'node'>,
    right: Pick<SortImportsSortingNode, 'node'>,
  ): boolean {
    return (
      sourceCode.getTokensBetween(left.node, right.node, {
        includeComments: false,
      }).length > 0
    )
  }
}
function isValidImportsOption(imports: unknown): boolean {
  if (!isObjectRecord(imports)) {
    return false
  }
  assertNoUnknownKeys(imports, [
    'casingPriority',
    'maxLineLength',
    'orderBy',
    'sortSideEffects',
    'splitDeclarations',
  ])

  let {
    splitDeclarations,
    sortSideEffects,
    casingPriority,
    maxLineLength,
    orderBy,
  } = imports

  if (casingPriority !== undefined) {
    if (!Array.isArray(casingPriority)) {
      return false
    }

    let allowedValues = new Set([
      'snake_case',
      'UPPER_CASE',
      'PascalCase',
      'kebab-case',
      'camelCase',
    ])

    let uniqueCasingPriority = new Set<string>()
    for (let casingOption of casingPriority) {
      if (
        typeof casingOption !== 'string' ||
        !allowedValues.has(casingOption)
      ) {
        return false
      }

      if (uniqueCasingPriority.has(casingOption)) {
        return false
      }
      uniqueCasingPriority.add(casingOption)
    }
  }

  if (
    orderBy !== undefined &&
    orderBy !== 'path' &&
    orderBy !== 'alias' &&
    orderBy !== 'specifier'
  ) {
    return false
  }

  if (
    splitDeclarations !== undefined &&
    typeof splitDeclarations !== 'boolean'
  ) {
    return false
  }

  if (sortSideEffects !== undefined && typeof sortSideEffects !== 'boolean') {
    return false
  }

  if (
    maxLineLength !== undefined &&
    maxLineLength !== null &&
    !isPositiveInteger(maxLineLength)
  ) {
    return false
  }

  return true
}

function isValidPartitionsOption(partitions: unknown): boolean {
  if (partitions === 'merge') {
    return true
  }
  if (!isObjectRecord(partitions)) {
    return false
  }

  assertNoUnknownKeys(partitions, [
    'maxImports',
    'orderBy',
    'orderStability',
    'splitBy',
  ])

  let { orderStability, maxImports, orderBy, splitBy } = partitions

  if (
    orderBy !== undefined &&
    orderBy !== 'source' &&
    orderBy !== 'type-first'
  ) {
    return false
  }

  if (
    orderStability !== undefined &&
    orderStability !== 'stable' &&
    orderStability !== 'unstable'
  ) {
    return false
  }

  if (
    maxImports !== undefined &&
    maxImports !== null &&
    !isPositiveInteger(maxImports)
  ) {
    return false
  }

  if (splitBy !== undefined) {
    if (!isObjectRecord(splitBy)) {
      return false
    }
    assertNoUnknownKeys(splitBy, ['comments', 'newlines'])
    let splitByNewlines = splitBy['newlines']
    let splitByComments = splitBy['comments']
    if (splitByNewlines !== undefined && typeof splitByNewlines !== 'boolean') {
      return false
    }
    if (
      splitByComments !== undefined &&
      !isValidPartitionByCommentOption(splitByComments)
    ) {
      return false
    }
  }

  return true
}

function normalizeSortImportsOptions(
  options: Required<Options[number]>,
): SortImportsOptions {
  let importsOption = options.imports
  let partitionsOption = options.partitions
  let partitionsSplitByOption =
    partitionsOption === 'merge' ? undefined : partitionsOption.splitBy
  let partitionsSplitByComments = partitionsSplitByOption?.comments

  let normalizedPartitions: SortImportsOptions['partitions'] =
    partitionsOption === 'merge' ? 'merge' : (
      {
        splitBy: {
          comments:
            isValidPartitionByCommentOption(partitionsSplitByComments) ?
              partitionsSplitByComments
            : false,
          newlines: partitionsSplitByOption?.newlines ?? false,
        },
        maxImports: partitionsOption.maxImports ?? Infinity,
        orderStability: partitionsOption.orderStability,
        orderBy: partitionsOption.orderBy,
      }
    )

  return {
    ...options,
    imports: {
      maxLineLength: importsOption.maxLineLength ?? Infinity,
      splitDeclarations: importsOption.splitDeclarations,
      sortSideEffects: importsOption.sortSideEffects,
      casingPriority: importsOption.casingPriority,
      orderBy: importsOption.orderBy,
    },
    partitions: normalizedPartitions,
  }
}

function normalizeNewlinesInsideForPartitionPreserve(
  options: SortImportsOptions,
): void {
  if (options.partitions === 'merge' || !isPartitionByNewLineEnabled(options)) {
    return
  }

  options.newlinesInside = normalizeNewlinesInsideValue(options.newlinesInside)

  options.groups = options.groups.map(group => {
    if (
      !isGroupWithOverridesOption(group) ||
      group.newlinesInside === undefined
    ) {
      return group
    }

    let normalizedNewlinesInside = normalizeNewlinesInsideValue(
      group.newlinesInside,
    )
    return {
      ...group,
      newlinesInside: normalizedNewlinesInside,
    }
  })

  options.customGroups = options.customGroups.map(customGroup => {
    if (customGroup.newlinesInside === undefined) {
      return customGroup
    }

    let normalizedNewlinesInside = normalizeNewlinesInsideValue(
      customGroup.newlinesInside,
    )
    return {
      ...customGroup,
      newlinesInside: normalizedNewlinesInside,
    }
  })
}

function shouldIgnoreSpecifierOrder({
  sortedNodeIndex,
  sortedNodes,
  right,
  left,
}: {
  sortedNodeIndex: Map<SortImportsSpecifierSortingNode, number>
  sortedNodes: SortImportsSpecifierSortingNode[]
  left: SortImportsSpecifierSortingNode | null
  right: SortImportsSpecifierSortingNode
}): boolean {
  if (!left?.parentImportNode || !right.parentImportNode) {
    return false
  }
  if (left.parentImportNode !== right.parentImportNode) {
    return false
  }

  let leftIndex = sortedNodeIndex.get(left)
  let rightIndex = sortedNodeIndex.get(right)
  /* v8 ignore next 2 -- @preserve Defensive guard for unexpected index lookups. */
  if (leftIndex === undefined || rightIndex === undefined) {
    return false
  }

  let start = Math.min(leftIndex, rightIndex)
  let end = Math.max(leftIndex, rightIndex)
  for (let i = start + 1; i < end; i++) {
    if (sortedNodes[i]!.parentImportNode !== left.parentImportNode) {
      return false
    }
  }

  return true
}

function validateSortImportsConfiguration(
  options: Required<Options[number]>,
): void {
  assertNoUnknownKeys(options as Record<string, unknown>, [
    'alphabet',
    'customGroups',
    'environment',
    'fallbackSort',
    'groups',
    'ignoreCase',
    'imports',
    'internalPattern',
    'locales',
    'newlinesBetween',
    'newlinesInside',
    'order',
    'partitions',
    'specialCharacters',
    'tsconfig',
    'type',
    'useExperimentalDependencyDetection',
  ])

  if (!isValidImportsOption(options.imports)) {
    throw new Error(
      "The 'imports' option must be an object with valid vNext fields.",
    )
  }

  if (!isValidPartitionsOption(options.partitions)) {
    throw new Error(
      "The 'partitions' option must be 'merge' or an object with valid vNext fields.",
    )
  }

  if (!isValidTsconfigOption(options.tsconfig)) {
    throw new Error(
      "The 'tsconfig' option must be an object with { rootDir, filename? }.",
    )
  }
}

function isValidPartitionByCommentOption(
  value: unknown,
): value is PartitionByCommentOption {
  if (typeof value === 'boolean') {
    return true
  }
  if (typeof value === 'string') {
    return true
  }
  if (Array.isArray(value)) {
    return value.every(isValidRegexOptionValue)
  }
  if (!isObjectRecord(value)) {
    return false
  }

  let hasPattern = 'pattern' in value
  if (hasPattern) {
    assertNoUnknownKeys(value, ['flags', 'pattern'])
    if (typeof value['pattern'] !== 'string') {
      return false
    }
    if (value['flags'] !== undefined && typeof value['flags'] !== 'string') {
      return false
    }
    return true
  }

  assertNoUnknownKeys(value, ['block', 'line'])
  let { block, line } = value
  if (block !== undefined && !isValidPartitionByCommentOption(block)) {
    return false
  }
  if (line !== undefined && !isValidPartitionByCommentOption(line)) {
    return false
  }
  return Object.keys(value).length > 0
}

function isValidRegexOptionValue(value: unknown): boolean {
  if (typeof value === 'string') {
    return true
  }
  if (!isObjectRecord(value)) {
    return false
  }
  assertNoUnknownKeys(value, ['flags', 'pattern'])
  let { pattern, flags } = value
  return (
    typeof pattern === 'string' &&
    (flags === undefined || typeof flags === 'string')
  )
}

function isValidTsconfigOption(tsconfig: unknown): boolean {
  if (!isObjectRecord(tsconfig)) {
    return false
  }
  assertNoUnknownKeys(tsconfig, ['filename', 'rootDir'])
  let { rootDir: rootDirectory, filename } = tsconfig
  if (typeof rootDirectory !== 'string') {
    return false
  }
  return filename === undefined || typeof filename === 'string'
}

function assertNoUnknownKeys(
  value: Record<string, unknown>,
  allowedKeys: string[],
): void {
  let allowed = new Set(allowedKeys)
  for (let key of Object.keys(value)) {
    if (!allowed.has(key)) {
      throw new Error(`Unknown option '${key}' in sort-imports configuration.`)
    }
  }
}

function normalizeNewlinesInsideValue<
  T extends SortImportsOptions['newlinesInside'] | NewlinesInsideOption,
>(newlinesInside: T): T {
  if (typeof newlinesInside !== 'number') {
    return newlinesInside
  }

  return Math.max(0, newlinesInside) as T
}

function getPartitionByCommentOption(
  options: SortImportsOptions,
): PartitionByCommentOption | false {
  return options.partitions === 'merge' ?
      false
    : options.partitions.splitBy.comments
}

function getPartitionMaxImports(options: SortImportsOptions): number {
  return options.partitions === 'merge' ?
      Infinity
    : options.partitions.maxImports
}

function isPartitionByNewLineEnabled(options: SortImportsOptions): boolean {
  return options.partitions !== 'merge' && options.partitions.splitBy.newlines
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 1
}

let namedSpecifierSegmentsCache = new WeakMap<
  TSESTree.ImportDeclaration,
  {
    segmentsBySpecifier: Map<TSESTree.ImportSpecifier, string>
    trailingWhitespace: string
    hasTrailingComma: boolean
    leadingWhitespace: string
    trailingText: string
  }
>()

type OutputNode =
  | {
      sortingNode: SortImportsSpecifierSortingNode
      parentImportNode: TSESTree.ImportDeclaration
      specifiers: TSESTree.ImportClause[]
      includeLeadingComments: boolean
      includeTrailingComment: boolean
      kind: 'split-import'
    }
  | {
      sortingNode: SortImportsSpecifierSortingNode
      kind: 'original'
    }

function buildPartitionGroups({
  sourceCode,
  options,
  nodes,
}: {
  nodes: SortImportsSortingNode[]
  sourceCode: TSESLint.SourceCode
  options: SortImportsOptions
}): {
  partitionKeyByNode: Map<SortImportsSortingNode, number>
  partitionsInSortedOrder: SortImportsSortingNode[][]
  partitionsInSourceOrder: SortImportsSortingNode[][]
} {
  if (nodes.length === 0) {
    return {
      partitionKeyByNode: new Map(),
      partitionsInSortedOrder: [],
      partitionsInSourceOrder: [],
    }
  }

  if (options.partitions === 'merge') {
    let partitionKeyByNode = new Map(nodes.map(node => [node, 0] as const))
    return {
      partitionsInSortedOrder: [nodes],
      partitionsInSourceOrder: [nodes],
      partitionKeyByNode,
    }
  }

  let { groups } = options
  let { partitions } = options
  let partitionMaxImports = getPartitionMaxImports(options)
  let partitionSortingStable = partitions.orderStability === 'stable'
  let partitionsInSourceOrder: SortImportsSortingNode[][] = []
  let currentPartition: SortImportsSortingNode[] = []
  let hasPartition = false
  let lastGroupIndex: number | null = null
  let lastSortingNode: SortImportsSortingNode | undefined

  for (let sortingNode of nodes) {
    let groupIndex = getGroupIndex(groups, sortingNode)
    let isSameGroupAsPrevious = lastGroupIndex === groupIndex
    let shouldStartNewPartition =
      !hasPartition ||
      !isSameGroupAsPrevious ||
      shouldPartition({
        options: {
          partitionByComment: getPartitionByCommentOption(options),
          partitionByNewLine: isPartitionByNewLineEnabled(options),
        },
        lastSortingNode,
        sortingNode,
        sourceCode,
      })

    if (shouldStartNewPartition) {
      currentPartition = []
      partitionsInSourceOrder.push(currentPartition)
      hasPartition = true
    }

    currentPartition.push(sortingNode)
    lastGroupIndex = groupIndex
    lastSortingNode = sortingNode
  }

  if (Number.isFinite(partitionMaxImports) && partitionMaxImports > 0) {
    let splitPartitions: SortImportsSortingNode[][] = []
    for (let partition of partitionsInSourceOrder) {
      for (let i = 0; i < partition.length; i += partitionMaxImports) {
        splitPartitions.push(partition.slice(i, i + partitionMaxImports))
      }
    }
    partitionsInSourceOrder = splitPartitions
  }

  let partitionsByGroupIndex = new Map<number, SortImportsSortingNode[][]>()
  for (let partition of partitionsInSourceOrder) {
    let groupIndex = getGroupIndex(groups, partition[0]!)
    let groupPartitions = partitionsByGroupIndex.get(groupIndex) ?? []
    groupPartitions.push(partition)
    partitionsByGroupIndex.set(groupIndex, groupPartitions)
  }

  let partitionsInSortedOrder: SortImportsSortingNode[][] = []
  let sortedGroupIndices = [...partitionsByGroupIndex.keys()].toSorted(
    (a, b) => a - b,
  )
  for (let groupIndex of sortedGroupIndices) {
    let groupPartitions = partitionsByGroupIndex.get(groupIndex)!
    if (shouldSortPartitions(options)) {
      groupPartitions = orderPartitionsByTypeFirst({
        partitions: groupPartitions.map(partitionNodes => ({
          isTypeOnly: isTypeOnlyPartition(partitionNodes),
          nodeSet: new Set(partitionNodes),
          nodes: partitionNodes,
          start: 0,
          end: 0,
        })),
        stable: partitionSortingStable,
      }).map(partition => partition.nodes)
    }
    partitionsInSortedOrder.push(...groupPartitions)
  }

  let partitionKeyByNode = new Map<SortImportsSortingNode, number>()
  for (let [partitionIndex, partition] of partitionsInSourceOrder.entries()) {
    for (let node of partition) {
      partitionKeyByNode.set(node, partitionIndex)
    }
  }

  return {
    partitionsInSortedOrder,
    partitionsInSourceOrder,
    partitionKeyByNode,
  }
}

function buildOutputNodes(
  sortedNodes: SortImportsSpecifierSortingNode[],
): OutputNode[] {
  let lastIndexByParent = new Map<TSESTree.ImportDeclaration, number>()
  let groupCountByParent = new Map<TSESTree.ImportDeclaration, number>()
  let previousParent: TSESTree.ImportDeclaration | null = null
  for (let [index, node] of sortedNodes.entries()) {
    if (node.specifier && node.parentImportNode) {
      lastIndexByParent.set(node.parentImportNode, index)
      if (previousParent !== node.parentImportNode) {
        groupCountByParent.set(
          node.parentImportNode,
          (groupCountByParent.get(node.parentImportNode) ?? 0) + 1,
        )
      }
      previousParent = node.parentImportNode
    } else {
      previousParent = null
    }
  }

  let outputNodes: OutputNode[] = []
  let seenParents = new Set<TSESTree.ImportDeclaration>()
  let emittedParents = new Set<TSESTree.ImportDeclaration>()
  let currentGroup: OutputNode | null = null

  for (let [index, node] of sortedNodes.entries()) {
    if (node.specifier && node.parentImportNode) {
      if (groupCountByParent.get(node.parentImportNode) === 1) {
        if (currentGroup) {
          outputNodes.push(currentGroup)
          currentGroup = null
        }
        if (!emittedParents.has(node.parentImportNode)) {
          outputNodes.push({
            sortingNode: node,
            kind: 'original',
          })
          emittedParents.add(node.parentImportNode)
        }
        continue
      }

      if (
        currentGroup?.kind === 'split-import' &&
        currentGroup.parentImportNode === node.parentImportNode
      ) {
        currentGroup.specifiers.push(node.specifier)
      } else {
        if (currentGroup) {
          outputNodes.push(currentGroup)
        }
        currentGroup = {
          includeLeadingComments: !seenParents.has(node.parentImportNode),
          parentImportNode: node.parentImportNode,
          includeTrailingComment: false,
          specifiers: [node.specifier],
          kind: 'split-import',
          sortingNode: node,
        }
        seenParents.add(node.parentImportNode)
      }

      if (index === lastIndexByParent.get(node.parentImportNode)) {
        currentGroup.includeTrailingComment = true
      }
      continue
    }

    if (currentGroup) {
      outputNodes.push(currentGroup)
      currentGroup = null
    }
    outputNodes.push({
      sortingNode: node,
      kind: 'original',
    })
  }

  if (currentGroup) {
    outputNodes.push(currentGroup)
  }

  return outputNodes
}

function buildSplitImportDeclarationText({
  specifiers,
  sourceCode,
  importNode,
}: {
  importNode: TSESTree.ImportDeclaration
  specifiers: TSESTree.ImportClause[]
  sourceCode: TSESLint.SourceCode
}): string {
  let defaultSpecifier = specifiers.find(
    specifier => specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier,
  )
  let namespaceSpecifier = specifiers.find(
    specifier => specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier,
  )
  let namedSpecifiers = specifiers.filter(
    specifier => specifier.type === AST_NODE_TYPES.ImportSpecifier,
  )

  let importKeyword =
    importNode.importKind === 'type' ? 'import type' : 'import'
  let sourceText = sourceCode.getText(importNode.source)

  let namedText = ''
  if (namedSpecifiers.length > 0) {
    let segmentInfo = getNamedSpecifierSegments(importNode, sourceCode)
    namedText = namedSpecifiers
      .map(specifier =>
        segmentInfo.segmentsBySpecifier.get(specifier)!.trimEnd(),
      )
      .join(',')
    if (segmentInfo.hasTrailingComma) {
      namedText += `,${segmentInfo.trailingText}`
    }
    if (
      segmentInfo.trailingWhitespace &&
      !namedText.endsWith(segmentInfo.trailingWhitespace)
    ) {
      namedText += segmentInfo.trailingWhitespace
    }
  }

  let importClause: string
  if (namespaceSpecifier) {
    // Default + namespace never appear in the same split group.
    importClause = sourceCode.getText(namespaceSpecifier)
  } else if (namedSpecifiers.length > 0) {
    let namedBlock = `{${namedText}}`
    if (defaultSpecifier) {
      let defaultText = sourceCode.getText(defaultSpecifier)
      importClause = `${defaultText}, ${namedBlock}`
    } else {
      importClause = namedBlock
    }
  } else {
    importClause = sourceCode.getText(defaultSpecifier)
  }

  let statement = `${importKeyword} ${importClause} from ${sourceText}`
  if (sourceCode.getText(importNode).trimEnd().endsWith(';')) {
    statement += ';'
  }
  return statement
}

function getNamedSpecifierSegments(
  importNode: TSESTree.ImportDeclaration,
  sourceCode: TSESLint.SourceCode,
): {
  segmentsBySpecifier: Map<TSESTree.ImportSpecifier, string>
  trailingWhitespace: string
  hasTrailingComma: boolean
  leadingWhitespace: string
  trailingText: string
} {
  let cached = namedSpecifierSegmentsCache.get(importNode)
  if (cached) {
    return cached
  }

  let namedSpecifiers = importNode.specifiers.filter(
    specifier => specifier.type === AST_NODE_TYPES.ImportSpecifier,
  )
  let tokens = sourceCode.getTokens(importNode, { includeComments: false })
  let openBrace = tokens.find(token => token.value === '{')!
  let closeBrace = [...tokens].toReversed().find(token => token.value === '}')!

  let content = sourceCode.text.slice(openBrace.range[1], closeBrace.range[0])
  let segments = splitNamedImportContent(content)
  let [leadingWhitespace] = content.match(/^\s*/u)!
  let [trailingWhitespace] = content.match(/\s*$/u)!

  let specifierSegments = segments.slice(0, namedSpecifiers.length)
  let trailingText = segments.slice(namedSpecifiers.length).join(',')
  let hasTrailingComma = segments.length > namedSpecifiers.length

  let segmentsBySpecifier = new Map<TSESTree.ImportSpecifier, string>()
  for (let [index, specifier] of namedSpecifiers.entries()) {
    segmentsBySpecifier.set(specifier, specifierSegments[index]!)
  }

  let result = {
    segmentsBySpecifier,
    trailingWhitespace,
    leadingWhitespace,
    hasTrailingComma,
    trailingText,
  }
  namedSpecifierSegmentsCache.set(importNode, result)
  return result
}

function buildPartitionOrderInfo({
  sortedPartitions,
  partitions,
  sourceCode,
  options,
}: {
  sortedPartitions: SortImportsSortingNode[][]
  partitions: SortImportsSortingNode[][]
  sourceCode: TSESLint.SourceCode
  options: SortImportsOptions
}): PartitionSortingInfo {
  let partitionInfos = partitions.map(nodes => {
    let start = getNodeRange({
      options: {
        partitionByComment: getPartitionByCommentOption(options),
      },
      node: nodes.at(0)!.node,
      sourceCode,
    }).at(0)!
    let end = getPartitionEnd({
      node: nodes.at(-1)!.node,
      sourceCode,
    })

    return {
      isTypeOnly: isTypeOnlyPartition(nodes),
      nodeSet: new Set(nodes),
      start,
      nodes,
      end,
    }
  })

  let separatorsBetween = partitionInfos
    .slice(0, -1)
    .map((partition, index) => {
      let nextPartition = partitionInfos[index + 1]!
      return sourceCode.text.slice(partition.end, nextPartition.start)
    })

  let partitionInfoByNodes = new Map(
    partitionInfos.map(info => [info.nodes, info] as const),
  )
  let sortedPartitionInfos = sortedPartitions.map(partition => {
    let info = partitionInfoByNodes.get(partition)
    /* v8 ignore next -- @preserve Defensive guard for unexpected partition mapping. */
    if (!info) {
      throw new Error('Partition order mismatch.')
    }
    return info
  })

  return {
    regionStart: partitionInfos.at(0)!.start,
    sortedPartitions: sortedPartitionInfos,
    regionEnd: partitionInfos.at(-1)!.end,
    partitions: partitionInfos,
    separatorsBetween,
  }
}

function createSpecifierAwareOrderFixes({
  partitionInfo,
  sourceCode,
  options,
}: {
  partitionInfo: PartitionSortingInfo
  sourceCode: TSESLint.SourceCode
  options: SortImportsOptions
}) {
  return function ({
    sortedNodes,
    fixer,
  }: CustomOrderFixesParameters<SortImportsSpecifierSortingNode>): TSESLint.RuleFix[] {
    let { separatorsBetween, sortedPartitions, regionStart, regionEnd } =
      partitionInfo
    let updatedText = sortedPartitions
      .map((partition, index) => {
        let partitionNodes = sortedNodes.filter(node =>
          partition.nodeSet.has(node.parentSortingNode),
        )
        let partitionText =
          needsSplitImportDeclarations(partitionNodes) ?
            buildSortedPartitionTextWithSpecifiers({
              sortedNodes: partitionNodes,
              sourceCode,
              options,
            })
          : buildSortedPartitionText({
              sortedNodes: getSortedOriginalNodes(partitionNodes),
              sourceCode,
              partition,
              options,
            })
        let separator =
          index < separatorsBetween.length ?
            computeSeparatorBetweenPartitions({
              originalSeparator: separatorsBetween[index]!,
              right: sortedPartitions[index + 1],
              left: partition,
              options,
            })
          : ''
        return `${partitionText}${separator}`
      })
      .join('')

    return [fixer.replaceTextRange([regionStart, regionEnd], updatedText)]
  }
}

function buildOutputNodeText({
  outputNode,
  sourceCode,
  options,
}: {
  sourceCode: TSESLint.SourceCode
  options: SortImportsOptions
  outputNode: OutputNode
}): string {
  if (outputNode.kind === 'original') {
    return sourceCode.text.slice(
      ...getNodeRangeWithInlineComment({
        node: outputNode.sortingNode.node,
        sourceCode,
        options,
      }),
    )
  }

  let {
    includeTrailingComment,
    includeLeadingComments,
    parentImportNode,
    specifiers,
  } = outputNode
  let leadingText = ''
  if (includeLeadingComments) {
    let [start] = getNodeRange({
      options: {
        partitionByComment: getPartitionByCommentOption(options),
      },
      node: parentImportNode,
      sourceCode,
    })
    leadingText = sourceCode.text.slice(start, parentImportNode.range.at(0))
  }

  let trailingText = ''
  if (includeTrailingComment) {
    let inlineComment = getInlineCommentAfter(parentImportNode, sourceCode)
    if (inlineComment) {
      trailingText = sourceCode.text.slice(
        parentImportNode.range.at(1),
        inlineComment.range.at(1),
      )
    }
  }

  let importText = buildSplitImportDeclarationText({
    importNode: parentImportNode,
    sourceCode,
    specifiers,
  })

  return `${leadingText}${importText}${trailingText}`
}

function createPartitionOrderFixes({
  partitionSortingInfo,
  sourceCode,
  options,
}: {
  partitionSortingInfo: PartitionSortingInfo
  sourceCode: TSESLint.SourceCode
  options: SortImportsOptions
}) {
  return function ({
    sortedNodes,
    fixer,
  }: CustomOrderFixesParameters<SortImportsSortingNode>): TSESLint.RuleFix[] {
    let { separatorsBetween, sortedPartitions, regionStart, regionEnd } =
      partitionSortingInfo
    let updatedText = sortedPartitions
      .map((partition, index) => {
        let partitionText = buildSortedPartitionText({
          sortedNodes,
          sourceCode,
          partition,
          options,
        })
        let separator =
          index < separatorsBetween.length ?
            computeSeparatorBetweenPartitions({
              originalSeparator: separatorsBetween[index]!,
              right: sortedPartitions[index + 1],
              left: partition,
              options,
            })
          : ''
        return `${partitionText}${separator}`
      })
      .join('')
    let originalText = sourceCode.text.slice(regionStart, regionEnd)
    if (updatedText === originalText) {
      return []
    }

    return [fixer.replaceTextRange([regionStart, regionEnd], updatedText)]
  }
}

function buildSortedPartitionText({
  sortedNodes,
  sourceCode,
  partition,
  options,
}: {
  sortedNodes: SortImportsSortingNode[]
  sourceCode: TSESLint.SourceCode
  options: SortImportsOptions
  partition: PartitionInfo
}): string {
  let sortedPartitionNodes = sortedNodes.filter(node =>
    partition.nodeSet.has(node),
  )

  let text = ''
  let cursor = partition.start
  for (let i = 0; i < partition.nodes.length; i++) {
    let currentNode = partition.nodes[i]!
    let sortedNode = sortedPartitionNodes[i]!
    let nodeRange = getNodeRangeWithInlineComment({
      node: currentNode.node,
      sourceCode,
      options,
    })

    text += sourceCode.text.slice(cursor, nodeRange.at(0))
    let sortedNodeText = sourceCode.text.slice(
      ...getNodeRangeWithInlineComment({
        node: sortedNode.node,
        sourceCode,
        options,
      }),
    )

    sortedNodeText = addSafetySemicolonIfNeeded({
      text: sortedNodeText,
      node: currentNode,
      sortedNode,
      sourceCode,
    })

    text += sortedNodeText
    cursor = nodeRange.at(1)!
  }

  text += sourceCode.text.slice(cursor, partition.end)
  return text
}

function expandSortingNodesBySpecifier({
  sourceCode,
  options,
  nodes,
}: {
  nodes: SortImportsSortingNode[]
  sourceCode: TSESLint.SourceCode
  options: SortImportsOptions
}): SortImportsSpecifierSortingNode[] {
  return nodes.flatMap(node => {
    let importNode =
      node.node.type === AST_NODE_TYPES.ImportDeclaration ? node.node : null

    if (
      options.imports.orderBy === 'path' ||
      !importNode ||
      !isSortable(importNode.specifiers)
    ) {
      return [
        Object.assign(node, {
          parentSortingNode: node,
        }) as SortImportsSpecifierSortingNode,
      ]
    }

    return importNode.specifiers.map(specifier => ({
      ...node,
      dependencyNames: [
        computeImportSpecifierDependencyName(specifier, sourceCode),
      ],
      sourceSpecifierName: computeImportSpecifierSourceName(specifier),
      specifierName: computeImportSpecifierAliasName(specifier),
      specifierKind: getSpecifierKind(specifier),
      size: rangeToDiff(specifier, sourceCode),
      parentImportNode: importNode,
      parentSortingNode: node,
      node: importNode,
      specifier,
    }))
  })
}

function splitNamedImportContent(content: string): string[] {
  let segments: string[] = []
  let start = 0
  let index = 0
  let inLineComment = false
  let inBlockComment = false

  while (index < content.length) {
    let char = content[index]
    let next = content[index + 1]

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false
      }
      index += 1
      continue
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false
        index += 2
        continue
      }
      index += 1
      continue
    }

    if (char === '/' && next === '/') {
      inLineComment = true
      index += 2
      continue
    }

    if (char === '/' && next === '*') {
      inBlockComment = true
      index += 2
      continue
    }

    if (char === ',') {
      segments.push(content.slice(start, index))
      start = index + 1
      index += 1
      continue
    }

    index += 1
  }

  segments.push(content.slice(start))
  return segments
}

function buildSortedPartitionTextWithSpecifiers({
  sortedNodes,
  sourceCode,
  options,
}: {
  sortedNodes: SortImportsSpecifierSortingNode[]
  sourceCode: TSESLint.SourceCode
  options: SortImportsOptions
}): string {
  let shouldIgnoreNewlinesInside =
    options.partitions !== 'merge' &&
    (isPartitionByNewLineEnabled(options) ||
      Boolean(getPartitionByCommentOption(options)) ||
      getPartitionMaxImports(options) !== Infinity)

  let outputNodes = buildOutputNodes(sortedNodes)
  let text = ''
  for (let i = 0; i < outputNodes.length; i++) {
    let current = outputNodes[i]!
    let next = outputNodes[i + 1]
    text += buildOutputNodeText({
      outputNode: current,
      sourceCode,
      options,
    })
    if (next) {
      text += buildSeparatorBetweenOutputNodes({
        shouldIgnoreNewlinesInside,
        left: current.sortingNode,
        right: next.sortingNode,
        options,
      })
    }
  }
  return text
}

function addSafetySemicolonIfNeeded({
  sortedNode,
  sourceCode,
  node,
  text,
}: {
  sortedNode: SortImportsSortingNode
  sourceCode: TSESLint.SourceCode
  node: SortImportsSortingNode
  text: string
}): string {
  let sortedNodeText = sourceCode.getText(sortedNode.node)
  let tokensAfter = sourceCode.getTokensAfter(node.node, {
    includeComments: false,
    count: 1,
  })
  let nextToken = tokensAfter.at(0)

  let sortedNextNodeEndsWithSafeCharacter =
    sortedNodeText.endsWith(';') || sortedNodeText.endsWith(',')
  let isNextTokenOnSameLineAsNode =
    nextToken?.loc.start.line === node.node.loc.end.line
  let isNextTokenSafeCharacter =
    nextToken?.value === ';' || nextToken?.value === ','

  if (
    isNextTokenOnSameLineAsNode &&
    !sortedNextNodeEndsWithSafeCharacter &&
    !isNextTokenSafeCharacter
  ) {
    return `${text};`
  }

  return text
}

function computeSeparatorBetweenPartitions({
  originalSeparator,
  options,
  right,
  left,
}: {
  right: PartitionInfo | undefined
  options: SortImportsOptions
  originalSeparator: string
  left: PartitionInfo
}): string {
  /* v8 ignore next -- @preserve Defensive guard for unexpected partition mapping. */
  if (!right) {
    return ''
  }

  let leftGroupIndex = getGroupIndex(options.groups, left.nodes[0]!)
  let rightGroupIndex = getGroupIndex(options.groups, right.nodes[0]!)
  let newlinesBetween = getNewlinesBetweenOption({
    nextNodeGroupIndex: rightGroupIndex,
    nodeGroupIndex: leftGroupIndex,
    options,
  })

  if (newlinesBetween === 'ignore') {
    return originalSeparator
  }

  if (originalSeparator.trim().length > 0) {
    return originalSeparator
  }

  return '\n'.repeat(newlinesBetween + 1)
}

function buildSeparatorBetweenOutputNodes({
  shouldIgnoreNewlinesInside,
  options,
  right,
  left,
}: {
  right: SortImportsSpecifierSortingNode
  left: SortImportsSpecifierSortingNode
  shouldIgnoreNewlinesInside: boolean
  options: SortImportsOptions
}): string {
  let leftGroupIndex = getGroupIndex(options.groups, left)
  let rightGroupIndex = getGroupIndex(options.groups, right)

  if (shouldIgnoreNewlinesInside && leftGroupIndex === rightGroupIndex) {
    return '\n'
  }

  let newlinesBetween = getNewlinesBetweenOption({
    nextNodeGroupIndex: rightGroupIndex,
    nodeGroupIndex: leftGroupIndex,
    options,
  })

  if (newlinesBetween === 'ignore') {
    newlinesBetween = 0
  }

  return '\n'.repeat(newlinesBetween + 1)
}

function computeGroupExceptUnknown({
  selectors,
  modifiers,
  options,
  name,
}: {
  options: SortImportsOptions
  selectors: Selector[]
  modifiers: Modifier[]
  name: string
}): string | null {
  let predefinedGroups = generatePredefinedGroups({
    cache: cachedGroupsByModifiersAndSelectors,
    selectors,
    modifiers,
  })
  let computedCustomGroup = computeGroup({
    customGroupMatcher: customGroup =>
      doesCustomGroupMatch({
        elementName: name,
        customGroup,
        modifiers,
        selectors,
      }),
    predefinedGroups,
    options,
  })
  if (computedCustomGroup === 'unknown') {
    return null
  }
  return computedCustomGroup
}

function needsSplitImportDeclarations(
  sortedNodes: SortImportsSpecifierSortingNode[],
): boolean {
  let seenParents = new Set<TSESTree.ImportDeclaration>()
  let lastParent: TSESTree.ImportDeclaration | null = null

  for (let node of sortedNodes) {
    if (!node.parentImportNode || !node.specifier) {
      lastParent = null
      continue
    }

    if (
      seenParents.has(node.parentImportNode) &&
      lastParent !== node.parentImportNode
    ) {
      return true
    }

    seenParents.add(node.parentImportNode)
    lastParent = node.parentImportNode
  }

  return false
}

function computeImportSpecifierSourceName(
  specifier: TSESTree.ImportClause,
): string {
  switch (specifier.type) {
    case AST_NODE_TYPES.ImportNamespaceSpecifier:
    case AST_NODE_TYPES.ImportDefaultSpecifier:
      return specifier.local.name
    case AST_NODE_TYPES.ImportSpecifier:
      if (specifier.imported.type === AST_NODE_TYPES.Identifier) {
        return specifier.imported.name
      }
      return specifier.imported.value
    /* v8 ignore next 2 -- @preserve Exhaustive guard. */
    default:
      throw new UnreachableCaseError(specifier)
  }
}

function computeImportSpecifierDependencyName(
  specifier: TSESTree.ImportClause,
  sourceCode: TSESLint.SourceCode,
): string {
  switch (specifier.type) {
    case AST_NODE_TYPES.ImportNamespaceSpecifier:
    case AST_NODE_TYPES.ImportDefaultSpecifier:
      return sourceCode.getText(specifier.local)
    case AST_NODE_TYPES.ImportSpecifier:
      return sourceCode.getText(specifier.imported)
    /* v8 ignore next 2 -- @preserve Exhaustive guard. */
    default:
      throw new UnreachableCaseError(specifier)
  }
}

function getInlineCommentAfter(
  node: SortImportsSortingNode['node'],
  sourceCode: TSESLint.SourceCode,
): TSESTree.Comment | null {
  let token = sourceCode.getTokenAfter(node, {
    filter: ({ value, type }) =>
      type !== 'Punctuator' || ![',', ';', ':'].includes(value),
    includeComments: true,
  })

  if (
    (token?.type === 'Block' || token?.type === 'Line') &&
    node.loc.end.line === token.loc.end.line
  ) {
    return token
  }

  return null
}

function getSpecifierKind(
  specifier: TSESTree.ImportClause,
): 'namespace' | 'default' | 'named' {
  switch (specifier.type) {
    case AST_NODE_TYPES.ImportNamespaceSpecifier:
      return 'namespace'
    case AST_NODE_TYPES.ImportDefaultSpecifier:
      return 'default'
    case AST_NODE_TYPES.ImportSpecifier:
      return 'named'
    /* v8 ignore next 2 -- @preserve Exhaustive guard. */
    default:
      throw new UnreachableCaseError(specifier)
  }
}

function computeImportSpecifierAliasName(
  specifier: TSESTree.ImportClause,
): string {
  switch (specifier.type) {
    case AST_NODE_TYPES.ImportNamespaceSpecifier:
    case AST_NODE_TYPES.ImportDefaultSpecifier:
      return specifier.local.name
    case AST_NODE_TYPES.ImportSpecifier:
      return specifier.local.name
    /* v8 ignore next 2 -- @preserve Exhaustive guard. */
    default:
      throw new UnreachableCaseError(specifier)
  }
}

function getSortedOriginalNodes(
  sortedNodes: SortImportsSpecifierSortingNode[],
): SortImportsSortingNode[] {
  let seenNodes = new Set<SortImportsSortingNode>()
  let originalNodes: SortImportsSortingNode[] = []

  for (let node of sortedNodes) {
    let parentNode = node.parentSortingNode
    if (!seenNodes.has(parentNode)) {
      seenNodes.add(parentNode)
      originalNodes.push(parentNode)
    }
  }

  return originalNodes
}

function getNodeRangeWithInlineComment({
  sourceCode,
  options,
  node,
}: {
  node: SortImportsSortingNode['node']
  sourceCode: TSESLint.SourceCode
  options: SortImportsOptions
}): TSESTree.Range {
  let start = getNodeRange({
    options: {
      partitionByComment: getPartitionByCommentOption(options),
    },
    sourceCode,
    node,
  }).at(0)!

  return [start, getPartitionEnd({ sourceCode, node })]
}

function orderPartitionsByTypeFirst({
  partitions,
  stable,
}: {
  partitions: PartitionInfo[]
  stable: boolean
}): PartitionInfo[] {
  if (stable) {
    return [
      ...partitions.filter(partition => partition.isTypeOnly),
      ...partitions.filter(partition => !partition.isTypeOnly),
    ]
  }

  return partitions.toSorted(
    (left, right) => Number(right.isTypeOnly) - Number(left.isTypeOnly),
  )
}

function getPartitionEnd({
  sourceCode,
  node,
}: {
  node: SortImportsSortingNode['node']
  sourceCode: TSESLint.SourceCode
}): number {
  let end = node.range.at(1)!
  let inlineCommentAfter = getInlineCommentAfter(node, sourceCode)
  if (inlineCommentAfter) {
    end = inlineCommentAfter.range.at(1)!
  }
  return end
}

function isTypeOnlyPartition(nodes: SortImportsSortingNode[]): boolean {
  return nodes.every(
    ({ node }) =>
      node.type === AST_NODE_TYPES.ImportDeclaration &&
      node.importKind === 'type',
  )
}

function shouldSortPartitions(options: SortImportsOptions): boolean {
  return (
    options.partitions !== 'merge' &&
    options.partitions.orderBy === 'type-first'
  )
}

let styleExtensions = [
  '.less',
  '.scss',
  '.sass',
  '.styl',
  '.pcss',
  '.css',
  '.sss',
]
function isStyle(value: string): boolean {
  let [cleanedValue] = value.split('?')
  return styleExtensions.some(extension => cleanedValue?.endsWith(extension))
}
