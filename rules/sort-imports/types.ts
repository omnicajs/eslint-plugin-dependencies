/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * fork-specific options typing, vNext imports/partitions schema, and
 * casingPriority contract.
 */
import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema'
import type { TSESTree } from '@typescript-eslint/types'

import type {
  CommonOptions,
  RegexOption,
  TypeOption,
} from '../../types/common-options'
import type { SortingNodeWithDependencies } from '../../utils/sort-nodes-by-dependencies'
import type { PartitionByCommentOption } from '../../types/common-partition-options'
import type { CommonGroupsOptions } from '../../types/common-groups-options'

import {
  buildCustomGroupModifiersJsonSchema,
  buildCustomGroupSelectorJsonSchema,
} from '../../utils/json-schemas/common-groups-json-schemas'

/**
 * Configuration options for the sort-imports rule.
 *
 * This rule enforces consistent ordering of import statements to improve code
 * organization, readability, and maintainability.
 */
export type Options = Partial<
  {
    /**
     * TypeScript configuration for resolving module paths. Enables path alias
     * resolution based on tsconfig.json paths configuration.
     */
    tsconfig: {
      /**
       * Optional filename of the TypeScript config file. `@default`
       * tsconfig.json'.
       */
      filename?: string

      /**
       * Root directory where to search for the TypeScript config file.
       */
      rootDir: string
    }

    /**
     * Enables experimental dependency detection.
     */
    useExperimentalDependencyDetection: boolean

    /**
     * Partition configuration.
     *
     * - `'merge'` merges partitions inside every group.
     * - Object configuration preserves partitions and controls how they are
     *   built/reordered.
     */
    partitions: PartitionsOptions | 'merge'

    /**
     * Patterns to identify internal imports. Imports matching these patterns
     * are categorized as 'internal'.
     */
    internalPattern: RegexOption[]

    /**
     * Runtime environment for resolving built-in modules. Determines which
     * modules are considered built-in.
     *
     * @default 'node'
     */
    environment: 'node' | 'bun'

    /**
     * Import node sorting configuration.
     */
    imports: ImportsOptions
  } & CommonGroupsOptions<CustomTypeOption, object, CustomGroupMatchOptions> &
    CommonOptions<CustomTypeOption>
>[]

/**
 * Represents a sorting node for an import statement. Extends the base sorting
 * node with dependency information and ignore flag.
 */
export interface SortImportsSortingNode extends SortingNodeWithDependencies<SortImportsNode> {
  /**
   * Source-side imported name for sorting by imported specifier.
   */
  sourceSpecifierName: string | null

  /**
   * The name of the import specifier for sorting purposes.
   */
  specifierName: string | null

  /**
   * Whether this import is a type-only import.
   */
  isTypeImport: boolean

  /**
   * Whether this import should be ignored during sorting. Typically true for
   * side-effect imports when sortSideEffects is false.
   */
  isIgnored: boolean
}

export type SortImportsNode =
  | TSESTree.TSImportEqualsDeclaration
  | TSESTree.VariableDeclaration
  | TSESTree.ImportDeclaration

export type CustomTypeOption = 'type-import-first' | TypeOption

/**
 * Union type of all available import selectors. Used to categorize different
 * types of import statements.
 */
export type Selector = (typeof allSelectors)[number]

/**
 * Union type of all available import modifiers. Used to identify specific
 * characteristics of import statements.
 */
export type Modifier = (typeof allModifiers)[number]

/**
 * Additional configuration for a single custom group.
 *
 * @example
 *
 * ```ts
 * {
 *   "modifiers": ["type"],
 *   "selector": "external"
 * }
 * ```
 */
interface CustomGroupMatchOptions {
  /**
   * List of modifiers that imports must have to be included in this group.
   */
  modifiers?: Modifier[]

  /**
   * The selector type that imports must match to be included in this group.
   */
  selector?: Selector
}

/**
 * Complete list of available active import selectors. Used for validation and
 * JSON schema generation.
 */
