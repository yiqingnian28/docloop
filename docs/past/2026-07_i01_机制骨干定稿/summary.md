# i01 机制骨干定稿 · 迭代摘要

> ≤120 行。本迭代**唯一可被日常引用的史料**。

- 周期：2026-07-05 ~ 2026-07-05 · 目标达成：机制真相定稿，单入口 skill 可用，示例与体检闭环

## 做成了什么

- 机制 spec 七章 + 用例全景（7 类 40 例）落盘，人工评审收敛 22 项裁决改写（T-001、T-002）
- 单入口 skill `skills/docloop/`：内核 67 行 + 五仪式 references + 八份模板 + Codex 适配（T-003）
- 六项体检脚本 `docloop_lint.mjs`：零依赖 Node、红黄分级、行 + 字节双口径；本仓自举全绿，注红测试通过（T-004）
- examples/mini 书签管家：两迭代完整生命周期走读，lint 0 红 2 黄如预期（T-005）

## 关键决策

- D-001~D-010：命名 / 中文 / 三层 / 单根 docs / CH 一等公民 / 账本对账 / 预算逼层级 / 依赖 sdd-riper / 自举（见 decisions.md）
- D-011 发行形态 = 单入口 skill，skill 是 truth 的发行版
- D-012 lint = 零依赖 Node 单脚本 · D-013 腐烂映射 = frontmatter code glob

## CH 清单

- CH-001 发行形态定为 skill：本迭代改 · 已完成（波及 iteration / budget-lint / use-cases / decisions / AGENTS）

## 未了事项

- T-006 未完结转 i02：英文 README + README.zh-CN + 发布 GitHub
- 体检黄项：无（结算前后两次体检均无红无黄；结算体检曾抓到 1 处跨仓 ID 死链并当场修复）
- 实操发现：结算清单第 7 步体检时点有歧义（now 冻结后、新迭代开启前必报红），已记 i02 OQ-6 待裁决
