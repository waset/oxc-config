import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

const repository = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
  windowsHide: true,
}).trim()
const temporary = mkdtempSync(join(tmpdir(), 'waset-oxc-index-'))

try {
  // 读取 Git 正在提交的 index，完整保留用户的部分暂存状态。
  const prefix = `${temporary.replaceAll('\\', '/')}/`
  execFileSync(
    'git',
    ['checkout-index', '--all', '--ignore-skip-worktree-bits', `--prefix=${prefix}`],
    {
      cwd: repository,
      stdio: 'inherit',
      windowsHide: true,
    },
  )
  symlinkSync(
    realpathSync(join(repository, 'node_modules')),
    join(temporary, 'node_modules'),
    process.platform === 'win32' ? 'junction' : 'dir',
  )

  const require = createRequire(join(repository, 'package.json'))
  for (const [name, args] of [
    ['oxlint', ['-c', 'oxlint.config.mjs', '.']],
    ['oxfmt', ['-c', 'oxfmt.config.mjs', '--check', '.']],
  ]) {
    const manifestPath = require.resolve(`${name}/package.json`)
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    const entry = resolve(dirname(manifestPath), manifest.bin[name])
    // 直接执行 Node 入口，避免 Windows .cmd 和 shell 对文件路径的二次解析。
    const result = spawnSync(process.execPath, [entry, ...args], {
      cwd: temporary,
      stdio: 'inherit',
      windowsHide: true,
    })
    if (result.error) throw result.error
    if (result.status !== 0) {
      process.exitCode = result.status ?? 1
      break
    }
  }
} catch (error) {
  process.stderr.write(`提交检查失败：${error.message}\n请确认已经运行 pnpm install。\n`)
  process.exitCode = 1
} finally {
  rmSync(temporary, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
}
