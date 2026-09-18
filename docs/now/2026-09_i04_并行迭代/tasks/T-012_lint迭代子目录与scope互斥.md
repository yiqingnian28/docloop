---
reads:
  - docs/truth/mechanism/budget-lint.md
  - docs/truth/mechanism/layers.md
covers: []
---

# T-012 · lint 迭代子目录 + scope 互斥（CH-007）

## 目标

lint 认识 `now/<YYYY-MM_i##_标题>/` 布局，并把 CH-007 的结构类检查做成确定性判定。

## In / Out

- In：第 1 项——now/ 顶层只允许迭代目录（命名同 past），每个迭代目录内白名单同旧 now/，必有 iteration.md；第 2 项——now 总量按单迭代目录计、boot set 按任务包所在迭代的 iteration.md 实算、活跃迭代数超阈黄（阈值进 config，默认见 OQ-8）；第 3 项与编号查重——ID 在 now/**/ 与 past/ 解析；新增——iteration.md frontmatter `scope:` 解析，活跃迭代间 scope glob 重叠红，本迭代 git 改动触及 scope 外的 docs/truth/modules 路径黄（共享文件豁免列表进 config）；fixture 补并行样例（两迭代无重叠全绿、重叠红、缺 scope 黄）。
- Out：语义冲突检查（D-014 不进阻断面）；旧平铺布局兼容（不做双布局）；issue #5 冻结包内部检查。

## Done Contract

自举仓迁移后 lint 全绿；fixture 三例结果与预期一致；无新依赖（D-012）；脚本改动点与 truth budget-lint 第 1/2/3 项及新增判定逐条对应。任一 fixture 不符、或引入依赖即未完成。

## 实现依据

CH-007 变化点 1、2、3、5；truth 落点以 T-011 改写后的 budget-lint.md 为准。

## Checkpoint（RIPER）

- 已完成：脚本改动 + 本仓与 examples/mini 迁移到迭代目录布局 + 六个 fixture 验证。
- 遗留给 T-013：skill rituals / templates / SKILL.md 与本次判定的口径同步；AGENTS.md 与 docs/README.md 的措辞（本任务只修了死链）。

## 验证记录

- 布局与发现
  - 关注：now/ 顶层只认迭代目录；每迭代骨架白名单；无活跃迭代黄；stray 文件红
  - 验证：fixture C 红 1（stray.md）；fixture D 黄 1（无活跃迭代）
- 作用域互斥
  - 关注：现有 truth 文件实际交集红；glob 字面前缀嵌套红（目录尚不存在也拦）；缺 scope 黄；CH 链接 scope 外模块 truth 黄、模块根之外共享文档豁免
  - 验证：fixture B 红（共同覆盖 modules/b.md）；fixture E 红（前缀嵌套）；fixture C 黄 2（缺 scope、CH 波及 b.md）
- 预算按迭代
  - 关注：单迭代目录总量；boot set 取任务所在迭代的 iteration.md；活跃迭代数黄（默认 2，`budgets.activeIterations`）
  - 验证：fixture F 只报 i02 总量红、boot set 不红；fixture C 黄（3 个活跃迭代）
- 回归
  - 关注：无重叠双迭代全绿；ID 解析与查重跨活跃迭代；inbox 按迭代扫
  - 验证：fixture A 全绿；本仓自举 0 红 2 黄（issue #4 / #5 待裁决）；examples/mini 0 红 2 黄（与迁移前一致）
- fixture 生成脚本在会话 scratchpad（gen.sh，变体 A~F），未入库；零依赖不变（D-012）

## 偏差记录

- 本仓 now/ 与 examples/mini 的目录迁移从 T-013 前移到本任务：脚本改完旧布局必红，Done Contract 要求自举全绿，迁移是验证前提。T-013 相应收窄为 skill / 规矩文件同步。
- "scope 外改写黄"按 T-011 偏差记录的确定性形式实现：判定入口是 CH 内的 markdown 链接，不看 git diff。
