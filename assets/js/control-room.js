import { api, connectEvents, escapeHtml, formatDuration, formatMs } from './api.js';

const grid = document.getElementById('sessions');
const empty = document.getElementById('empty');
const form = document.getElementById('create-form');
const createBtn = document.getElementById('create-btn');

const tracks = new Map();

function icon(path, size = 14) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

const ICON_VIEW = icon('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>');
const ICON_LAYERS = icon('<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>');
const ICON_DOWNLOAD = icon('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>');
const ICON_STOP = icon('<rect x="6" y="6" width="12" height="12" rx="2"/>');

function toast(message, ok = false) {
  const el = document.createElement('div');
  el.className = ok ? 'toast toast--ok' : 'toast';
  el.setAttribute('role', 'status');
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 5200);
}

function track(id) {
  if (!tracks.has(id)) {
    tracks.set(id, { snapshot: null, interim: '', original: '', translations: new Map() });
  }
  return tracks.get(id);
}

function statusBadge(snapshot) {
  if (snapshot.status === 'live') return '<span class="badge badge--live"><span class="dot"></span>live</span>';
  if (snapshot.status === 'error') return '<span class="badge badge--warn"><span class="dot"></span>error</span>';
  if (snapshot.status === 'ended') return '<span class="badge badge--idle"><span class="dot"></span>ended</span>';
  return '<span class="badge badge--idle"><span class="dot"></span>starting</span>';
}

function cardHtml(id, entry) {
  const s = entry.snapshot;
  const targets = s.targetLanguages.join(' + ');
  const translated = [...entry.translations.entries()]
    .map(([lang, text]) => `<p class="caption caption--translated"><span class="lang-pair">${lang}</span> ${escapeHtml(text)}</p>`)
    .join('');

  const original = entry.original
    ? `<p class="caption">${escapeHtml(entry.original)}</p>`
    : '';
  const interim = entry.interim
    ? `<p class="caption caption--interim">${escapeHtml(entry.interim)}</p>`
    : '';
  const placeholder = !original && !interim && !translated
    ? '<p class="caption caption--empty">Waiting for audio…</p>'
    : '';

  return `
    <article class="card ${s.status === 'live' ? 'card--live' : ''}" data-id="${escapeHtml(id)}">
      <div class="card__head">
        <span class="card__title" title="${escapeHtml(s.title)}">${escapeHtml(s.title)}</span>
        <span class="lang-pair">${escapeHtml(s.sourceLanguage)} → ${escapeHtml(targets)}</span>
        <div class="spacer"></div>
        ${statusBadge(s)}
      </div>
      <div class="card__captions">${placeholder}${interim}${original}${translated}</div>
      <div class="card__metrics">
        <div class="metric"><div class="metric__label">Latency p50</div><div class="metric__value">${formatMs(s.latency.p50)}</div></div>
        <div class="metric"><div class="metric__label">Words</div><div class="metric__value">${s.words}</div></div>
        <div class="metric"><div class="metric__label">Audio</div><div class="metric__value">${formatDuration(s.audioSeconds)}</div></div>
        <div class="metric"><div class="metric__label">Cost</div><div class="metric__value">$${s.cost.usd.toFixed(4)}</div></div>
      </div>
      <div class="card__actions">
        <a class="btn btn--sm" href="session.html?sessionId=${encodeURIComponent(id)}" target="_blank" rel="noopener">${ICON_VIEW} Captions</a>
        <a class="btn btn--sm" href="overlay.html?sessionId=${encodeURIComponent(id)}" target="_blank" rel="noopener">${ICON_LAYERS} Overlay</a>
        <a class="btn btn--sm" href="${api.transcriptUrl(id, 'srt')}">${ICON_DOWNLOAD} SRT</a>
        <div class="spacer"></div>
        <button class="btn btn--sm btn--danger" data-stop="${escapeHtml(id)}" ${s.status !== 'live' && s.status !== 'starting' ? 'disabled' : ''}>${ICON_STOP} Stop</button>
      </div>
    </article>`;
}

