import config from './oxlint/index.mjs'
import vueConfig from './oxlint/vue.mjs'

export default {
  ...config,
  env: { node: true },
  overrides: [
    {
      files: ['examples/**/*.vue'],
      plugins: vueConfig.plugins,
      rules: vueConfig.rules,
      globals: vueConfig.globals,
      env: { browser: true, node: false },
    },
  ],
}
