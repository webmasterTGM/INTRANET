/* hlavní javascriptové funkce */
function showPreloader(text) {
  const el = document.getElementById('preloader');
  const t = document.getElementById('preloaderText');
  if (t) t.textContent = text || 'Načítám ...';
  if (el) {
    el.classList.remove('hidden');
    el.setAttribute('aria-hidden', 'false');
  }
}

function hidePreloader() {
  const el = document.getElementById('preloader');
  if (el) {
    el.classList.add('hidden');
    el.setAttribute('aria-hidden', 'true');
  }
}

function showElement(elementId) {
  const elm = document.getElementById(elementId);
  if(elm) {
    elm.style.display = '';
    elm.classList.remove('hidden');
  }
}

function hideElement(elementId) {
  const elm = document.getElementById(elementId);
  if(elm) {
    elm.style.display = 'none';
    elm.classList.add('hidden');
  }
}

alert('loaded Main.js');
