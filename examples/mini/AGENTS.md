# AGENTS.md — 书签管家（mini 示例项目）

## 文档机制（docloop）

本仓文档按 docloop 组织（docs/ 下 truth / now / past 三层），机制细则见已安装的 docloop skill。

### 开工协议（新会话按序读）

1. 本文（规矩）→ 2. `docs/now/iteration.md`（项目状态唯一的家）→ 3. 手头任务包 + 其 frontmatter `reads:` 声明的必读集

### 硬规则

- 项目状态一律写 `docs/now/iteration.md`，不回写本文
- `docs/truth/` 只存当前真相：改写不追加，不留时间线；同一事实只在一处权威
- `docs/truth/sources/`（登记簿 / 摘编 / 账本）只能经 CH 裁决改写；纪要 / 聊天 / 口头需求原样落 `docs/now/inbox/`，永不直接作为实现依据
- `docs/past/` 默认不读（考古先读 summary）；inbox 不进上下文
- 拿不准的写对应文档 Open Questions，不臆造

### 仪式路由

装机 / 接上游文档 / 需求变更 / 开迭代·结算 / 体检 → 触发 docloop skill 对应仪式（references/rituals/）

### sdd-riper 落点映射（如安装）

本仓知识落点按 docloop 组织（覆盖 SDD 默认路径）：
Feature Spec → `docs/now/tasks/T-###_<名>.md` · context → `docs/now/context/`
handoff → `docs/now/handoff/` · codemap → `docs/truth/codemap/`
Project Spec / Memory 不设：长期真相 = `docs/truth/`，规矩 = 本文件。
truth/sources/ 只能经 CH 裁决改写，Project Sync Candidate 不得直写。
archive 由迭代结算的 summary 取代。
