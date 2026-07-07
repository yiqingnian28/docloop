# docloop

[English](./README.md)

> 面向 AI 协作开发的项目文档维护机制：真相滚动改写、过程按迭代冻结、历史默认离场——让文档始终保持在模型上下文能驾驭的体积内。

## 为什么需要它

AI 时代的项目文档有一对天然矛盾：

- AI 干活需要**准确、够细**的上下文（需求、设计、约定）；
- 但需求频繁变更，变化逐层传导（需求 → 设计文档 → 代码），变化记录随时间无限堆积，文档越来越臃肿，最终**超出模型上下文的驾驭范围**，人也维护不动。

docloop 的答案：**按知识的"时间性"分层，让"变化"有自己的家，用体积预算和定期体检强制文档不长胖、不腐烂。**

## 核心模型

| 层 | 性质 | 增长规律 |
|---|---|---|
| `docs/truth/` | 当前设计真相，滚动**改写** | 只随系统复杂度增长 |
| `docs/now/` | 本迭代活文档（任务包 / 变更单 / inbox） | 迭代内增长，结束**清空** |
| `docs/past/` | 迭代冻结包，只增不改 | 随时间增长，**默认不进上下文** |

五条不变量（机制宪法）：

1. **truth 只随复杂度增长，不随时间增长**——改写不追加，truth 内不留时间线（历史归 git 和 past/）。
2. **now 每迭代结束必清空**——整体冻结进 past/，新迭代从干净开始。
3. **past 默认不进上下文**——唯一可日常引用的史料是各迭代一页 summary。
4. **规矩文件（AGENTS.md）只放规矩**——项目状态只活在 `now/iteration.md`。
5. **需求驱动的权威层改写必须经变更单（CH）裁决**——纪要 / 聊天等原始素材永不直接成为实现依据。

## 循环本体

`开迭代 → 记变更（CH）→ 体检 → 结算冻结`——docloop 得名于这四个仪式。

- **变化单向流动**：inbox（原样存）→ AI 起草 CH 并产出**冲突检查报告**（对照条目账本 + truth 含决策 + 本迭代 CH）→ 有名有姓的人拍板 → 裁决过的才能改写权威层。
- **上游文档（PRD / 设计稿）以"锚 + 摘编 + 账本"接入**，永不复制全文。摘编（≤150 行）管对齐；条目账本管完整——结算时每条需求必须有归属：已实现（带证据）/ 显式挂起 / 显式否决，不允许默默消失。
- **体积是硬指标**：单文档有预算，开工必读集按任务实算并封顶。

## 快速开始

1. **装 skill**——把 `skills/docloop/` 拷进你的 agent 技能目录（Claude Code：`.claude/skills/docloop/`；Codex 等：工作区放 `skills/` 目录并经 AGENTS.md 路由）。
2. **初始化项目**——对 agent 说：

```text
用 docloop 给这个项目装上文档机制（init）。
```

装机仪式会建好三层 `docs/` 骨架、写入 AGENTS.md 段落（开工协议、硬规则、sdd-riper 落点映射）、开出第一个迭代。

3. **随时体检**（零依赖，Node ≥18）：

```text
node <skill目录>/scripts/docloop_lint.mjs [项目根]
```

七项检查：目录合规 · 体积超限（行 + 字节）· 死链与 ID 引用 · 腐烂检测（`verified:` 日期 vs `code:` glob 的 git 活跃度）· 孤儿条目 · inbox 积压 · 历史痕迹与阅读面噪声（truth 正文历史化 / 审计报告化检测；可经 `truthDirs` 扫描未装机项目的 truth-like 路径）。**红阻断结算（退出码 1），黄只提醒。**

## 与 sdd-riper 搭配

[sdd-riper](https://github.com/huisezhiyin/sdd-riper) 管**一个任务怎么推进**（RIPER 门禁、checkpoint、证据验收）；docloop 管**知识住在哪、怎么流动、怎么老化**。docloop 的任务包就是 sdd-riper 的 Feature Spec——同一份文件，经 AGENTS.md 落点映射。推荐搭配而非硬依赖：不装 sdd-riper，任务包退化为普通任务文档，机制照常运转。

## 仓库地图

| 位置 | 内容 |
|---|---|
| [`skills/docloop/`](skills/docloop/README.md) | 可安装的 skill：内核（`SKILL.md`）、五个仪式、全套模板、体检脚本、Codex 适配 |
| [`docs/truth/mechanism/`](docs/truth/mechanism/README.md) | 机制完整规范——skill 是它的发行版，truth 为准 |
| [`docs/truth/decisions.md`](docs/truth/decisions.md) | 已定决策（D-001+） |
| [`examples/mini/`](examples/mini/README.md) | 两个迭代的完整生命周期走读（微型书签管家） |
| [`docs/now/iteration.md`](docs/now/iteration.md) | 当前迭代——项目状态只活在这里 |

**本仓自举**：docloop 仓库自己就用 docloop 维护。它的第一张变更单、第一次结算、第一个冻结迭代都是真实发生的，就在历史里（`docs/past/`）。

## 状态

机制 v1 已落地：规范、skill、体检、示例齐备，自举 lint 全绿。正文文档中文为主（决策 D-002），英文 README 为对外主入口。
