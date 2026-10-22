# @waset/oxc-config

团队共享的原生 Oxlint 与 Oxfmt 配置，提供 JavaScript、TypeScript、Vue 校验和多种文件格式化。预设不加载额外的 ESLint 插件，不接管框架编译流程。

## 安装与接入

目前可以通过 GitHub 源安装：

```sh
pnpm add -D @waset/oxc-config@github:waset/oxc-config#b949894881138dd19063654fc3a5b552d9dd63d9 oxlint@1.89.0 oxfmt@0.74.0
```

安装示例固定到已验证的 [提交 b949894](https://github.com/waset/oxc-config/commit/b949894881138dd19063654fc3a5b552d9dd63d9)。升级时替换为团队验证后的提交 SHA。只使用其中一个工具时，只需安装相应的 Oxlint 或 Oxfmt。

| 入口                           | 内容                                    |
| ------------------------------ | --------------------------------------- |
| `@waset/oxc-config/oxlint`     | JavaScript、TypeScript 等通用原生规则   |
| `@waset/oxc-config/oxlint/vue` | 通用规则与 Vue 原生规则、编译宏 globals |
| `@waset/oxc-config/oxfmt`      | 单引号、无分号、两空格缩进等格式选项    |

这三个入口导出普通配置对象，使用展开语法合并。路径、忽略目录、项目 globals 和框架集成由消费项目维护；数组和嵌套对象按需显式合并。

### JavaScript / TypeScript 项目

`oxlint.config.ts`：

```ts
import config from '@waset/oxc-config/oxlint'

export default {
  ...config,
  env: { node: true },
  ignorePatterns: ['dist/**'],
}
```

Vue 项目将导入路径改为 `@waset/oxc-config/oxlint/vue`，并根据运行环境设置 `env`。Vue 校验范围以 Oxlint 当前支持的原生规则为准。

`oxfmt.config.ts`：

```ts
import config from '@waset/oxc-config/oxfmt'

export default {
  ...config,
  ignorePatterns: ['dist/**', 'pnpm-lock.yaml'],
}
```

相应的项目脚本可以使用：

```json
{
  "scripts": {
    "lint": "oxlint -c oxlint.config.ts .",
    "format": "oxfmt .",
    "format:check": "oxfmt --check ."
  }
}
```

### Nuxt 项目

已有 `oxc-nuxt` 集成的项目，保留 `nuxt prepare` 生成的本地 `withNuxt` 助手，将共享预设传入：

```ts
import config from '@waset/oxc-config/oxlint/vue'
import { withNuxt } from './.nuxt/oxlint.mjs'

export default withNuxt({
  ...config,
  env: { browser: true, node: true },
  globals: {
    ...config.globals,
    projectFeature: 'readonly',
  },
  ignorePatterns: ['.nuxt/**', '.output/**', 'dist/**'],
})
```

先执行项目现有的 `nuxt prepare`，再运行检查。共享包不提供 `.nuxt/oxlint.mjs`；Nuxt 自动导入 globals、Vue 编译器和 `vue-tsc` 类型检查继续由项目自身负责。

## 维护这个仓库

```sh
git clone https://github.com/waset/oxc-config.git
cd oxc-config
pnpm install
```

`prepare` 会调用 simple-git-hooks 自动初始化本仓库 hooks。安装完成后：

- `git commit` 自动运行 lint-staged：对暂存的脚本和 Vue 文件依次尝试 Oxlint 修复、Oxfmt 格式化和 Oxlint 复检；其他匹配的文件进行格式化。修复后的内容会进入暂存区。
- `git push` 自动执行全仓 `pnpm lint` 与 `pnpm format:check`。无法自动修复的错误或仍未统一的格式会阻止相应操作。
- 本地 hooks 独立于 GitHub Actions；Git 的 `--no-verify` 可以绕过本地检查。CI 继续验证完整仓库。

| 命令                | 用途                               |
| ------------------- | ---------------------------------- |
| `pnpm lint`         | 全仓校验                           |
| `pnpm lint:fix`     | 修复可自动处理的规则问题           |
| `pnpm format`       | 格式化支持的文件                   |
| `pnpm format:check` | 只检查格式                         |
| `pnpm smoke`        | 验证打包入口、Vue 规则与跨平台路径 |

这些 hooks 是本仓库的开发配置；消费项目需要维护自己的提交策略。

## 示例与编辑器体验

安装 VS Code 推荐的 [Oxc 扩展](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode)，打开仓库后即可使用已提交的工作区设置：输入时校验、保存时修复与格式化。

| 示例                                      | 展示内容                                   |
| ----------------------------------------- | ------------------------------------------ |
| [lint.js](examples/lint.js)               | 函数、数组，以及可取消注释的错误与警告     |
| [types.ts](examples/types.ts)             | interface、可选属性、类型注解              |
| [component.vue](examples/component.vue)   | script setup、可选 props、事件、模板和样式 |
| [data.json](examples/data.json)           | JSON 对象与数组                            |
| [settings.jsonc](examples/settings.jsonc) | 带注释和尾逗号的配置                       |
| [pipeline.yaml](examples/pipeline.yaml)   | YAML 映射和任务列表                        |
| [page.html](examples/page.html)           | HTML 元素与属性                            |
| [styles.css](examples/styles.css)         | CSS 规则和声明                             |
| [theme.scss](examples/theme.scss)         | SCSS 变量与嵌套                            |
| [guide.md](examples/guide.md)             | Markdown 标题、表格、列表和代码块          |

实际示例全部保持检查通过。可以进行以下体验，结束后恢复注释：

1. 在 `lint.js` 取消 `debugger` 的注释，查看 `no-debugger` 错误。
2. 取消 `console.log(greetings)` 的注释，查看 `no-console` 警告。警告默认不会阻止提交；修复后仍存在的错误会阻止提交。
3. 在 `component.vue` 取消 `import { defineProps } from 'vue'` 的注释，查看 `vue/no-import-compiler-macros` 错误。

规则诊断显示在编辑器和 Problems 面板中。格式差异由 Oxfmt 在保存或“格式化文档”时处理，缩进、引号等差异不会单独显示为 Oxlint 波浪线。JSON、YAML、HTML、样式和 Markdown 示例主要展示格式化。

## 格式化前后

下面的 before 使用 `text` 代码块保留输入原貌。复制到相应文件后保存，或运行 `pnpm format`，即可查看变化。

JavaScript / TypeScript，before：

```text
const labels=["校验","格式化"];
```

after：

```ts
const labels = ['校验', '格式化']
```

JSON，before：

```text
{
"name":"团队工具箱",
"enabled":true,
"tasks":["校验","格式化"]
}
```

after：

```json
{
  "name": "团队工具箱",
  "enabled": true,
  "tasks": ["校验", "格式化"]
}
```

Vue 模板，before：

```text
<template>
<button type = "button">保存</button>
</template>
```

after：

```vue
<template>
  <button type="button">保存</button>
</template>
```
