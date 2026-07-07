#!/usr/bin/env node
// docloop 体检脚本 · 七项检查（零依赖 Node ≥18 · D-012）
// 用法：node docloop_lint.mjs [项目根] [--config docloop.config.json]
// 红 = 违反不变量 / 超硬预算（退出码 1，阻断结算）；黄 = 提醒不阻断（退出码 0）

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// ---------- 参数 ----------
const argv = process.argv.slice(2);
let root = process.cwd();
let configPath = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--config') configPath = argv[++i];
  else root = path.resolve(argv[i]);
}

// ---------- 配置（默认值内置，docloop.config.json 可覆盖） ----------
const DEFAULTS = {
  docsDir: 'docs',
  modulesRoot: 'docs/truth/modules',
  budgets: { truthDoc: 300, task: 250, change: 80, digest: 150, summary: 120, skillKernel: 150, bootSet: 2000, nowTotal: 2000 },
  bytesPerLine: 65, // 字节上限 = 行数上限 × 65（≈ 每行一句中文；字节 ÷ 3.5 ≈ token）
  rotDays: 90, // 未声明 code: 的文档：verified 距今超此天数标黄
  rotCommits: 10, // 声明 code: 的文档：verified 之后 glob 内提交超此数标黄
  historyWords: ['已作废', '已废弃', '已弃用', '旧口径', '旧方案', '原方案', '旧版本', '待确认', '此前', '曾经', '后来改为', '现改为', '最初'],
  historyDensityPer100: 5, // truth 文档过程性词汇每百行命中超此数标黄
  truthDirs: ['docs/truth'], // 阅读面检查（第 7 项）扫描面；可追加迁移期 truth-like 路径，docs/truth 之外只黄不红（D-014）
  noiseWords: ['机器预检', '附C', '待落码', '人天', '排期', '工时'], // 7b 信号词（"证据"等常用词不进默认表防误伤）
  noiseMinSignals: 3, // 一行命中信号类别数达到此值计噪声行
  noiseLinePer100: 10, // 散文噪声行每百行超此数标黄
  cellMaxChars: 200, // 单条 bullet / 表格单元格最大字符数（7c）
};
let config = JSON.parse(JSON.stringify(DEFAULTS));
const cfgFile = configPath ? path.resolve(configPath) : path.join(root, 'docloop.config.json');
if (fs.existsSync(cfgFile)) {
  const user = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
  config = { ...config, ...user, budgets: { ...DEFAULTS.budgets, ...(user.budgets ?? {}) } };
}

const DOCS = path.join(root, config.docsDir);
const TRUTH = path.join(DOCS, 'truth');
const NOW = path.join(DOCS, 'now');
const PAST = path.join(DOCS, 'past');
const MODROOT = path.join(root, config.modulesRoot);

