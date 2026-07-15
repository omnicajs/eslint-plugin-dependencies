import { describe, expect, it } from 'vitest'
import { ESLint } from 'eslint'
import dedent from 'dedent'

import plugin from '../index'

describe('plugin', () => {
  let eslint = new ESLint({
    overrideConfig: plugin.configs['recommended-natural'],
    overrideConfigFile: true,
  })

  it('reports unsorted imports through the flat recommended config', async () => {
    let [result] = await eslint.lintText(
      dedent`
        import z from 'z'
        import a from 'a'
      `,
      { filePath: 'fixture.js' },
    )

    expect(result?.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: 'dependencies/sort-imports',
        }),
      ]),
    )
  })

  it('accepts sorted imports through the flat recommended config', async () => {
    let [result] = await eslint.lintText(
      dedent`
        import a from 'a'
        import z from 'z'
      `,
      { filePath: 'fixture.js' },
    )

    expect(result?.messages).toEqual([])
  })
})
