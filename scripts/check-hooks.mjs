import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = fileURLToPath(new URL('../', import.meta.url))
const temporary = mkdtempSync(join(tmpdir(), 'waset-oxc-hooks-'))
const repository = join(temporary, '提交 仓库')
const env = {
  ...process.env,
  CI: '',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: join(temporary, 'gitconfig'),
}
// 隔离调用者的仓库、临时 index 和配置，所有真实提交只发生在测试仓库。
for (const name of [
  'GIT_DIR',
  'GIT_COMMON_DIR',
  'GIT_WORK_TREE',
  'GIT_INDEX_FILE',
  'GIT_CONFIG_COUNT',
  'GIT_CONFIG_PARAMETERS',
]) {
  delete env[name]
}

function run(command, args, expectedStatus = 0, extraEnv = {}) {
  const result = spawnSync(command, args, {
    cwd: repository,
    env: { ...env, ...extraEnv },
    encoding: 'utf8',
    timeout: 60_000,
    windowsHide: true,
  })
  assert.ifError(result.error)
  assert.equal(
    result.status,
    expectedStatus,
    `${command} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`,
  )
  return result.stdout
}

const git = (...args) => run('git', args)
const install = (extraEnv = {}) => run(process.execPath, ['scripts/install-hooks.mjs'], 0, extraEnv)

try {
  mkdirSync(join(repository, 'scripts'), { recursive: true })
  for (const name of ['oxlint', 'oxfmt', 'oxlint.config.mjs', 'oxfmt.config.mjs']) {
    cpSync(join(packageRoot, name), join(repository, name), { recursive: true })
  }
  for (const name of ['install-hooks.mjs', 'pre-commit.mjs']) {
    cpSync(join(packageRoot, 'scripts', name), join(repository, 'scripts', name))
  }
  writeFileSync(join(repository, 'package.json'), '{\n  "private": true\n}\n')
  writeFileSync(join(repository, '.gitignore'), 'node_modules\n')
  symlinkSync(
    realpathSync(join(packageRoot, 'node_modules')),
    join(repository, 'node_modules'),
    process.platform === 'win32' ? 'junction' : 'dir',
  )
  git('init', '-q')
  git('config', 'user.name', 'Oxc Hook Check')
  git('config', 'user.email', 'hook-check@example.invalid')
  git('config', 'commit.gpgsign', 'false')
  git('config', 'core.autocrlf', 'false')
  const hookPath = join(repository, '.git', 'hooks', 'pre-commit')
  install({ CI: 'true' })
  assert(!existsSync(hookPath), 'CI must not install hooks')
  const installOutput = install()
  assert(existsSync(hookPath), `Expected pre-commit to be installed. ${installOutput}`)
  const installed = readFileSync(hookPath, 'utf8')
  assert(!installed.includes('\r'), 'Hooks must use LF on every platform')
  install()
  assert.equal(readFileSync(hookPath, 'utf8'), installed, 'Installation must be idempotent')

  const customHook = '#!/bin/sh\n# existing user hook\nexit 0\n'
  writeFileSync(hookPath, customHook)
  install()
  assert.equal(readFileSync(hookPath, 'utf8'), customHook, 'Existing pre-commit must be preserved')
  git('config', 'core.hooksPath', 'custom-hooks')
  install()
  assert.equal(git('config', '--get', 'core.hooksPath').trim(), 'custom-hooks')
  assert.equal(readFileSync(hookPath, 'utf8'), customHook)
  git('config', '--unset', 'core.hooksPath')
  writeFileSync(hookPath, installed)

  const fileName = 'renovate 配置.json'
  const filePath = join(repository, fileName)
  const formatted = enabled => `{\n  "enabled": ${enabled}\n}\n`
  writeFileSync(filePath, formatted(true))
  git('add', '--all')
  git('commit', '-qm', 'Initial valid snapshot')
  const originalHead = git('rev-parse', 'HEAD')
  const originalStashes = git('stash', 'list')

  // index 中的坏格式不能被工作区中的修复掩盖。
  const unformatted = '{"enabled":true}\n'
  writeFileSync(filePath, unformatted)
  git('add', '--', fileName)
  writeFileSync(filePath, formatted(true))
  run('git', ['commit', '-qm', 'Reject staged formatting'], 1)
  assert.equal(git('rev-parse', 'HEAD'), originalHead)
  assert.equal(git('show', `:${fileName}`), unformatted)
  assert.equal(readFileSync(filePath, 'utf8'), formatted(true))
  assert.equal(git('stash', 'list'), originalStashes)

  // 工作区尚未暂存的修改不应阻止正确的暂存内容提交。
  writeFileSync(filePath, formatted(false))
  git('add', '--', fileName)
  const unstaged = '{"enabled":false}\n'
  writeFileSync(filePath, unstaged)
  git('commit', '-qm', 'Accept staged snapshot')
  assert.equal(git('show', `HEAD:${fileName}`), formatted(false))
  assert.equal(git('show', `:${fileName}`), formatted(false))
  assert.equal(readFileSync(filePath, 'utf8'), unstaged)
  assert.equal(git('stash', 'list'), originalStashes)

  const nested = join(repository, 'nested-package')
  mkdirSync(join(nested, 'scripts'), { recursive: true })
  cpSync(
    join(packageRoot, 'scripts', 'install-hooks.mjs'),
    join(nested, 'scripts', 'install-hooks.mjs'),
  )
  run(process.execPath, ['nested-package/scripts/install-hooks.mjs'])
  assert.equal(
    readFileSync(hookPath, 'utf8'),
    installed,
    'Dependencies must not install hooks in their parent repository',
  )
  process.stdout.write('Hook installation and real staged commits passed.\n')
} finally {
  rmSync(temporary, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
}
