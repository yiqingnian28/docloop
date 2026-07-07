---
reads:
  - docs/truth/mechanism/budget-lint.md
  - docs/truth/decisions.md
covers: []
---

# T-008 · 阅读面噪声检查 + truthDirs

## 目标

实施 CH-004 全部四个变化点:lint 第 7 项扩展为"历史痕迹 + 阅读面噪声"(7a/7b/7c),新增 truthDirs 迁移期扫描,recipe 升格为 agent 提示词;分界立场沉淀 D-014。

## In / Out

- In:脚本(truthDirs、门槛放宽、7b 噪声行、7c 超长单元、红降黄、提示语);truth(budget-lint 第 7 项细则、decisions D-014);skill 同步(rituals/lint.md recipe、README 表述)。
- Out:LLM 进 lint 脚本(D-014 红线);结构类检查(1–6)扫 truthDirs;存量一致性扫描(OQ-7 另议)。

## Done Contract

- 7b:散文/bullet 行命中 ≥3 类信号计噪声,占比超阈(默认每百行 10)黄;7c:bullet/单元格超 200 字黄;台账/表格行不受 7b 约束;行内代码与 markdown 链接目标不计信号;truthDirs 内非 docs/truth 路径全部降黄;未装机(无 docs/)仅跑第 7 项并明示。
- 证据:本仓自举全绿;examples/mini 输出不变(0 红 2 黄);fixture A(装机树 + 噪声样本)按预期报黄;fixture B(未装机 + truthDirs)红降黄、退出码 0。
- 未完成:自举/示例出现误伤,或 fixture 未按预期。

## 实现依据

CH-004"变化"节四点 + 架构红线;误伤预案:台账类(decisions/index/items)信号密集是契约,7b 排除表格行——否则 decisions.md 首个被误伤。

## Checkpoint(RIPER)

- 已完成:全部——D-014、budget-lint 第 7 项细则、脚本(truthDirs/7b/7c/红降黄/未装机模式)、rituals/lint.md agent 版 recipe、README ×2、验证四连。
- 风险处置:误伤预案兑现了一次——mini 的登记簿裸管道行(`S-01 | 书签PRD | …`)被 7b 误伤,判定收紧为"含 ≥2 管道符的行按台账处理"(7b 豁免、单元格归 7c),回归后消除。

## 验证记录

- fixture A(装机树):bad.md 红 1 黄 1(7a 不回归);bad2.md 7b 黄(2/3 噪声行,示例行输出正确)+ 7c 黄(217 字 > 200)。
- fixture B(未装机 + truthDirs=['design']):变更历史小节红降黄、附迁移期提示;"未装机仅跑阅读面"黄提示;退出码 0。
- 本仓自举:七项全绿。examples/mini:0 红 2 黄,与发布口径一致(修正误伤后)。

## 偏差记录

- 7b 台账豁免从"行首 `|`"扩为"含 ≥2 管道符"(登记簿/账本裸管道行也是台账)——与 truth 细则"台账密集是契约"同义,实现口径收紧,无需回改 truth。
