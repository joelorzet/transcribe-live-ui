const DEFAULT_API = 'http://localhost:8787';

export function apiBase() {
  const fromQuery = new URLSearchParams(location.search).get('api');
  if (fromQuery) {
    localStorage.setItem('transcribe-live.api', fromQuery);
    return fromQuery.replace(/\/$/, '');
  }
  return (localStorage.getItem('transcribe-live.api') || DEFAULT_API).replace(/\/$/, '');
}

export function wsBase() {
  return apiBase().replace(/^http/, 'ws');
}

async function request(path, options = {}) {
  const response = await fetch(`${apiBase()}${path}`, {
    headers: { 'content-type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (body.message) message = body.message;
    } catch {
      /* response had no JSON body */
    }
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
}

export const api = {
  health: () => request('/api/health'),
  listSessions: () => request('/api/sessions'),
  createSession: (body) => request('/api/sessions', { method: 'POST', body: JSON.stringify(body) }),
  stopSession: (id) => request(`/api/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  listGlossaries: () => request('/api/glossaries'),
  transcriptUrl: (id, format, lang) => {
    const params = new URLSearchParams({ format });
    if (lang) params.set('lang', lang);
    return `${apiBase()}/api/sessions/${encodeURIComponent(id)}/transcript?${params}`;
  },
};

export function connectEvents(sessionId, handlers) {
  let socket;
  let closed = false;
  let retryMs = 500;

  const open = () => {
    if (closed) return;
    const suffix = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
    socket = new WebSocket(`${wsBase()}/ws/view${suffix}`);

    socket.addEventListener('open', () => {
      retryMs = 500;
      handlers.onStatus?.('connected');
    });

    socket.addEventListener('message', (event) => {
      let payload;
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }
      handlers.onEvent?.(payload);
    });

    socket.addEventListener('close', () => {
      if (closed) return;
      handlers.onStatus?.('reconnecting');
      setTimeout(open, retryMs);
      retryMs = Math.min(retryMs * 2, 8000);
    });

    socket.addEventListener('error', () => socket.close());
  };

  open();
  return () => {
    closed = true;
    socket?.close();
  };
}

export function formatMs(ms) {
  if (!ms) return '0';
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
}

export function formatDuration(seconds) {
  const total = Math.max(0, Math.round(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}
