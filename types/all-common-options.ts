/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source: https://github.com/azat-io/eslint-plugin-perfectionist
 * Commit: 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes: maintained and adapted in this fork; see git history for file-specific modifications.
 */
import type { CommonPartitionOptions } from './common-partition-options'
import type { CommonGroupsOptions } from './common-groups-options'
import type { CommonOptions } from './common-options'

export type AllCommonOptions<
  CustomTypeOption extends string,
  AdditionalSortOptions,
  CustomGroupMatchOptions,
> = CommonGroupsOptions<
  CustomTypeOption,
  AdditionalSortOptions,
  CustomGroupMatchOptions
> &
  CommonOptions<CustomTypeOption, AdditionalSortOptions> &
  CommonPartitionOptions
