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

- In：SKILL.md 三层表与预算行；rituals/iterate.md（开迭代前置、结算只冻结该目录、结转目标）、change.md（冲突检查面）、init.md（装机骨架）、lint.md（新判定说明）；templates/iteration.md（scope frontmatter）、templates/agents-md.md（开工协议第 2 步"目标迭代"）；本仓 AGENTS.md 第 2 步与 docs/README.md；`git mv docs/now/* docs/now/2026-09_i04_并行迭代/`；截图或命令输出证明迁移后 lint 全绿。
- Out：真相改写（T-011）；lint 脚本（T-012）；示例 examples/ 的迁移（若有，另起 T）。

## Done Contract

skill 与 truth 逐文件对照无漂移（truth 为准）；AGENTS.md 只放规矩不放状态；迁移后自举 lint 全绿；迁移前后 T/CH 引用全部可解析。任一 rituals 与 lifecycle / budget-lint 口径不一致、或迁移后 lint 有红即未完成。

## 实现依据

CH-007 波及段 skill 与本仓两条；truth 以 T-011 结果为准。

## Checkpoint（RIPER）

- 前置：T-011、T-012 完成。
- 下一步：按波及清单逐文件同步，最后做迁移并跑 lint。

## 验证记录

（待填：对照清单 + lint 输出）

## 偏差记录

（无）
