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

if (!exists(DOCS)) {
  console.error(`✗ 找不到 ${rel(DOCS)}/ —— 这不是 docloop 项目，或先跑装机仪式（init）`);
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
{
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
{
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
{
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
{
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
{
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
{
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

// ---------- 7 历史痕迹密度（truth 正文历史化检测） ----------
{
  const compoundPat = /(变更|修订|更新|进展|演进|历史)\s*(历史|记录|流水|日志|时间线)|changelog|change\s*log|revision\s+history/i;
  const bareTitlePat = /^(历史|时间线|history)$/i;
  for (const f of mdFiles(TRUTH)) {
    const text = stripCode(read(f));
    for (const m of text.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)) {
      if (compoundPat.test(m[1]) || bareTitlePat.test(m[1]))
        red(7, `${rel(f)} 出现时间线/变更历史小节：「${m[1]}」——不变量 1：truth 只写当前口径，历史归 git 与 past/`);
    }
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
      yellow(7, `${rel(f)} 正文历史化嫌疑：过程性词汇 ${hits} 次 / ${lines} 行（每百行 ${per100.toFixed(1)} > ${config.historyDensityPer100}）——${found.join('、')}`);
  }
}

// ---------- 报告 ----------
const NAMES = { 1: '目录合规', 2: '体积超限', 3: '死链', 4: '腐烂检测', 5: '孤儿条目', 6: 'inbox 积压', 7: '历史痕迹密度' };
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
