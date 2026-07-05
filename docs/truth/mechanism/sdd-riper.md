# 与 sdd-riper 的分工与落点映射

> 上级：[总述](README.md)。docloop 依赖 [sdd-riper](https://github.com/huisezhiyin/sdd-riper)：**sdd-riper 管"一个任务怎么推进"**（RIPER 阶段、门禁、证据验收、Reverse Sync），**docloop 管"知识住在哪、怎么流动、怎么老化"**。两者是同一套方法论的两件套。

## 调研结论：路径可重映射（2026-07-04 核实）

sdd-riper 的 `mydocs/*` 路径**只是默认建议，不是硬编码逻辑**：

1. skill 的 `project-sync-boundary.md` 声明知识落点优先级：**用户明确指令 > 项目 AGENTS.md > 项目已有约定 > SDD 默认建议**——`mydocs/...` 全部出现在第 4 优先级的 references/模板层；
2. 唯一脚本 `archive_builder.py` 的目标目录是命令行参数（`--targets`），不写死；
3. 已有项目实践过重映射（声明 Project Spec = `docs/`），skill 照此执行无碍。

因此 docloop 采用**单根 `docs/`**（mydocs 退役），在目标项目 AGENTS.md 里声明一段落点映射即可。

## 落点映射表

| sdd-riper 产物 | 其默认落点 | docloop 落点 |
|---|---|---|
| Feature Spec（`sdd_bootstrap`） | `mydocs/specs/` | `docs/now/tasks/T-###_<名>.md`（任务包＝Feature Spec，同一个东西） |
| context bundle | `mydocs/context/` | `docs/now/context/`（随迭代冻结） |
| handoff 交接包 | `mydocs/handoff/` | `docs/now/handoff/`（随迭代冻结） |
| codemap | `mydocs/codemap/` | `docs/truth/codemap/`（代码现状索引归真相层·吃腐烂检测） |
| archive 双视角归档 | `mydocs/archive/` | 迭代级被 `past/<迭代>/summary.md` 取代；任务级落 now/ 随迭代冻结 |
| Project Spec / Project Memory | `mydocs/project/` | 不用——长期真相 = `docs/truth/`，规矩 = AGENTS.md |

## 目标项目 AGENTS.md 声明样例

```markdown
## sdd-riper 落点映射（docloop）
本仓知识落点按 docloop 组织（覆盖 SDD 默认路径）：
Feature Spec → docs/now/tasks/T-###_<名>.md · context → docs/now/context/
handoff → docs/now/handoff/ · codemap → docs/truth/codemap/
Project Spec/Memory 不设：长期真相= docs/truth/，规矩=本文件。
archive 由迭代结算的 summary 取代。
```

## 职责接缝

- 任务包内嵌 RIPER checkpoint 结构（sdd-riper 的门禁在任务包内运转）；
- sdd-riper 的 **Reverse Sync** 对接 docloop 的 truth 改写（实现偏差回改真相，任务包只记偏差）；
- sdd-riper 的 **Project Sync Candidate** 落点即 docloop 的 truth/ 或 AGENTS.md（按上表）；
- **实现依据**按 docloop 上游规则：任务包按账本条目拉原文章节，不以摘编为实现依据（见 [upstream.md](upstream.md)）。
