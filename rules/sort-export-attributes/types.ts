/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes: maintained and adapted in this fork; see git history for file-specific modifications.
 */
import type { TSESTree } from '@typescript-eslint/types'

import type { PartitionByCommentOption } from '../../types/common-partition-options'
import type { CommonGroupsOptions } from '../../types/common-groups-options'
import type { CommonOptions, TypeOption } from '../../types/common-options'
import type { SortingNode } from '../../types/sorting-node'

export type Options = Partial<
  {
    /**
     * VNext partition configuration.
     *
     * - `'merge'` disables partition boundaries and sorts as a single block.
     * - object configuration controls how partitions are detected.
     */
    partitions: PartitionsOptions | 'merge'
  } & CommonGroupsOptions<
    TypeOption,
    AdditionalSortOptions,
    CustomGroupMatchOptions
  > &
    CommonOptions<TypeOption>
>[]

export interface PartitionsOptions {
  /**
   * Partition split signals.
   */
  splitBy: {
    comments: PartitionByCommentOption
    newlines: boolean
  }
}

export type SortExportAttributesSortingNode =
  SortingNode<TSESTree.ImportAttribute>

/**
 * Match options for a custom group.
 */
type CustomGroupMatchOptions = object

type AdditionalSortOptions = object
