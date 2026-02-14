/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * maintained and adapted in this fork; see git history for file-specific
 * modifications.
 */
import type { CommonGroupsOptions } from '../../types/common-groups-options'
import type { Comparator } from './default-comparator-by-options-computer'
import type { AllCommonOptions } from '../../types/all-common-options'
import type { SortingNode } from '../../types/sorting-node'

import { isGroupWithOverridesOption } from '../is-group-with-overrides-option'
import { isNewlinesBetweenOption } from '../is-newlines-between-option'
import { UnreachableCaseError } from '../unreachable-case-error'
import { computeOrderedValue } from './compute-ordered-value'

export function buildSubgroupOrderComparator({
  groups,
  order,
}: Pick<
  AllCommonOptions<string, unknown, unknown>,
  'groups' | 'order'
>): Comparator<SortingNode> {
  return (a, b) => {
    let subgroupContainingA = computeSubgroupContainingNode(a, groups)
    let subgroupContainingB = computeSubgroupContainingNode(b, groups)

    if (
      !subgroupContainingA ||
      !subgroupContainingB ||
      subgroupContainingA !== subgroupContainingB
    ) {
      return 0
    }

    let indexOfAInSubgroup = subgroupContainingA.indexOf(a.group)
    let indexOfBInSubgroup = subgroupContainingB.indexOf(b.group)

    let result = indexOfAInSubgroup - indexOfBInSubgroup
    return computeOrderedValue(result, order)
  }
}

function computeSubgroupContainingNode(
  sortingNode: SortingNode,
  groups: CommonGroupsOptions<string, unknown, unknown>['groups'],
): string[] | null {
  for (let group of groups) {
    if (isNewlinesBetweenOption(group)) {
      continue
    }
    if (typeof group === 'string' || Array.isArray(group)) {
      if (doesStringSubgroupContainsNode(sortingNode, group)) {
        return group
      }
      continue
    }
    /* v8 ignore else -- @preserve Exhaustive guard for unsupported group option. */
    if (isGroupWithOverridesOption(group)) {
      if (doesStringSubgroupContainsNode(sortingNode, group.group)) {
        return group.group
      }
      continue
    }

    /* v8 ignore next -- @preserve Exhaustive guard for unsupported group option. */
    throw new UnreachableCaseError(group)
  }

  return null
}

function doesStringSubgroupContainsNode(
  sortingNode: SortingNode,
  subgroup: string[] | string,
): subgroup is string[] {
  if (typeof subgroup === 'string') {
    return false
  }
  return subgroup.includes(sortingNode.group)
}
