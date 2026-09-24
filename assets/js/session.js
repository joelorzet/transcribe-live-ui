import { api, connectEvents, escapeHtml } from './api.js';

const sessionId = new URLSearchParams(location.search).get('sessionId');
const elOriginal = document.getElementById('text-original');
const elTranslated = document.getElementById('text-translated');
const lineTranslated = document.getElementById('line-translated');
const labelTranslated = document.getElementById('label-translated');
const labelOriginal = document.getElementById('label-original');
const history = document.getElementById('history');
const langSelect = document.getElementById('lang');

let preferred = localStorage.getItem('transcribe-live.lang') || '';
const recent = [];

if (!sessionId) {
  elOriginal.textContent = 'No sessionId in the URL.';
}

function setStatus(status) {
  const badge = document.getElementById('status-badge');
  badge.className = status === 'connected' ? 'badge badge--live' : 'badge badge--warn';
  document.getElementById('status-text').textContent = status;
}

function refreshDownloads() {
  const lang = preferred || undefined;
  document.getElementById('dl-srt').href = api.transcriptUrl(sessionId, 'srt', lang);
  document.getElementById('dl-vtt').href = api.transcriptUrl(sessionId, 'vtt', lang);
  document.getElementById('dl-txt').href = api.transcriptUrl(sessionId, 'txt', lang);
}

function applySnapshot(snapshot) {
  document.getElementById('title').textContent = snapshot.title;
  document.title = `${snapshot.title} — Transcribe Live`;
  labelOriginal.textContent = `Original (${snapshot.sourceLanguage})`;

  const options = ['<option value="">Original only</option>']
    .concat(snapshot.targetLanguages.map((l) => `<option value="${l}">${l.toUpperCase()}</option>`))
    .join('');
  if (langSelect.innerHTML !== options) {
    langSelect.innerHTML = options;
    if (!preferred && snapshot.targetLanguages.length > 0) preferred = snapshot.targetLanguages[0];
    langSelect.value = preferred;
  }
  refreshDownloads();
}

function pushHistory(original, translated) {
  recent.unshift({ original, translated });
  if (recent.length > 12) recent.pop();
  history.innerHTML = recent
    .map((r) => `<p>${escapeHtml(r.original)}${r.translated ? `<br /><span class="t">${escapeHtml(r.translated)}</span>` : ''}</p>`)
    .join('');
}

let current = { original: '', translated: '' };

function applyEvent(event) {
  if (event.type === 'hello') {
    const snapshot = event.sessions.find((s) => s.id === sessionId);
    if (snapshot) applySnapshot(snapshot);
    return;
  }

  switch (event.type) {
    case 'session.started':
    case 'session.stats':
    case 'session.ended':
      if (event.session.id === sessionId) applySnapshot(event.session);
      break;
    case 'segment.interim':
      elOriginal.classList.remove('caption--empty');
      elOriginal.textContent = event.text;
      break;
    case 'segment.final': {
      if (current.original) pushHistory(current.original, current.translated);
      current = { original: event.segment.text, translated: '' };
      elOriginal.classList.remove('caption--empty');
      elOriginal.textContent = event.segment.text;
      lineTranslated.hidden = true;
      elTranslated.textContent = '';
      break;
    }
    case 'segment.translated':
      if (preferred && event.translation.language !== preferred) return;
      current.translated = event.translation.text;
      labelTranslated.textContent = `Translation (${event.translation.language})`;
      elTranslated.textContent = event.translation.text;
      lineTranslated.hidden = false;
      break;
    default:
      break;
  }
}

langSelect.addEventListener('change', () => {
  preferred = langSelect.value;
  localStorage.setItem('transcribe-live.lang', preferred);
  lineTranslated.hidden = true;
  refreshDownloads();
});

if (sessionId) {
  refreshDownloads();
  connectEvents(sessionId, { onEvent: applyEvent, onStatus: setStatus });
}
