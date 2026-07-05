---
reads:
  - docs/truth/mechanism/README.md
  - docs/truth/mechanism/layers.md
  - docs/truth/mechanism/upstream.md
  - docs/truth/mechanism/change.md
  - docs/truth/mechanism/lifecycle.md
  - docs/truth/mechanism/budget-lint.md
  - docs/truth/mechanism/sdd-riper.md
covers: []
---

# T-003 · skills/docloop/ 骨架与模板

## 目标

把机制真相编译成可安装的单入口 skill：SKILL.md 常驻内核 + references/ 按仪式一站一文件 + 全套文档模板 + Codex 适配（D-011）。

## In / Out

- In：SKILL.md（≤150 行）、references/rituals/ 5 份、references/templates/ 8 份、agents/openai.yaml、skill README
- Out：体检脚本（T-004）、微型示例（T-005）、英文 README 与发布（T-006）

## Done Contract

- 文件齐全如 In 所列；SKILL.md ≤150 行，各文件体积合规（行数 + 字节双口径）
- 每份 reference / 模板与 truth 对应章节一致（skill 是发行版，truth 为准）
- agents-md 模板含两条防冲突声明：sources 只能经 CH、PROJECT_*/archive 不设（评审第 22 条）
- task 模板含 reads/covers frontmatter（评审第 15/17 条），T-004 lint 按此解析

## Checkpoint（RIPER）

- 当前理解：T-002 裁决已收敛，直接按 truth 编译发行版
- 已完成：内核 + 5 仪式 + 8 模板 + openai.yaml + skill README 全部落盘并核验
- 风险：skill 与 truth 措辞漂移 → 编写时逐章对照 truth 提炼；结算时再核对一次（AGENTS.md 同步规矩）

## 验证记录

- 文件齐全：SKILL.md、rituals/ 5 份、templates/ 8 份、agents/openai.yaml、README.md（共 16 份）
- 体积证据（wc -lc，2026-07-05）：SKILL.md 67 行 / 4639 B（上限 150 行 / 9750 B）；其余各文件 10~38 行，全部双口径合规
- Done Contract 逐条核对：agents-md 模板含 sources 经 CH + PROJECT_*/archive 不设两条声明 ✓；task 模板含 reads/covers frontmatter ✓

## 偏差记录

- rituals/lint.md 引用的脚本由 T-004 提供，本任务先行描述用法（已知依赖，非偏差）
