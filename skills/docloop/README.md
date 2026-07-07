# docloop skill

面向 AI 协作开发的项目文档维护机制：**truth / now / past 三层 + 变更单裁决 + 体积预算体检**。管"知识住在哪、怎么流动、怎么老化"；单任务推进推荐搭配 [sdd-riper](https://github.com/huisezhiyin/sdd-riper)（不装也能用）。

## 组成

| 路径 | 内容 |
|---|---|
| `SKILL.md` | 常驻内核：三层模型、五不变量、预算、仪式路由 |
| `references/rituals/` | 五个仪式：装机 init / 接上游 upstream / 记变更 change / 开迭代·结算 iterate / 体检 lint |
| `references/templates/` | 全套模板：iteration / task / change(CH) / digest / items / summary / sources-index / agents-md |
| `scripts/docloop_lint.mjs` | 七项体检脚本（零依赖 Node ≥18） |
| `agents/openai.yaml` | Codex 适配 |

## 快速开始

装好 skill 后对 agent 说：

```
用 docloop 给这个项目装上文档机制（init）。
```

机制设计的完整真相在 docloop 仓库的 `docs/truth/mechanism/`——skill 是它的发行版，truth 为准。
