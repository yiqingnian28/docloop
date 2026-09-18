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

- 下一步：读脚本 NOW 相关段（iterFile / allowNow / nowTotal / bootSet / dupCheck / 死链解析）列改动点；先做布局与预算，再做 scope。
- 风险："scope 外改写"依赖 git diff 判定当前迭代，需定义"本迭代改动 = 该迭代目录下任务包 checkpoint 所在分支的未冻结改动"，若不可靠则降级为只查 scope 重叠。

## 验证记录

（待填：fixture 输出 + 自举 lint 输出）

## 偏差记录

（无）
