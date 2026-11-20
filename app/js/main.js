// Boot: loads the trophies, reads saved progress and settings, wires the
// toolbar and the hash routes (#/, #/roadmap, #/missables, #/settings and
// #/trophy/<id>), and renders the current view. No network beyond the app.
import { loadTrophies } from './data.js';
import { loadProgress, saveProgress, loadSettings, saveSettings, exportProgress, importProgress } from './store.js';
import { renderProgress, renderKindFilters, renderChecklist, renderDetail, renderRoadmap, renderMissables, renderSettings } from './views.js';

const view = document.getElementById('view');
const detailBox = document.getElementById('detail');
const toolbar = document.getElementById('toolbar');
const searchBox = document.getElementById('searchBox');
const hideEarnedBox = document.getElementById('hideEarned');
const spoilerBox = document.getElementById('spoilerToggle');

let trophies = [];
let earned = loadProgress();
let settings = loadSettings();
let kind = 'all';

function currentRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  const [page, arg] = hash.split('/');
  return { page: page || 'checklist', arg };
}

function syncToolbar(route) {
  toolbar.style.display = route.page === 'checklist' ? '' : 'none';
  document.querySelectorAll('.tabs a').forEach((a) => {
    a.classList.toggle('active', a.dataset.view === route.page || (route.page === 'trophy' && a.dataset.view === 'checklist'));
  });
  searchBox.value = searchBox.value || '';
  hideEarnedBox.checked = settings.hideEarned;
  spoilerBox.checked = settings.spoiler;
}

function render() {
  const route = currentRoute();
  syncToolbar(route);
  renderProgress(trophies, earned);
  renderKindFilters(kind, (value) => { kind = value; render(); });
  detailBox.hidden = true;
  if (route.page === 'roadmap') {
    renderRoadmap(view, trophies, earned);
  } else if (route.page === 'missables') {
    renderMissables(view, trophies, earned);
  } else if (route.page === 'settings') {
    renderSettings(view, trophies, earned, {
      onExport: () => exportProgress(earned),
      onImport: async (file) => {
        try {
          earned = await importProgress(file);
          saveProgress(earned);
          render();
        } catch (err) {
          alert('That file could not be imported: ' + err.message);
        }
      },
      onReset: () => {
        if (confirm('Clear all earned trophies?')) {
          earned = new Set();
          saveProgress(earned);
          render();
        }
      },
    });
  } else {
    renderChecklist(view, trophies, earned, { kind, query: searchBox.value, hideEarned: settings.hideEarned }, settings, {
      onToggle: (id, checked) => {
        if (checked) earned.add(id); else earned.delete(id);
        saveProgress(earned);
        render();
      },
      onOpen: (id) => openDetail(id),
    });
    if (route.page === 'trophy' && route.arg) {
      const id = Number(route.arg);
      const trophy = trophies.find((t) => t.id === id);
      if (trophy) renderDetail(detailBox, trophy, earned, settings.spoiler, () => { location.hash = '#/'; }, (tid, checked) => {
        if (checked) earned.add(tid); else earned.delete(tid);
        saveProgress(earned);
        render();
        openDetail(tid);
      });
    }
  }
}

function openDetail(id) {
  location.hash = '#/trophy/' + id;
}

searchBox.addEventListener('input', () => render());
hideEarnedBox.addEventListener('change', () => {
  settings.hideEarned = hideEarnedBox.checked;
  saveSettings(settings);
  render();
});
spoilerBox.addEventListener('change', () => {
  settings.spoiler = spoilerBox.checked;
  saveSettings(settings);
  render();
});
window.addEventListener('hashchange', () => render());

loadTrophies()
  .then((list) => {
    trophies = list;
    render();
  })
  .catch((err) => {
    view.innerHTML = '<p class="empty">The trophy list failed to load: ' + err.message + '</p>';
  });
