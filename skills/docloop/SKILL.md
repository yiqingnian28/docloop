---
name: docloop
description: 面向 AI 协作开发的项目文档维护机制：truth/now/past 三层 + 变更单裁决 + 体积预算体检。Use when 用户要初始化/安装项目文档结构（docloop、装机、init、三层骨架）、接入上游文档（PRD 定稿、设计稿、技术设计、挂锚、摘编 digest、条目账本 items）、处理需求变更（会议纪要、聊天记录、口头需求、inbox、变更单 CH、冲突检查、裁决）、迭代仪式（开迭代、迭代结算、冻结、summary、提前结算）、文档体检（lint、体积超限、死链、腐烂检测、孤儿条目、inbox 积压）、或考古（这条需求做了没、这个决策怎么来的）。
---

# docloop

## 核心定位

- 管**知识住在哪、怎么流动、怎么老化**；"单个任务怎么推进"交给 sdd-riper（装了更顺，不装也能转）。
- 三个硬立场：真相只改写不追加；一切需求变化经变更单（CH）裁决才进权威层；"模型驾驭得住"是可校验硬指标（体积预算 + 体检）。
- 本文件是常驻内核，只放模型 / 不变量 / 路由；细则与模板按需读 `references/`。

## 三层模型（按知识年龄分层）

| 层 | 性质 | 增长规律 |
|---|---|---|
| `docs/truth/` | 当前设计真相，滚动**改写** | 只随系统复杂度增长 |
| `docs/now/` | 本迭代活文档（iteration / 任务包 / CH / inbox） | 迭代内增长，结束**清空** |
| `docs/past/` | 迭代冻结包，只增不改 | 随时间增长，**默认不进上下文** |

## 五条不变量（违反即红灯）

1. truth 只随复杂度增长：改写不追加，truth 内禁止时间线 / 变更流水（历史归 git 与 past/）。
2. now 每迭代结束必清空：整体冻结进 past/（未完任务包移动结转例外）。
3. past 默认不进上下文：唯一可日常引用的史料是各迭代 summary.md（≤1 页）。
4. 规矩文件（AGENTS.md）只放规矩：项目状态只活在 now/iteration.md。
5. 需求驱动的权威层改写必须经 CH 裁决：原始素材（纪要 / 聊天 / 口头）永不直接成为实现依据；实现驱动的 Reverse Sync 与 codemap 刷新可直写（涉及需求理解变化时补 CH）。

## 通用约定

- 编号全局递增永不复位：S-##（上游源）、T-###（任务）、CH-###（变更单）；新号 = 全仓最大号 + 1（含 past/）。
- truth 层引用 T / CH **只写 ID 不写路径**（结算后路径必变）。
- 每份 truth 文档带 frontmatter `verified: YYYY-MM-DD`；模块文档可加 `code:` glob（腐烂检测映射）。
- 任务包 frontmatter 声明 `reads:`（必读集）与 `covers:`（覆盖账本条目）。
- 同一事实只在一处权威，别处只链接；正文语言跟随目标项目。

## 体积预算（超硬预算 = 红灯）

模块 truth 300 行 · 任务包 250 · CH 80 · digest 150 · summary 120 · 其余 truth 文档 300 · SKILL 内核 150；开工必读集合计 ≤2000 行；now/ 总量 ≤2000 行（inbox 只计件数）。每档配套字节上限 = 行数 × 65。

## 仪式路由（何时读哪份）

| 时刻 | 读 |
|---|---|
| 给项目装 docloop（初始化 docs/ 三层 + AGENTS.md 声明） | `references/rituals/init.md` |
| 接入上游权威文档：PRD / 设计稿 / 技术设计定稿 | `references/rituals/upstream.md` |
| 需求变了 / 收到纪要、聊天记录、口头需求 | `references/rituals/change.md` |
| 开迭代 / 迭代结算 / now 超预算提前结算 | `references/rituals/iterate.md` |
| 跑体检、解释体检结果、修红黄项 | `references/rituals/lint.md` |
| 写任一机制文档 | `references/templates/` 对应模板 |

## 渐进披露（读的纪律）

- 默认读摘编与 truth，不读上游全文；要细节时按账本锚点深读原文**特定章节**。
- 实现依据 = 原文章节（按任务包 covers 条目拉取），摘编只是导航与对齐契约。
- inbox 不进上下文（只是 CH 的附件线索）；past/ 默认不读，考古先 summary 再按链接精读单份。

## 与 sdd-riper 的分工

- "任务怎么推进"（RIPER 门禁 / checkpoint / 证据验收）归 sdd-riper，产物按目标项目 AGENTS.md 落点映射进 docs/（任务包 = Feature Spec，同一个东西）。
- Reverse Sync 可直接回改 truth；`truth/sources/` 只能经 CH 裁决改写，Project Sync Candidate 不得直写。

## 输出与暂停

- 输出短、通俗、少术语；改权威层前必须有 CH 裁决结论（裁决人有名有姓）。
- 暂停等人：冲突需要裁决时、结算关闭判定时、装机会覆盖已有文件时。
