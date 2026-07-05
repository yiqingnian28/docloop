#!/usr/bin/env node
// 书签管家 CLI（示例桩）：真实项目里这里是实现；本示例只为让 truth 的 code: 映射有落点
export const store = new Map();
export function add(url, title = new URL(url).hostname, tags = []) {
  if (store.has(url)) throw new Error('重复 URL');
  store.set(url, { title, tags });
}
export function rm(url) {
  if (!store.delete(url)) throw new Error('ID 不存在');
}
