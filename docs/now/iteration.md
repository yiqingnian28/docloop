# 迭代 i04 · 并行迭代（2026-09-17 开）

## 目标

now/ 能同时承载多个作用域互斥的活跃迭代，各自独立开工、独立结算；本仓自举迁移到新布局，作为第一个验证。

## 范围

机制骨干改动：README 不变量 2、layers now 节、lifecycle 四仪式、budget-lint 预算口径、change 冲突检查面、use-cases OQ-1 关闭；lint 脚本（迭代子目录、scope 互斥、活跃数黄）；skill 发行版同步 + AGENTS.md + 本仓迁移。不做：issue #5 冻结包内部组织（排在本迭代之后，继承迭代目录结构）；issue #4 完工代码对抗 Review 门禁（另起 CH 裁决）。

## 任务清单

- [x] T-011 并行迭代机制真相改写（CH-007）
- [ ] T-012 lint 迭代子目录 + scope 互斥（CH-007）
- [ ] T-013 skill 同步 + AGENTS.md + 本仓自举迁移（CH-007）

## Open Questions

- OQ-7 存量一致性扫描要不要做（i03 顺延，待实战数据）
- issue #4 / #5 待起 CH（原文在 inbox）

## 变更

- CH-007 并行迭代（源自 issue #6）——已裁决 · 本迭代改（见 changes/CH-007_并行迭代.md）
