/**
 * Borrowed/adapted from: azat-io/eslint-plugin-perfectionist Source:
 * https://github.com/azat-io/eslint-plugin-perfectionist Commit:
 * 1c5682b5ee2fd855b4f5176991366dd894f750bb License: MIT Local changes:
 * imports.orderBy vNext integration, casingPriority pre-sort comparator, and
 * fork typing adjustments.
 */
import type {
  ComparatorByOptionsComputer,
  Comparator,
} from '../../utils/compare/default-comparator-by-options-computer'
import type {
  ImportsCasingPriorityOption,
  SortImportsSortingNode,
  ImportsOrderByOption,
  Options,
} from './types'
import type { CommonOptions, TypeOption } from '../../types/common-options'

import { defaultComparatorByOptionsComputer } from '../../utils/compare/default-comparator-by-options-computer'
import { buildLineLengthComparator } from '../../utils/compare/build-line-length-comparator'
import { compareAlphabetically } from '../../utils/compare/compare-alphabetically'
import { compareByCustomSort } from '../../utils/compare/compare-by-custom-sort'
import { computeOrderedValue } from '../../utils/compare/compute-ordered-value'
import { unsortedComparator } from '../../utils/compare/unsorted-comparator'
import { UnreachableCaseError } from '../../utils/unreachable-case-error'
import { compareNaturally } from '../../utils/compare/compare-naturally'

type SpecifierOrderByOption = Exclude<ImportsOrderByOption, 'path'>

let CAMEL_CASE_PATTERN = /^[a-z][\dA-Za-z]*$/u
let SNAKE_CASE_PATTERN = /^[\da-z]+(?:_[\da-z]+)+$/u
let UPPER_CASE_PATTERN = /^[\dA-Z]+(?:_[\dA-Z]+)*$/u
let PASCAL_CASE_PATTERN = /^[A-Z][\dA-Za-z]*$/u
let KEBAB_CASE_PATTERN = /^[\da-z]+(?:-[\da-z]+)+$/u

export let comparatorByOptionsComputer: ComparatorByOptionsComputer<
  Required<Options[number]>,
  SortImportsSortingNode
> = options => {
  switch (options.type) {
    case 'type-import-first':
      return (a, b) => compareTypeImportFirst(a, b, options)
    case 'subgroup-order':
    case 'alphabetical':
    case 'line-length':
    case 'unsorted':
    case 'natural':
    case 'custom':
      switch (options.imports.orderBy) {
        case 'specifier':
        case 'alias': {
          let orderBy = options.imports.orderBy as SpecifierOrderByOption

          return buildComparatorWithCasingPriority({
            comparator: bySpecifierComparatorByOptionsComputer({
              ...options,
              type: options.type,
              orderBy,
            }),
            getSortValue: node => getSpecifierNameByOrderBy(node, orderBy),
            casingPriority: options.imports.casingPriority,
          })
        }
        case 'path':
          return buildComparatorWithCasingPriority({
            comparator: defaultComparatorByOptionsComputer({
              ...options,
              type: options.type,
            }),
            casingPriority: options.imports.casingPriority,
            getSortValue: node => node.name,
          })
        /* v8 ignore next 2 -- @preserve Exhaustive guard. */
        default:
          throw new UnreachableCaseError(options.imports.orderBy)
      }
    /* v8 ignore next 2 -- @preserve Exhaustive guard. */
    default:
      throw new UnreachableCaseError(options.type)
  }
}

/**
 * Compares two import nodes to sort type imports before regular imports.
 *
 * When both nodes are type imports or both are regular imports, returns 0
 * (equal). Otherwise, sorts type imports first based on the order option.
 *
 * @param a - The first import sorting node.
 * @param b - The second import sorting node.
 * @param options - Options containing the sort order.
 * @returns A negative number if a should come first, positive if b should.
 */