// ---------- 小工具 ----------
const rel = (p) => path.relative(root, p) || '.';
const exists = fs.existsSync;
const read = (p) => fs.readFileSync(p, 'utf8');
function walk(dir, out = []) {
  if (!exists(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const mdFiles = (dir) => walk(dir).filter((f) => f.endsWith('.md'));
const countLines = (t) => (t === '' ? 0 : t.split('\n').length);
const bytesOf = (t) => Buffer.byteLength(t, 'utf8');
// ID 引用与链接扫描前剥掉代码块 / 行内代码（正文举例不算引用）
const stripCode = (t) => t.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ');

function frontmatter(text) {
  if (!text.startsWith('---')) return {};
  const end = text.indexOf('\n---', 3);
  if (end === -1) return {};
  const body = text.slice(text.indexOf('\n') + 1, end);
  const obj = {};
  let key = null;
  for (const raw of body.split('\n')) {
    const line = raw.replace(/\s+#.*$/, '');
    if (!line.trim()) continue;
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (kv) {
      key = kv[1];
      const v = kv[2].trim();
      obj[key] = v === '' || v === '[]' ? [] : v;
    } else {
      const item = /^\s*-\s*(.+)$/.exec(line);
      if (item && key) {
        if (!Array.isArray(obj[key])) obj[key] = [];
        obj[key].push(item[1].trim());
      }
    }
  }
  return obj;
}

// ---------- 结果收集 ----------
const findings = []; // {check, level, msg}
const red = (check, msg) => findings.push({ check, level: '红', msg });
const yellow = (check, msg) => findings.push({ check, level: '黄', msg });

const TRUTH_DIRS = (Array.isArray(config.truthDirs) ? config.truthDirs : [config.truthDirs]).map((d) => path.join(root, d));
const structurePresent = exists(DOCS);
if (!structurePresent && !TRUTH_DIRS.some(exists)) {
  console.error(`✗ 找不到 ${rel(DOCS)}/ 或任何 truthDirs 路径 —— 这不是 docloop 项目，或先跑装机仪式（init）`);
  process.exit(1);
}

// ---------- 公共数据 ----------
const iterFile = path.join(NOW, 'iteration.md');
const iterText = exists(iterFile) ? read(iterFile) : '';
const nowTasks = mdFiles(path.join(NOW, 'tasks'));
const nowChanges = mdFiles(path.join(NOW, 'changes'));
const pastDirs = exists(PAST)
  ? fs.readdirSync(PAST, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
  : [];
const pastSummaries = pastDirs.map((d) => path.join(PAST, d, 'summary.md')).filter(exists);
const pastText = pastSummaries.map(read).join('\n');
const pastTaskFiles = pastDirs.flatMap((d) => mdFiles(path.join(PAST, d, 'tasks')));
const pastChangeFiles = pastDirs.flatMap((d) => mdFiles(path.join(PAST, d, 'changes')));
const sourcesDir = path.join(TRUTH, 'sources');
const sourcesIndexText = exists(path.join(sourcesDir, 'index.md')) ? read(path.join(sourcesDir, 'index.md')) : '';
const itemsFiles = walk(sourcesDir).filter((f) => f.endsWith('.md') && /(^|[/\\])items([^/\\]*\.md$|[/\\])/.test(path.relative(sourcesDir, f)));
const itemsText = itemsFiles.map(read).join('\n');
const kernels = [];
const skillsDir = path.join(root, 'skills');
if (exists(skillsDir)) {
  for (const e of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const k = path.join(skillsDir, e.name, 'SKILL.md');
    if (exists(k)) kernels.push(k);
  }
}

function resolveId(id) {
  if (id.startsWith('T-'))
    return [...nowTasks, ...pastTaskFiles].some((f) => path.basename(f).startsWith(id + '_')) || iterText.includes(id) || pastText.includes(id);
  if (id.startsWith('CH-'))
    return [...nowChanges, ...pastChangeFiles].some((f) => path.basename(f).startsWith(id + '_')) || pastText.includes(id);
  if (id.startsWith('D-')) {
    const d = path.join(TRUTH, 'decisions.md');
    return exists(d) && read(d).includes(id);
  }
  if (id.includes('.R-')) return itemsText.includes(id);
  return sourcesIndexText.includes(id) || (exists(sourcesDir) && fs.readdirSync(sourcesDir).some((n) => n.startsWith(id + '_')));
}

// ---------- 1 目录合规 ----------
if (structurePresent) {
  if (!exists(TRUTH)) red(1, 'docs/truth/ 不存在');
  if (!exists(NOW)) red(1, 'docs/now/ 不存在');
  if (!exists(iterFile)) red(1, 'docs/now/iteration.md 不存在（项目状态唯一的家）');
  const allowDocs = new Set(['README.md', 'truth', 'now', 'past']);
  for (const e of fs.readdirSync(DOCS)) if (!allowDocs.has(e) && !e.startsWith('.')) red(1, `docs/ 下不认识的条目：${e}`);
  const modBase = path.relative(TRUTH, MODROOT).split(path.sep)[0];
  const allowTruth = new Set(['sources', 'codemap']);
  if (modBase && !modBase.startsWith('.')) allowTruth.add(modBase);
  if (exists(TRUTH)) {
    for (const e of fs.readdirSync(TRUTH, { withFileTypes: true }))
      if (e.isDirectory() && !allowTruth.has(e.name)) red(1, `docs/truth/ 下不认识的目录：${e.name}（模块根 = ${config.modulesRoot}）`);
  }
  const allowNow = new Set(['iteration.md', 'tasks', 'changes', 'inbox', 'context', 'handoff']);
  if (exists(NOW)) for (const e of fs.readdirSync(NOW)) if (!allowNow.has(e) && !e.startsWith('.')) red(1, `docs/now/ 下不认识的条目：${e}`);
  for (const f of nowTasks) if (!/^T-\d{3}_.+\.md$/.test(path.basename(f))) red(1, `任务包命名不合规：${rel(f)}（应为 T-###_<名>.md）`);
  for (const f of nowChanges) if (!/^CH-\d{3}_.+\.md$/.test(path.basename(f))) red(1, `变更单命名不合规：${rel(f)}（应为 CH-###_<名>.md）`);
  if (exists(sourcesDir)) {
    for (const e of fs.readdirSync(sourcesDir, { withFileTypes: true }))
      if (e.isDirectory() && !/^S-\d{2}_.+$/.test(e.name)) red(1, `上游源目录命名不合规：${e.name}（应为 S-##_<名>）`);
  }
  for (const d of pastDirs) if (!/^\d{4}-\d{2}_i\d{2}.*$/.test(d)) red(1, `past 目录命名不合规：${d}（应为 YYYY-MM_i##_<标题>）`);
  // 编号查重（跨 now + past 全局唯一）
  const dupCheck = (files, kind) => {
    const seen = new Map();
    for (const f of files) {
      const m = new RegExp(`^(${kind}-\\d{2,3})_`).exec(path.basename(f));
      if (!m) continue;
      if (seen.has(m[1])) red(1, `编号重复：${m[1]} —— ${rel(seen.get(m[1]))} 与 ${rel(f)}`);
      else seen.set(m[1], f);
    }
  };
  dupCheck([...nowTasks, ...pastTaskFiles], 'T');
  dupCheck([...nowChanges, ...pastChangeFiles], 'CH');
  // 模块层深（>3 层黄：提示模块边界该重切，而不是继续加深）
  for (const f of mdFiles(MODROOT)) {
    const depth = path.relative(MODROOT, f).split(path.sep).length;
    if (depth > 3) yellow(1, `模块目录超 3 层：${rel(f)}（边界该重切了）`);
  }
}

// ---------- 2 体积超限（行 + 字节双口径，任一超即超） ----------
if (structurePresent) {
  const over = (file, cap) => {
    const t = read(file);
    const L = countLines(t);
    const B = bytesOf(t);
    const capB = cap * config.bytesPerLine;
    if (L > cap || B > capB) red(2, `${rel(file)}：${L} 行 / ${B}B，上限 ${cap} 行 / ${capB}B`);
  };
  for (const f of mdFiles(TRUTH)) over(f, path.basename(f) === 'digest.md' ? config.budgets.digest : config.budgets.truthDoc);
  for (const f of nowTasks) over(f, config.budgets.task);
  for (const f of nowChanges) over(f, config.budgets.change);
  for (const f of pastSummaries) over(f, config.budgets.summary);
  for (const k of kernels) over(k, config.budgets.skillKernel);
  // now/ 总量（inbox 只计件数不计行数，件数归第 6 项管）
  const sep = path.sep;
  const nowMd = mdFiles(NOW).filter((f) => !rel(f).split(sep).includes('inbox'));
  const total = nowMd.reduce((s, f) => s + countLines(read(f)), 0);
  if (total > config.budgets.nowTotal) red(2, `now/ 总量 ${total} 行 > ${config.budgets.nowTotal}——触发强制提前结算（见 lifecycle）`);
  // boot set：每个开放任务实算一遍，取最大
  const base = [path.join(root, 'AGENTS.md'), path.join(root, 'CLAUDE.md'), ...kernels, path.join(DOCS, 'README.md'), iterFile].filter(exists);
  let worst = null;
  for (const task of nowTasks.length ? nowTasks : [null]) {
    const set = [...base];
    if (task) {
      set.push(task);
      const fm = frontmatter(read(task));
      for (const r of Array.isArray(fm.reads) ? fm.reads : []) {
        const p = path.join(root, r);
        if (exists(p)) set.push(p);
        else red(2, `${rel(task)} 必读集文件不存在：${r}`);
      }
    }
    const L = set.reduce((s, f) => s + countLines(read(f)), 0);
    const B = set.reduce((s, f) => s + bytesOf(read(f)), 0);
    if (!worst || L > worst.L) worst = { L, B, task };
  }
  if (worst) {
    const capB = config.budgets.bootSet * config.bytesPerLine;
    if (worst.L > config.budgets.bootSet || worst.B > capB)
      red(2, `开工必读集 ${worst.L} 行 / ${worst.B}B（最重任务：${worst.task ? rel(worst.task) : '无'}）> ${config.budgets.bootSet} 行 / ${capB}B`);
  }
}

// ---------- 3 死链（markdown 链接 + ID 引用；ID 在 now 与 past 两处解析） ----------
if (structurePresent) {
  // past/ 冻结原件不查：相对链接随整体搬迁失效属已知，考古一律经 summary 进入
  const sep = path.sep;
  const scanFiles = [path.join(root, 'AGENTS.md'), path.join(root, 'CLAUDE.md'), path.join(DOCS, 'README.md')]
    .filter(exists)
    .concat(mdFiles(TRUTH))
    .concat(mdFiles(NOW).filter((f) => !rel(f).split(sep).includes('inbox')));
  for (const f of scanFiles) {
    const text = stripCode(read(f));
    for (const m of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const target = m[1];
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      const p = path.resolve(path.dirname(f), decodeURIComponent(target.split('#')[0]));
      if (!exists(p)) red(3, `${rel(f)} 死链：${target}`);
    }
    for (const m of text.matchAll(/(?<![\w.])(T-\d{3}|CH-\d{3}|S-\d{2}\.R-\d{3}|S-\d{2}|D-\d{3})(?![\w.])/g)) {
      if (!resolveId(m[1])) red(3, `${rel(f)} 引用了不存在的 ${m[1]}`);
    }
  }
}

// ---------- 4 腐烂检测（黄） ----------
if (structurePresent) {
  const gitOk = (() => {
    try {
      execFileSync('git', ['rev-parse', '--git-dir'], { cwd: root, stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  })();
  const truthDocs = mdFiles(TRUTH);
  const readmeCode = new Map(); // 目录 README 的 code:（同目录子文件继承）
  for (const f of truthDocs) {
    if (path.basename(f) !== 'README.md') continue;
    const fm = frontmatter(read(f));
    if (fm.code) readmeCode.set(path.dirname(f), Array.isArray(fm.code) ? fm.code : [fm.code]);
  }
  for (const f of truthDocs) {
    const fm = frontmatter(read(f));
    if (!fm.verified || Array.isArray(fm.verified)) {
      yellow(4, `${rel(f)} 缺 frontmatter verified:`);
      continue;
    }
    const vd = Date.parse(fm.verified);
    if (Number.isNaN(vd)) {
      yellow(4, `${rel(f)} verified 日期无法解析：${fm.verified}`);
      continue;
    }
    let code = fm.code ? (Array.isArray(fm.code) ? fm.code : [fm.code]) : readmeCode.get(path.dirname(f)) ?? null;
    if (code && gitOk) {
      const spec = code.map((g) => (g.includes('*') ? `:(glob)${g}` : g));
      try {
        const out = execFileSync('git', ['rev-list', '--count', `--since=${fm.verified}`, 'HEAD', '--', ...spec], { cwd: root, stdio: 'pipe' })
          .toString()
          .trim();
        const n = parseInt(out, 10) || 0;
        if (n > config.rotCommits) yellow(4, `${rel(f)} 疑似腐烂：verified ${fm.verified} 后 code 范围有 ${n} 次提交（阈值 ${config.rotCommits}）`);
      } catch {
        /* 无匹配 pathspec 等情况忽略 */
      }
    } else {
      const days = Math.floor((Date.now() - vd) / 86400000);
      if (days > config.rotDays) yellow(4, `${rel(f)} 太久未核：verified 距今 ${days} 天（阈值 ${config.rotDays}）`);
    }
  }
}

// ---------- 5 孤儿条目（黄） ----------
if (structurePresent) {
  const ledger = [];
  for (const f of itemsFiles) {
    for (const line of read(f).split('\n')) {
      const m = /^(S-\d{2}\.R-\d{3})\s*\|(.*)\|(.*)\|\s*(.+?)\s*$/.exec(line);
      if (m) ledger.push({ id: m[1], status: m[4], file: f });
    }
  }
  for (const it of ledger) {
    if (/^未排期/.test(it.status)) {
      // v1 近似：只要存在已结算迭代，就提醒确认是否跨迭代遗留
      if (pastDirs.length > 0) yellow(5, `${it.id} 未排期（已有 ${pastDirs.length} 个已结算迭代，确认是否遗留）`);
    } else if (/^进行中/.test(it.status)) {
      const t = /T-\d{3}/.exec(it.status)?.[0];
      if (t && !resolveId(t)) yellow(5, `${it.id} 标进行中，但 ${t} 不存在`);
      if (t && new RegExp(`- \\[x\\] ${t}(\\D|$)`).test(iterText)) yellow(5, `${it.id} 仍标进行中，但 ${t} 已勾完成——账本该更新`);
    } else if (!/^(已实现|明确不做)/.test(it.status)) {
      yellow(5, `${it.id} 状态不合法：${it.status}`);
    }
  }
  // 已完成任务 covers 的条目应为 已实现 / 明确不做
  for (const task of nowTasks) {
    const tid = /^T-\d{3}/.exec(path.basename(task))?.[0];
    if (!tid || !new RegExp(`- \\[x\\] ${tid}(\\D|$)`).test(iterText)) continue;
    const fm = frontmatter(read(task));
    for (const c of Array.isArray(fm.covers) ? fm.covers : []) {
      const row = ledger.find((l) => l.id === c);
      if (!row) yellow(5, `${rel(task)} covers ${c}，但账本里没有这条`);
      else if (!/^(已实现|明确不做)/.test(row.status)) yellow(5, `${tid} 已完成，但 ${c} 状态仍为「${row.status}」`);
    }
  }
}

// ---------- 6 inbox 积压（黄） ----------
if (structurePresent) {
  const inbox = path.join(NOW, 'inbox');
  if (exists(inbox)) {
    const chText = nowChanges.map(read).join('\n');
    for (const f of walk(inbox)) {
      const name = path.basename(f);
      if (name === '.gitkeep') continue;
      if (!chText.includes(name)) yellow(6, `inbox 素材未裁决：${rel(f)}（没有任何 CH 引用它）`);
    }
  }
}

// ---------- 7 历史痕迹与阅读面噪声（truth 正文历史化 / 审计报告化检测；唯一可扫 truthDirs 的检查，D-014） ----------
{
  const compoundPat = /(变更|修订|更新|进展|演进|历史)\s*(历史|记录|流水|日志|时间线)|changelog|change\s*log|revision\s+history/i;
  const bareTitlePat = /^(历史|时间线|history)$/i;
  const idPat = /(?<![\w.])(T-\d{3}|CH-\d{3}|S-\d{2}(?:\.R-\d{3})?|D-\d{3}|OQ-\d+)(?![\w.])/;
  const datePat = /\d{4}[-/.年]\d{1,2}(?:[-/.月]\d{1,2}日?)?|\d{1,2}月\d{1,2}日/;
  const anchorPat = /[\w./-]+\.(?:md|mjs|cjs|jsx?|tsx?|py|json|ya?ml|go|rs|java|kt|css|html)(?::\d+)?|第\s*\d+\s*行/;
  const parenPat = /[（(][^（）()]{30,}[）)]/;
  const hint = '建议按 rituals/lint.md 的改写 recipe 拆：当前规则表 + 实现边界表 + 追溯/证据链接';
  // 信号统计前剥 markdown 链接目标——规范引用（链接、行内代码锚点）正是机制要的写法，裸写的才算噪声
  const stripLinks = (t) => t.replace(/\]\([^)]*\)/g, ']');
  for (const dir of TRUTH_DIRS) {
    if (!exists(dir)) continue;
    const isCore = path.resolve(dir) === path.resolve(TRUTH);
    const mark = isCore ? red : yellow; // docs/truth 之外只黄不红：不变量只对装机结构有强制力（D-014）
    const softNote = isCore ? '' : '（truth-like 迁移期路径，提示不阻断）';
    for (const f of mdFiles(dir)) {
      const raw = read(f);
      const text = stripCode(raw);
      // 7a-红：时间线 / 变更历史小节标题
      for (const m of text.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)) {
        if (compoundPat.test(m[1]) || bareTitlePat.test(m[1]))
          mark(7, `${rel(f)} 出现时间线/变更历史小节：「${m[1]}」——truth 只写当前口径，历史归 git 与 past/${softNote}`);
      }
      // 7a-黄：过程性词汇密度
      const lines = countLines(text);
      if (!lines) continue;
      const found = [];
      let hits = 0;
      for (const w of config.historyWords) {
        const n = text.split(w).length - 1;
        if (n > 0) {
          hits += n;
          found.push(`${w}×${n}`);
        }
      }
      const per100 = (hits * 100) / lines;
      if (per100 > config.historyDensityPer100)
        yellow(7, `${rel(f)} 正文历史化嫌疑：过程性词汇 ${hits} 次 / ${lines} 行（每百行 ${per100.toFixed(1)} > ${config.historyDensityPer100}）——${found.join('、')}。${hint}`);
      // 7b/7c 扫描面：剥 frontmatter（verified: 日期不是正文噪声）再剥代码与链接目标
      const fmEnd = raw.startsWith('---') ? raw.indexOf('\n---', 3) : -1;
      const body = stripLinks(stripCode(fmEnd === -1 ? raw : raw.slice(fmEnd + 4))).split('\n');
      // 7b-黄：噪声行——散文 / bullet 同行混排多类信号；表格 / 台账行（含 ≥2 个管道符，如登记簿裸管道行）与标题不计——台账密集是契约
      const isLedger = (s) => s.split('|').length >= 3;
      const prose = body.map((l) => l.trim()).filter((s) => s && !isLedger(s) && !s.startsWith('|') && !s.startsWith('#'));
      const noisy = [];
      for (const s of prose) {
        let sig = 0;
        if (idPat.test(s)) sig++;
        if (datePat.test(s)) sig++;
        if (anchorPat.test(s)) sig++;
        if (config.noiseWords.some((w) => s.includes(w))) sig++;
        if (parenPat.test(s)) sig++;
        if (sig >= config.noiseMinSignals) noisy.push(s);
      }
      const nPer100 = prose.length ? (noisy.length * 100) / prose.length : 0;
      if (nPer100 > config.noiseLinePer100)
        yellow(7, `${rel(f)} 阅读面噪声：${noisy.length}/${prose.length} 行混排多类信号（每百行 ${nPer100.toFixed(1)} > ${config.noiseLinePer100}）——这段像证据明细。${hint}。示例：「${noisy[0].slice(0, 50)}…」`);
      // 7c-黄：超长 bullet / 表格单元格
      const units = [];
      for (const l of body) {
        const s = l.trim();
        if (isLedger(s) || s.startsWith('|')) units.push(...s.split('|').map((c) => c.trim()).filter(Boolean));
        else if (/^[-*+]\s/.test(s)) units.push(s);
      }
      const over = units.filter((u) => [...u].length > config.cellMaxChars);
      if (over.length)
        yellow(7, `${rel(f)} ${over.length} 个超长 bullet/单元格（最长 ${Math.max(...over.map((u) => [...u].length))} 字 > ${config.cellMaxChars}）。${hint}`);
    }
  }
  if (!structurePresent) yellow(7, `未装机（无 ${config.docsDir}/）：仅跑阅读面检查，结构检查 1–6 跳过——迁移坡道，装机是正道（rituals/init.md）`);
}

// ---------- 报告 ----------
const NAMES = { 1: '目录合规', 2: '体积超限', 3: '死链', 4: '腐烂检测', 5: '孤儿条目', 6: 'inbox 积压', 7: '历史痕迹与阅读面噪声' };
const reds = findings.filter((f) => f.level === '红');
const yels = findings.filter((f) => f.level === '黄');
console.log(`docloop 体检 · ${root}`);
for (let c = 1; c <= 7; c++) {
  const list = findings.filter((f) => f.check === c);
  const mark = list.some((f) => f.level === '红') ? '✗' : list.length ? '△' : '✓';
  console.log(`${mark} ${c} ${NAMES[c]}`);
  for (const f of list) console.log(`   [${f.level}] ${f.msg}`);
}
console.log(
  `—— 红 ${reds.length} · 黄 ${yels.length}` +
    (reds.length ? '：存在红项，结算阻断' : yels.length ? '：黄项提醒（结算时须逐条写进 summary 未了事项）' : '：全绿'),
);
process.exit(reds.length ? 1 : 0);
