import { execFileSync, spawnSync } from 'node:child_process'
import { chmodSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = fileURLToPath(new URL('../', import.meta.url))
const marker = '# @waset/oxc-config managed pre-commit hook'

function install() {
  if (process.env.CI) return

  const repository = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: packageRoot,
    encoding: 'utf8',
    windowsHide: true,
  })
  if (repository.status !== 0) return
  // 仅安装当前仓库的开发钩子，不影响把配置包作为依赖安装的项目。
  if (realpathSync(repository.stdout.trim()) !== realpathSync(packageRoot)) return

  const customPath = spawnSync('git', ['config', '--get', 'core.hooksPath'], {
    cwd: packageRoot,
    encoding: 'utf8',
    windowsHide: true,
  })
  if (customPath.status === 0) {
    process.stdout.write(
      '保留现有 core.hooksPath；请在现有 pre-commit 中调用 node scripts/pre-commit.mjs。\n',
    )
    return
  }

  const hookPath = resolve(
    packageRoot,
    execFileSync('git', ['rev-parse', '--git-path', 'hooks/pre-commit'], {
      cwd: packageRoot,
      encoding: 'utf8',
      windowsHide: true,
    }).trim(),
  )
  const current = lstatSync(hookPath, { throwIfNoEntry: false })
  if (
    current &&
    (current.isSymbolicLink() ||
      !readFileSync(hookPath, 'utf8').startsWith(`#!/bin/sh\n${marker}\n`))
  ) {
    process.stdout.write('保留现有 pre-commit；请在其中调用 node scripts/pre-commit.mjs。\n')
    return
  }

  // 固定安装时的 Node 路径，让 GUI 提交也能运行；兼容 Windows 和路径中的单引号。
  const nodePath =
    process.platform === 'win32' ? process.execPath.replaceAll('\\', '/') : process.execPath
  const quotedNode = `'${nodePath.replaceAll("'", "'\\''")}'`
  mkdirSync(dirname(hookPath), { recursive: true })
  writeFileSync(hookPath, `#!/bin/sh\n${marker}\nexec ${quotedNode} scripts/pre-commit.mjs\n`, {
    mode: 0o755,
  })
  chmodSync(hookPath, 0o755)
}

install()