function compareTypeImportFirst(
  a: SortImportsSortingNode,
  b: SortImportsSortingNode,
  options: Pick<CommonOptions, 'order'>,
): number {
  if (a.isTypeImport && b.isTypeImport) {
    return 0
  }
  if (!a.isTypeImport && !b.isTypeImport) {
    return 0
  }

  return computeOrderedValue(a.isTypeImport ? -1 : 1, options.order)
}

let bySpecifierComparatorByOptionsComputer: ComparatorByOptionsComputer<
  {
    orderBy: SpecifierOrderByOption
    type: TypeOption
  } & Omit<Required<Options[number]>, 'type'>,
  SortImportsSortingNode
> = options => {
  switch (options.type) {
    /* v8 ignore next 2 -- @preserve Untested for now as not a relevant sort for this rule. */
    case 'subgroup-order':
      return defaultComparatorByOptionsComputer(options)
    case 'alphabetical':
      return (a, b) =>
        compareAlphabetically(
          getSpecifierNameByOrderBy(a, options.orderBy),
          getSpecifierNameByOrderBy(b, options.orderBy),
          options,
        )
    case 'line-length':
      return buildLineLengthComparator(options)
    case 'unsorted':
      return unsortedComparator
    case 'natural':
      return (a, b) =>
        compareNaturally(
          getSpecifierNameByOrderBy(a, options.orderBy),
          getSpecifierNameByOrderBy(b, options.orderBy),
          options,
        )
    case 'custom':
      return (a, b) =>
        compareByCustomSort(
          getSpecifierNameByOrderBy(a, options.orderBy),
          getSpecifierNameByOrderBy(b, options.orderBy),
          options,
        )
    /* v8 ignore next 2 -- @preserve Exhaustive guard. */
    default:
      throw new UnreachableCaseError(options.type)
  }
}

function buildComparatorWithCasingPriority({
  casingPriority,
  getSortValue,
  comparator,
}: {
  getSortValue(node: SortImportsSortingNode): string
  comparator: Comparator<SortImportsSortingNode>
  casingPriority?: ImportsCasingPriorityOption[]
}): Comparator<SortImportsSortingNode> {
  let normalizedCasingPriority = casingPriority ?? []

  if (normalizedCasingPriority.length === 0) {
    return comparator
  }

  let priorityByCasing = new Map(
    normalizedCasingPriority.map((casing, index) => [casing, index]),
  )

  return (a, b) => {
    let leftPriority = getCasingPriorityRank(
      getSortValue(a),
      priorityByCasing,
      normalizedCasingPriority.length,
    )
    let rightPriority = getCasingPriorityRank(
      getSortValue(b),
      priorityByCasing,
      normalizedCasingPriority.length,
    )
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority
    }

    return comparator(a, b)
  }
}

function getCasingKind(value: string): ImportsCasingPriorityOption | null {
  if (SNAKE_CASE_PATTERN.test(value)) {
    return 'snake_case'
  }
  if (KEBAB_CASE_PATTERN.test(value)) {
    return 'kebab-case'
  }
  if (UPPER_CASE_PATTERN.test(value) && /[A-Z]/u.test(value)) {
    return 'UPPER_CASE'
  }
  if (CAMEL_CASE_PATTERN.test(value) && /[A-Z]/u.test(value)) {
    return 'camelCase'
  }
  if (PASCAL_CASE_PATTERN.test(value) && /[a-z]/u.test(value)) {
    return 'PascalCase'
  }
  return null
}

function getCasingPriorityRank(
  value: string,
  priorityByCasing: Map<ImportsCasingPriorityOption, number>,
  fallbackPriority: number,
): number {
  let casing = getCasingKind(value)
  if (!casing) {
    return fallbackPriority
  }
  return priorityByCasing.get(casing) ?? fallbackPriority
}

function getSpecifierNameByOrderBy(
  node: SortImportsSortingNode,
  orderBy: SpecifierOrderByOption,
): string {
  return orderBy === 'specifier' ?
      (node.sourceSpecifierName ?? node.specifierName ?? '')
    : (node.specifierName ?? '')
}
