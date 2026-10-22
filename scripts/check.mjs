import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)

function runNode(entry, args, cwd, expectedStatus = 0) {
  const result = spawnSync(process.execPath, [entry, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 60_000,
    windowsHide: true,
  })
  assert.ifError(result.error)
  assert.equal(
    result.status,
    expectedStatus,
    `${entry} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`,
  )
  return `${result.stdout}${result.stderr}`
}

function cliEntry(name) {
  const manifestPath = require.resolve(`${name}/package.json`)
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  return resolve(dirname(manifestPath), manifest.bin[name])
}

function writeFixture(directory, name, content) {
  const path = join(directory, name)
  writeFileSync(path, content)
  return path
}

const temporaryRoot = mkdtempSync(join(tmpdir(), 'waset-oxc-smoke-'))
try {
  let archive = process.argv[2] && resolve(process.argv[2])
  if (!archive) {
    assert(process.env.npm_execpath, 'Run with pnpm smoke, or pass the path to a packed .tgz')
    const packedDirectory = join(temporaryRoot, 'packed')
    mkdirSync(packedDirectory)
    // pnpm 可以是 Node 脚本，也可以是独立可执行文件。
    const pnpmEntry = process.env.npm_execpath
    assert(!pnpmEntry.endsWith('.cmd'), 'Pass a packed .tgz when pnpm uses a Windows .cmd shim')
    const args = ['pack', '--pack-destination', packedDirectory]
    if (['.js', '.mjs', '.cjs'].includes(extname(pnpmEntry))) {
      runNode(pnpmEntry, args, packageRoot)
    } else {
      execFileSync(pnpmEntry, args, { cwd: packageRoot, stdio: 'pipe', timeout: 60_000 })
    }
    const archives = readdirSync(packedDirectory).filter(name => name.endsWith('.tgz'))
    assert.equal(archives.length, 1, 'Expected one packed package')
    archive = join(packedDirectory, archives[0])
  }

  const consumer = join(temporaryRoot, '消费 项目 中文')
  const installedPackage = join(consumer, 'node_modules', '@waset', 'oxc-config')
  const unpacked = join(temporaryRoot, 'unpacked')
  mkdirSync(unpacked)
  // 避免 Windows tar 的参数编码限制，中文消费路径由 Node 创建和移动。
  copyFileSync(archive, join(unpacked, 'archive.tgz'))
  execFileSync('tar', ['-xzf', 'archive.tgz', '--strip-components=1'], { cwd: unpacked })
  rmSync(join(unpacked, 'archive.tgz'))
  mkdirSync(dirname(installedPackage), { recursive: true })
  renameSync(unpacked, installedPackage)
  writeFixture(consumer, 'package.json', '{"private":true,"type":"module"}\n')
  const manifest = JSON.parse(readFileSync(join(installedPackage, 'package.json'), 'utf8'))
  assert.equal(manifest.name, '@waset/oxc-config')
  assert.equal(
    Object.keys(manifest.dependencies ?? {}).length,
    0,
    'Presets must not install runtime dependencies',
  )
  for (const entry of Object.values(manifest.exports)) {
    assert(entry.types && entry.default, 'Every preset needs runtime and type exports')
    assert(readFileSync(resolve(installedPackage, entry.types)).length > 0)
    assert(readFileSync(resolve(installedPackage, entry.default)).length > 0)
  }

  const imports = writeFixture(
    consumer,
    'imports.mjs',
    `import assert from 'node:assert/strict'
import base from '@waset/oxc-config/oxlint'
import vue from '@waset/oxc-config/oxlint/vue'
import format from '@waset/oxc-config/oxfmt'
assert(base.rules && !base.plugins.includes('vue'))
assert(vue.rules && vue.plugins.includes('vue'))
assert.equal(typeof format, 'object')
`,
  )
  runNode(imports, [], consumer)

  const lintConfig = writeFixture(
    consumer,
    'oxlint.config.ts',
    `import vue from '@waset/oxc-config/oxlint/vue'
// 复现 Nuxt 生成助手的合并方式，不为配置包引入 Nuxt 依赖。
function withNuxt(config) {
  return {
    ...config,
    plugins: config.plugins ?? ['typescript', 'oxc', 'import', 'vue', 'promise'],
    globals: { useNuxtApp: 'readonly', projectOnly: 'off', ...config.globals },
  }
}
export default withNuxt({
  ...vue,
  env: { node: true },
  globals: { ...vue.globals, projectOnly: 'readonly' },
})
`,
  )
  const oxlint = cliEntry('oxlint')
  const effective = JSON.parse(runNode(oxlint, ['-c', lintConfig, '--print-config'], consumer))
  assert(effective.plugins.includes('vue'))
  assert.equal(effective.globals.useNuxtApp, 'readonly')
  assert.equal(effective.globals.projectOnly, 'readonly')
  assert.equal(effective.globals.defineProps, 'readonly')
  assert.equal(effective.env.node, true)
  assert.equal(effective.categories.correctness, 'allow')

  const validVue = `<script setup lang="ts">
defineProps<{ label?: string }>()
useNuxtApp()
void projectOnly
</script>
<template><div /></template>
`
  const validPath = writeFixture(consumer, '有效 组件.vue', validVue)
  runNode(oxlint, ['-c', lintConfig, '-f', 'json', validPath], consumer)
  assert.equal(readFileSync(validPath, 'utf8'), validVue, 'Lint must not modify source files')

  const invalidVue = writeFixture(
    consumer,
    '无效 组件.vue',
    `<script setup lang="ts">
import { defineProps } from 'vue'
defineProps<{ label?: string }>()
</script>
<template><div /></template>
`,
  )
  const vueDiagnostic = runNode(oxlint, ['-c', lintConfig, '-f', 'json', invalidVue], consumer, 1)
  assert(
    vueDiagnostic.includes('no-import-compiler-macros'),
    'Native Vue rules must report violations',
  )
  const undefinedGlobal = writeFixture(consumer, '未知 全局.ts', 'unknownRuntime()\n')
  const globalDiagnostic = runNode(
    oxlint,
    ['-c', lintConfig, '-f', 'json', undefinedGlobal],
    consumer,
    1,
  )
  assert(
    globalDiagnostic.includes('no-undef'),
    'Nuxt globals must not disable unknown-global checks',
  )

  writeFixture(
    consumer,
    'oxfmt.config.ts',
    `import format from '@waset/oxc-config/oxfmt'
export default { ...format, endOfLine: 'lf' }
`,
  )
  const unformatted = 'const value={text:"中文",numbers:[1,2]};\n'
  const formatPath = writeFixture(consumer, '格式 验证.ts', unformatted)
  const oxfmt = cliEntry('oxfmt')
  runNode(oxfmt, ['--check', formatPath], consumer, 1)
  assert.equal(
    readFileSync(formatPath, 'utf8'),
    unformatted,
    '--check must not modify source files',
  )
  runNode(oxfmt, ['--write', formatPath], consumer)
  assert.equal(
    readFileSync(formatPath, 'utf8'),
    "const value = { text: '中文', numbers: [1, 2] }\n",
  )
  runNode(oxfmt, ['--check', formatPath], consumer)
  process.stdout.write('Packed exports, Vue rules, Nuxt globals and Unicode paths passed.\n')
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
}
