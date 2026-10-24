/* GEO-PULSE v94 / public community counters; no third-party requests until API URL is configured. */
(() => {
  'use strict';
  const ownId = 'geo-impact-my-amount';
  const visitedId = 'geo-impact-unique-pages';
  const collectedId = 'geo-impact-page-opens';
  const keyId = 'geo_pulse_community_install_id_v94';
  const keySent = 'geo_pulse_community_last_sent_v94';
  const labels = {
    virtualYen: 'geo-impact-global-amount',
    visitedPages: 'geo-impact-global-visited',
    collectedPages: 'geo-impact-global-collected'
  };
  const MAX_YEN = 1000000000;
  const MAX_PAGES = 33;
  const node = id => document.getElementById(id);
  const number = id => {
    const n = Number((node(id)?.textContent || '0').replace(/[^\d]/g, ''));
    return Number.isSafeInteger(n) ? n : 0;
  };
  const bound = (n, max) => Math.max(0, Math.min(max, Math.floor(n)));
  const format = n => bound(n, Number.MAX_SAFE_INTEGER).toLocaleString('ja-JP');
  const fmtYen = n => format(n) + ' 仮想円';

  let api = '';
  let clientId = null;
  let lastSent = '';
  let sending = false;
  let sendScheduled = false;
  let sendTimer = 0;
  let lastPostAt = 0;
  let lastGetAt = 0;
  const status = () => node('geo-impact-global-status');
  const setStatus = message => { if (status()) status().textContent = message; };
  const setTotals = totals => {
    if (!totals || !['virtualYen', 'visitedPages', 'collectedPages'].every(k => Number.isSafeInteger(totals[k]) && totals[k] >= 0)) return false;
    const yen = node(labels.virtualYen);
    const visited = node(labels.visitedPages);
    const collected = node(labels.collectedPages);
    if (yen) yen.textContent = fmtYen(totals.virtualYen);
    if (visited) visited.textContent = format(totals.visitedPages) + ' 件';
    if (collected) collected.textContent = format(totals.collectedPages) + ' 件';
    setStatus('共有集計・参考値（匿名・延べ数）');
    return true;
  };
  function snapshot() {
    return {
      virtualYen: bound(number(ownId), MAX_YEN),
      visitedPages: bound(number(visitedId), MAX_PAGES),
      collectedPages: bound(number(collectedId), MAX_PAGES)
    };
  }
  function idForThisBrowser() {
    try {
      const id = localStorage.getItem(keyId);
      if (id && /^[0-9a-f]{8}-[0-9a-f-]{27,}$/.test(id)) return id;
      if (typeof crypto?.randomUUID !== 'function') return null;
      const next = crypto.randomUUID();
      localStorage.setItem(keyId, next);
      return next;
    } catch (_) { return null; }
  }
  function readLastSent() { try { return localStorage.getItem(keySent) || ''; } catch (_) { return ''; } }
  function persistLastSent(payload) {
    try { localStorage.setItem(keySent, payload); } catch (_) { /* degraded mode: requests still idempotent server-side */ }
  }
  async function request(method, data) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(api, {
        method, mode: 'cors', credentials: 'omit', cache: 'no-store',
        headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {},
        body: method === 'POST' ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const json = await response.json();
      if (!json || json.ok !== true || !setTotals(json.totals)) throw new Error('Invalid API response');
      return true;
    } finally { clearTimeout(timer); }
  }
  async function refresh() {
    if (!api) return;
    lastGetAt = Date.now();
    try { await request('GET'); }
    catch (_) { setStatus('共有集計に接続できません（数値未更新）'); }
  }
  async function send() {
    if (!api || !clientId || sending) return;
    const payload = JSON.stringify(snapshot());
    if (payload === lastSent) return;
    sending = true;
    lastPostAt = Date.now();
    setStatus('みんなの集計を更新中…');
    try {
      if (await request('POST', { clientId, ...JSON.parse(payload) })) {
        lastSent = payload;
        persistLastSent(payload);
      }
    } catch (_) { setStatus('共有集計を送信できません（自分の記録は保持）'); }
    finally {
      sending = false;
      if (JSON.stringify(snapshot()) !== payload) schedule();
    }
  }
  function schedule() {
    if (!api || !clientId || sendScheduled) return;
    sendScheduled = true;
    clearTimeout(sendTimer);
    // Coalesce animations, then limit write frequency for reliability and D1 costs.
    sendTimer = setTimeout(() => {
      sendScheduled = false;
      const delay = Math.max(0, 8000 - (Date.now() - lastPostAt));
      if (delay > 0) { sendScheduled = true; sendTimer = setTimeout(() => { sendScheduled = false; void send(); }, delay); }
      else void send();
    }, 1800);
  }
  function init() {
    const meta = document.querySelector('meta[name="geo-community-api"]');
    const candidate = (meta?.content || '').trim();
    try {
      if (candidate) {
        const url = new URL(candidate);
        if (url.protocol === 'https:' && url.hostname.endsWith('.workers.dev') && url.pathname === '/api/community' && !url.username && !url.password && !url.search && !url.hash) api = url.href;
      }
    } catch (_) { /* no connection; preserve local counters */ }
    if (!api) {
      setStatus('共有集計サーバー未接続（実数は未取得）');
      window.__geoCommunityV94QA = () => ({ connected: false, own: snapshot() });
      return;
    }
    clientId = idForThisBrowser();
    lastSent = readLastSent();
    if (!clientId) setStatus('匿名IDを保存できません（閲覧のみ）');
    void refresh();
    // Observe only personal values, not the global result nodes. Avoid recursion.
    const observer = new MutationObserver(schedule);
    for (const id of [ownId, visitedId, collectedId]) {
      if (node(id)) observer.observe(node(id), { childList: true, subtree: true, characterData: true });
    }
    schedule();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if (Date.now() - lastGetAt > 120000) void refresh();
        schedule();
      }
    }, { passive: true });
    window.addEventListener('storage', event => {
      if (event.key === keySent) lastSent = readLastSent();
      if (['geo_pulse_number_bank_v1', 'geo_pulse_volunteer_page_opens_v31'].includes(event.key)) schedule();
    });
    window.__geoCommunityV94QA = () => ({ connected: true, hasClientId: Boolean(clientId), own: snapshot(), lastSent: Boolean(lastSent), global: {
      virtualYen: node(labels.virtualYen)?.textContent, visitedPages: node(labels.visitedPages)?.textContent,
      collectedPages: node(labels.collectedPages)?.textContent, status: status()?.textContent
    }});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
