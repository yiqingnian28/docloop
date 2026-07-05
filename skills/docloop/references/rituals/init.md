# 仪式 · 装机（init）

给目标项目初始化 docloop 结构。触发：用户要"装 docloop / 初始化文档机制 / docloop init"。

## 步骤

1. **确认**：项目根位置；是否已有 docs/（有则先盘点冲突并列出，等用户确认，不静默覆盖）；正文语言。
2. **建骨架**（空目录用 .gitkeep 占位）：

```
docs/
├── README.md            # 导航：三层一览 + 入口链接
├── truth/
│   ├── decisions.md     # 已定决策（滚动改写；推翻的行直接删）
│   ├── sources/index.md # 上游登记簿（模板 templates/sources-index.md）
│   ├── modules/         # 模块真相：单文件起步，超 300 行才拆目录，最深 3 层
│   └── codemap/         # 代码地形（sdd-riper codemap 产物落点）
├── now/
│   ├── iteration.md     # 模板 templates/iteration.md
│   └── tasks/ changes/ inbox/ context/ handoff/
└── past/                # 空；首次结算才有内容
```

（`architecture.md` / `glossary.md` 可选，复杂度到了再建。）

3. **写 AGENTS.md**：按 `templates/agents-md.md` 片段追加到目标项目 AGENTS.md（没有则新建）。已有 AGENTS.md 时只追加 docloop 段落，不动其他内容。片段必须保留两条防冲突声明：`truth/sources/` 只能经 CH 改写；PROJECT_* / archive 不设（防 sdd-riper 默认行为建出平行目录）。
4. **开首个迭代**：按 `templates/iteration.md` 写 `now/iteration.md`（目标 / 范围 / 任务清单 / Open Questions）。
5. **可选接源**：有现成 PRD / 设计稿要接 → 转 `rituals/upstream.md`。
6. **体检验证**：按 `rituals/lint.md` 跑一遍，新装机应全绿。

## 注意

- 装机不迁移旧文档内容；存量文档的接入按上游仪式逐份来（原样堆进 truth = 第一天就超预算）。
- truth 文档从第一天就带 frontmatter `verified:`（模块文档加 `code:` glob）。
