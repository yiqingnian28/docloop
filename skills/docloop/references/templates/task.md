---
reads:            # 本任务必读集（boot set 实算用）：相关模块 truth + 相关 digest
  - docs/truth/modules/<模块>.md
  - docs/truth/sources/S-##_<名>/digest.md
covers:           # 覆盖的账本条目 ID（结算对账 + 孤儿检查用；无上游条目可为空列表）
  - S-##.R-###
---

# T-### · <名>

## 目标

<1-3 句>

## In / Out

- In：<边界内>
- Out：<明确不做>

## Done Contract

<什么算完成 + 由什么证据证明 + 什么情况算没完成>

## 实现依据

<按 covers 条目拉取的原文章节完整细节（只拉自己那一片）；摘编不是实现依据>

## Checkpoint（RIPER）

<当前理解 / 已完成 / 关键决策 / 下一步 1-3 个动作 / 风险 / 验证方式——推进中滚动更新>

## 验证记录

<证据：测试输出 / 截图 / 日志链接>

## 偏差记录

<实现与设计的出入；truth 已回改的标"已 Reverse Sync"；源于需求理解变化的补 CH 并写 ID>
