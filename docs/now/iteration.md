# 迭代 i01 · 机制骨干定稿（2026-07-05 开）

## 目标

把讨论定稿的机制设计落成仓库真相，收敛评审，做出可安装的单入口 skill（内核 + 模板 + 体检脚本），跑通微型示例，为发布 GitHub 做好准备。

## 任务清单

- [x] T-001 机制 spec 骨干落盘（truth/mechanism 七章 + 用例全景 + 决策记录）
- [x] T-002 spec 人工评审收敛（22 项裁决改写 + OQ-1~5 关闭 + CH-001）
- [x] T-003 skills/docloop/ 骨架：SKILL.md 常驻内核 + references/（仪式一站一文件 + 全套模板）+ agents/openai.yaml
- [x] T-004 体检脚本 skills/docloop/scripts/docloop_lint.mjs（六项检查 · 零依赖 node · D-012）
- [ ] T-005 examples/mini 微型示例项目（走一遍完整生命周期）
- [ ] T-006 （未来）英文 README + 发布 GitHub

## Open Questions

（无——OQ-1~5 已随 T-002 裁决：OQ-1/OQ-2 v1 不做（列 use-cases 边缘用例）；OQ-3 预算值定档、待实战校准；OQ-4 → D-012；OQ-5 → D-013）

## 变更

- CH-001 发行形态定为 skill——已裁决 · 本迭代改 · 改写完成（见 changes/CH-001_发行形态定为skill.md）