function render() {
  const entries = [...tracks.entries()].filter(([, e]) => e.snapshot);
  empty.hidden = entries.length > 0;
  grid.innerHTML = entries.map(([id, entry]) => cardHtml(id, entry)).join('');
  renderTotals(entries.map(([, e]) => e.snapshot));
}

function renderTotals(snapshots) {
  const live = snapshots.filter((s) => s.status === 'live').length;
  const words = snapshots.reduce((sum, s) => sum + s.words, 0);
  const cost = snapshots.reduce((sum, s) => sum + s.cost.usd, 0);
  const active = snapshots.filter((s) => s.latency.count > 0);
  const p50 = active.length ? Math.round(active.reduce((a, s) => a + s.latency.p50, 0) / active.length) : 0;
  const p95 = active.length ? Math.max(...active.map((s) => s.latency.p95)) : 0;

  document.getElementById('s-live').textContent = String(live);
  document.getElementById('s-words').textContent = words.toLocaleString();
  document.getElementById('s-p50').innerHTML = `${p50}<span class="stat__unit">ms</span>`;
  document.getElementById('s-p95').innerHTML = `${p95}<span class="stat__unit">ms</span>`;
  document.getElementById('s-cost').textContent = `$${cost.toFixed(2)}`;
}

function applyEvent(event) {
  if (event.type === 'hello') {
    for (const snapshot of event.sessions) track(snapshot.id).snapshot = snapshot;
    render();
    return;
  }

  const id = event.sessionId ?? event.session?.id;
  if (!id) return;
  const entry = track(id);

  switch (event.type) {
    case 'session.started':
    case 'session.stats':
    case 'session.ended':
      entry.snapshot = event.session;
      break;
    case 'segment.interim':
      entry.interim = event.text;
      break;
    case 'segment.final':
      entry.original = event.segment.text;
      entry.interim = '';
      entry.translations.clear();
      break;
    case 'segment.translated':
      entry.translations.set(event.translation.language, event.translation.text);
      break;
    default:
      return;
  }
  render();
}

grid.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-stop]');
  if (!button) return;
  button.disabled = true;
  try {
    await api.stopSession(button.dataset.stop);
    toast('Track stopped', true);
  } catch (error) {
    toast(error.message);
    button.disabled = false;
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  createBtn.disabled = true;
  const data = Object.fromEntries(new FormData(form));
  try {
    const session = await api.createSession(data);
    track(session.id).snapshot = session;
    form.querySelector('#f-title').value = '';
    render();
    toast(`Track "${session.title}" is live`, true);
  } catch (error) {
    toast(error.message);
  } finally {
    createBtn.disabled = false;
  }
});

async function boot() {
  try {
    const health = await api.health();
    const badge = document.getElementById('engine-badge');
    const isReal = health.engine === 'gemini';
    badge.className = isReal ? 'badge badge--live' : 'badge badge--warn';
    document.getElementById('engine-text').textContent = isReal ? health.models.transcription : 'MOCK ENGINE';
    document.getElementById('capacity-badge').textContent = `capacity ${health.capacity}`;
  } catch (error) {
    document.getElementById('engine-text').textContent = 'api unreachable';
    document.getElementById('engine-badge').className = 'badge badge--warn';
    toast(`Cannot reach the API: ${error.message}`);
  }

  try {
    const { glossaries } = await api.listGlossaries();
    document.getElementById('f-glossary').innerHTML = glossaries
      .map((g) => `<option value="${escapeHtml(g.id)}" ${g.id === 'nerdearla' ? 'selected' : ''}>${escapeHtml(g.name)} (${g.terms})</option>`)
      .join('');
  } catch {
    /* glossaries are optional */
  }

  connectEvents(null, {
    onEvent: applyEvent,
    onStatus: (status) => {
      const el = document.getElementById('link-status');
      el.className = status === 'connected' ? 'badge badge--live' : 'badge badge--warn';
      document.getElementById('link-text').textContent = status;
    },
  });
}

boot();
