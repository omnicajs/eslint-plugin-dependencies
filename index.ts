import type { ESLint, Linter } from 'eslint'

import { version as packageVersion, name as packageName } from './package.json'
import separateTypePartitions from './rules/separate-type-partitions'
import sortImportAttributes from './rules/sort-import-attributes'
import sortExportAttributes from './rules/sort-export-attributes'
import separateTypeImports from './rules/separate-type-imports'
import sortNamedImports from './rules/sort-named-imports'
import sortNamedExports from './rules/sort-named-exports'
import importStyle from './rules/import-style'
import sortImports from './rules/sort-imports'
import sortExports from './rules/sort-exports'

interface PluginConfigs extends Record<
  string,
  Linter.LegacyConfig | Linter.Config[] | Linter.Config
> {
  'recommended-alphabetical-legacy': Linter.LegacyConfig
  'recommended-line-length-legacy': Linter.LegacyConfig
  'recommended-natural-legacy': Linter.LegacyConfig
  'recommended-custom-legacy': Linter.LegacyConfig
  'recommended-alphabetical': Linter.Config
  'recommended-line-length': Linter.Config
  'recommended-natural': Linter.Config
  'recommended-custom': Linter.Config
}

interface BaseOptions {
  type: 'alphabetical' | 'line-length' | 'natural' | 'custom'
  order: 'desc' | 'asc'
}

let pluginName = 'dependencies'

export let rules = {
  'separate-type-partitions': separateTypePartitions,
  'sort-import-attributes': sortImportAttributes,
  'sort-export-attributes': sortExportAttributes,
  'separate-type-imports': separateTypeImports,
  'sort-named-imports': sortNamedImports,
  'sort-named-exports': sortNamedExports,
  'import-style': importStyle,
  'sort-imports': sortImports,
  'sort-exports': sortExports,
} as unknown as ESLint.Plugin['rules']

let plugin = {
  meta: {
    version: packageVersion,
    name: packageName,
  },
  rules,
} as unknown as ESLint.Plugin

function getRules(options: BaseOptions): Linter.RulesRecord {
  return Object.fromEntries(
    Object.keys(plugin.rules!).map(ruleName => [
      `${pluginName}/${ruleName}`,
      ['error', options],
    ]),
  )
}

function createConfig(options: BaseOptions): Linter.Config {
  return {
    plugins: {
      [pluginName]: plugin,
    },
    rules: getRules(options),
  }
}

function createLegacyConfig(options: BaseOptions): Linter.LegacyConfig {
  return {
    rules: getRules(options),
    plugins: [pluginName],
  }
}

export let configs: PluginConfigs = {
  'recommended-alphabetical-legacy': createLegacyConfig({
    type: 'alphabetical',
    order: 'asc',
  }),
  'recommended-line-length-legacy': createLegacyConfig({
    type: 'line-length',
    order: 'desc',
  }),
  'recommended-natural-legacy': createLegacyConfig({
    type: 'natural',
    order: 'asc',
  }),
  'recommended-custom-legacy': createLegacyConfig({
    type: 'custom',
    order: 'asc',
  }),
  'recommended-alphabetical': createConfig({
    type: 'alphabetical',
    order: 'asc',
  }),
  'recommended-line-length': createConfig({
    type: 'line-length',
    order: 'desc',
  }),
  'recommended-natural': createConfig({
    type: 'natural',
    order: 'asc',
  }),
  'recommended-custom': createConfig({
    type: 'custom',
    order: 'asc',
  }),
}

export default {
  ...plugin,
  configs,
} as { configs: PluginConfigs } & ESLint.Plugin
