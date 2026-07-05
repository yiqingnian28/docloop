# 迭代 i01 · 机制骨干定稿（2026-07-05 开）

## 目标

把讨论定稿的机制设计落成仓库真相，收敛评审，补齐模板与体检脚本，跑通微型示例，为发布 GitHub 做好准备。

## 任务清单

- [x] T-001 机制 spec 骨干落盘（truth/mechanism 七章 + 用例全景 + 决策记录）
- [ ] T-002 spec 人工评审收敛（用户过一遍，Open Questions 裁决）
- [ ] T-003 templates/ 文档模板（iteration / task / CH / digest / items / summary / sources index / 目标项目 AGENTS.md 样例）
- [ ] T-004 lint/ 体检脚本（六项检查，倾向零依赖 node）
- [ ] T-005 examples/mini 微型示例项目（走一遍完整生命周期）
- [ ] T-006 （未来）英文 README + 发布 GitHub

## Open Questions

- OQ-1 多人并行：多条任务线 / 多迭代并行时 now/ 怎么组织（v1 假设单迭代串行）
- OQ-2 跨仓库：一个产品多个代码仓时 truth 放哪（v1 假设单仓）
- OQ-3 预算默认值（300/250/150/80/120/2000 行）纯属经验起点，待实战校准
- OQ-4 lint 实现形态：零依赖 node 脚本 vs 引入依赖，倾向前者，T-004 时定稿
- OQ-5 腐烂检测的"代码活跃度"怎么算：truth 模块 ↔ 代码目录的映射从哪来（约定？配置文件？），T-004 时定稿

## 变更

（无）
