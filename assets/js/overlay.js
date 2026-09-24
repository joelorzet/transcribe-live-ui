import { connectEvents } from './api.js';

const params = new URLSearchParams(location.search);
const sessionId = params.get('sessionId');
const only = params.get('only');
const lang = params.get('lang');

if (params.get('chroma') === '1') document.body.classList.add('chroma');

const elOriginal = document.getElementById('original');
const elTranslated = document.getElementById('translated');
const elOffline = document.getElementById('offline');

if (only === 'translated') elOriginal.style.display = 'none';
if (only === 'original') elTranslated.style.display = 'none';

let clearTimer;

function keepAlive() {
  clearTimeout(clearTimer);
  clearTimer = setTimeout(() => {
    elOriginal.textContent = '';
    elTranslated.textContent = '';
  }, 12000);
}

function applyEvent(event) {
  switch (event.type) {
    case 'segment.interim':
      elOriginal.textContent = event.text;
      keepAlive();
      break;
    case 'segment.final':
      elOriginal.textContent = event.segment.text;
      elTranslated.textContent = '';
      keepAlive();
      break;
    case 'segment.translated':
      if (lang && event.translation.language !== lang) return;
      elTranslated.textContent = event.translation.text;
      keepAlive();
      break;
    default:
      break;
  }
}

if (sessionId) {
  connectEvents(sessionId, {
    onEvent: applyEvent,
    onStatus: (status) => {
      elOffline.hidden = status === 'connected';
    },
  });
} else {
  elOriginal.textContent = 'Add ?sessionId=… to the overlay URL';
}
