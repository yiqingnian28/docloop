# CH-001 · 发行形态定为 skill

- 日期：2026-07-05 · 起草：AI · 裁决人：用户

## 变化

docloop 以 Claude Code / Codex 可安装 **skill** 形式发行：单入口 `skills/docloop/`——SKILL.md 常驻内核（≤150 行）+ references/ 按仪式一站一文件 + 全套模板 + scripts/ 体检脚本 + agents/openai.yaml。出处：2026-07-05 会话（对照 sdd-riper 仓库解剖：三层上下文成本模型、单入口 vs 拆分的量化对比）。

## 冲突检查报告

对照 truth（含 decisions）与本迭代任务：与 D-004（单根 docs/）、D-009（依赖 sdd-riper 分工）无冲突；T-003/T-004 原落点（仓根 templates/、lint/）与本变化冲突，需改任务措辞。未发现其他冲突。

## 波及

- `docs/now/iteration.md`：目标与 T-003 / T-004 任务措辞、落点
- `docs/truth/mechanism/README.md`：总述加发行形态一句
- `docs/truth/mechanism/budget-lint.md`：实现形态节改写、预算表增 SKILL.md 档
- `docs/truth/mechanism/use-cases.md`：补装机用例 UC-A6
- `docs/truth/decisions.md`：增 D-011（单入口 skill · skill = truth 的发行版）
- `AGENTS.md`：增 truth ↔ skill 同步规矩

## 处置

- 本迭代改；裁决人：用户（2026-07-05，"先用一个入口 / 全按建议"）
- [x] 上述改写全部完成（随 T-002 同 commit）