export let allSelectors = [
  'side-effect-style',
  'tsconfig-path',
  'side-effect',
  'external',
  'internal',
  'builtin',
  'sibling',
  'subpath',
  'import',
  'parent',
  'index',
  'style',
  'type',
] as const

/**
 * Complete list of available import modifiers. Used for validation and JSON
 * schema generation.
 */
export let allModifiers = [
  'default',
  'multiline',
  'named',
  'require',
  'side-effect',
  'singleline',
  'ts-equals',
  'type',
  'value',
  'wildcard',
] as const

/**
 * Ideally, we should generate as many schemas as there are selectors, and
 * ensure that users do not enter invalid modifiers for a given selector.
 */
export let additionalCustomGroupMatchOptionsJsonSchema: Record<
  string,
  JSONSchema4
> = {
  modifiers: buildCustomGroupModifiersJsonSchema(allModifiers),
  selector: buildCustomGroupSelectorJsonSchema(allSelectors),
}

const IMPORTS_ORDER_BY_OPTION = ['path', 'alias', 'specifier'] as const
const IMPORTS_CASING_PRIORITY_OPTION = [
  'camelCase',
  'snake_case',
  'UPPER_CASE',
  'PascalCase',
  'kebab-case',
] as const
const PARTITIONS_ORDER_BY_OPTION = ['source', 'type-first'] as const
const PARTITIONS_ORDER_STABILITY_OPTION = ['stable', 'unstable'] as const

export interface ImportsOptions {
  /**
   * Optional priority of casing styles used as a pre-sort key before the
   * configured sort comparator.
   */
  casingPriority: ImportsCasingPriorityOption[]

  /**
   * Primary key for sorting imports.
   *
   * - `'path'`: module source path.
   * - `'alias'`: first local binding identifier.
   * - `'specifier'`: first imported (source-side) identifier with alias fallback.
   */
  orderBy: ImportsOrderByOption

  /**
   * Maximum line length threshold for name-based sorting fallback. `null`
   * disables the threshold.
   */
  maxLineLength: number | null

  /**
   * Whether import declarations may be split when specifier sorting interleaves
   * sources.
   */
  splitDeclarations: boolean

  /**
   * Whether side-effect imports are sortable.
   */
  sortSideEffects: boolean
}
export interface PartitionsOptions {
  /**
   * Partition split signals.
   */
  splitBy: {
    comments: PartitionByCommentOption
    newlines: boolean
  }

  /**
   * Stability mode for partition reordering.
   */
  orderStability: PartitionsOrderStabilityOption

  /**
   * Partition ordering strategy within a group.
   */
  orderBy: PartitionsOrderByOption

  /**
   * Maximum imports per partition. `null` disables size-based splitting.
   */
  maxImports: number | null
}
export type PartitionsOrderStabilityOption =
  (typeof PARTITIONS_ORDER_STABILITY_OPTION)[number]

export type ImportsCasingPriorityOption =
  (typeof IMPORTS_CASING_PRIORITY_OPTION)[number]

export type PartitionsOrderByOption =
  (typeof PARTITIONS_ORDER_BY_OPTION)[number]
export type ImportsOrderByOption = (typeof IMPORTS_ORDER_BY_OPTION)[number]

export let importsOrderByJsonSchema: JSONSchema4 = {
  enum: [...IMPORTS_ORDER_BY_OPTION],
  type: 'string',
}

export let importsCasingPriorityJsonSchema: JSONSchema4 = {
  items: {
    enum: [...IMPORTS_CASING_PRIORITY_OPTION],
    type: 'string',
  },
  uniqueItems: true,
  type: 'array',
}

export let partitionsOrderByJsonSchema: JSONSchema4 = {
  enum: [...PARTITIONS_ORDER_BY_OPTION],
  type: 'string',
}

export let partitionsOrderStabilityJsonSchema: JSONSchema4 = {
  enum: [...PARTITIONS_ORDER_STABILITY_OPTION],
  type: 'string',
}

export const TYPE_IMPORT_FIRST_TYPE_OPTION = 'type-import-first'
