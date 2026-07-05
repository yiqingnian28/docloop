# AGENTS.md — docloop 仓 AI 工作指南

本仓开发 **docloop**（AI 协作项目的文档维护机制），并用该机制自举维护自己。

## 开工协议（新会话按序读）

1. 本文（规矩）
2. [`docs/now/iteration.md`](docs/now/iteration.md)（当前迭代目标与任务——**项目状态只活在这里**）
3. 手头任务涉及的 [`docs/truth/mechanism/`](docs/truth/mechanism/README.md) 章节（按需，不全读）

## 硬规则

- **规矩 / 状态分离**：本文只放规矩；项目进展一律写 `docs/now/iteration.md`，不回写本文。
- **真相滚动改写**：`docs/truth/` 只保存当前真相，改写不追加，不留时间线（历史归 git 与 `docs/past/`）。
- **不臆造**：拿不准的写进对应文档的 Open Questions，不编。
- **中文通俗**：正文用通俗易懂的中文，少堆术语。
- **单一真相源**：同一事实只在一处权威，别处只链接。
- **体积预算**：真相章节 ≤300 行，超限拆分（规则见 `docs/truth/mechanism/budget-lint.md`）。
- **本仓模块根**：自举场景下机制即唯一模块，模块根 = `docs/truth/mechanism/`（lint 模块根可配置）。
- **truth ↔ skill 同步**：`skills/docloop/` 是 truth 的发行版（D-011）——改写 `docs/truth/mechanism/` 时检查 skill 是否需同步，结算时核对，truth 为准。
- **任务执行用 sdd-riper**（one / light）；Feature Spec 落 `docs/now/tasks/`，落点映射见 [`docs/truth/mechanism/sdd-riper.md`](docs/truth/mechanism/sdd-riper.md)。

## 迭代节奏

开迭代 → 记变更（CH）→ 体检 → 结算冻结。详见 [`docs/truth/mechanism/lifecycle.md`](docs/truth/mechanism/lifecycle.md)。
