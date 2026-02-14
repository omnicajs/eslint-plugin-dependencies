import type { Config } from 'stylelint'

export default {
  extends: '@azat-io/stylelint-config',
  ignoreFiles: ['coverage/**/*'],
} satisfies Config
