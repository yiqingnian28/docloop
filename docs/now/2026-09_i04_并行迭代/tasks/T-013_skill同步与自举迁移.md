---
reads:
  - docs/truth/mechanism/lifecycle.md
  - docs/truth/mechanism/budget-lint.md
  - skills/docloop/SKILL.md
covers: []
---

# T-013 · skill 同步 + AGENTS.md + 本仓自举迁移（CH-007）

## 目标

把 T-011 定稿的真相发行到 skill（D-011），改本仓规矩文件，并把本仓 now/ 迁到迭代子目录布局，作为并行迭代的第一个真实验证。

## In / Out

- In：SKILL.md 三层表与预算行；rituals/iterate.md（开迭代前置、结算只冻结该目录、结转目标）、change.md（冲突检查面）、init.md（装机骨架）、lint.md（新判定说明）；templates/iteration.md（scope frontmatter）、templates/agents-md.md（开工协议第 2 步"目标迭代"）；本仓 AGENTS.md 第 2 步措辞与 docs/README.md 三层表措辞；命令输出证明同步后 lint 全绿。
- Out：真相改写（T-011）；lint 脚本与本仓 / examples/mini 目录迁移（T-012 已做）。

## Done Contract

skill 与 truth 逐文件对照无漂移（truth 为准）；AGENTS.md 只放规矩不放状态；同步后自举 lint 与 examples/mini lint 无红。任一 rituals 与 lifecycle / budget-lint 口径不一致、或 lint 有红即未完成。

## 实现依据

CH-007 波及段 skill 与本仓两条；truth 以 T-011 结果为准。

## Checkpoint（RIPER）

- 前置：T-011、T-012 完成（目录迁移已随 T-012 落地）。
- 下一步：按波及清单逐文件同步，跑 lint。

## 验证记录

- skill 内核与仪式（D-011 对照，truth 为准）
  - 关注：三层表、不变量 2 / 4、编号加 i##、scope 约定、预算行、路由行、渐进披露
  - 验证：SKILL.md 七处改写，68 行 < 150；rituals/iterate.md 整体重写（开迭代建目录 + scope、结算第 6 / 7 步、提前结算按迭代、新增并行迭代节），与 lifecycle.md 逐节对照一致
  - 关注：冲突检查面、编号规则、装机骨架、lint 第 1 / 2 / 3 项与修法
  - 验证：rituals/change.md 三处；rituals/init.md 骨架与第 4 步；rituals/lint.md 三行表 + 两条修法；rituals/upstream.md 一处路径
- 模板
  - 关注：iteration.md 带 `scope:` frontmatter；agents-md 开工协议第 2 步"目标迭代"、状态与 inbox 落点、sdd-riper 映射
  - 验证：templates/iteration.md、templates/agents-md.md 各改写，与 layers.md / sdd-riper.md 声明样例一致
- 本仓规矩与导航
  - 关注：AGENTS.md 只放规矩（唯一活跃迭代链接作导航，非状态）；docs/README.md 三层表；首页 README 双语三层表 / 不变量 / 入口
  - 验证：AGENTS.md 三处、docs/README.md 一处、README.md 与 README.zh-CN.md 各四处
- lint：本仓 0 红 2 黄（issue #4 / #5 待裁决）；examples/mini 0 红 2 黄；全仓 grep 无残留旧路径 `now/iteration.md` `now/tasks/` `now/inbox/`（past/ 冻结件除外）

## 偏差记录

- 首页 README.md / README.zh-CN.md 不在 In 列表，但三层表与不变量是对外发行面，与 truth 漂移即 D-011 违约，一并同步。
- 目录迁移已由 T-012 前移完成，本任务不再包含。
