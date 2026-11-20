// Boot: loads the guide, wires the toolbar and tabs, and keeps every view in sync.
import { loadGuide } from './js/data.js';
import { loadEarned, saveEarned, exportText, parseImport } from './js/store.js';
import { applyFilters } from './js/filters.js';
import { renderProgress, renderList, renderDetail, renderRoadmap, renderMissables, renderSources } from './js/views.js';

const state = {
  search: '',
  kind: '',
  grade: '',
  earned: '',
  missableOnly: false,
  hideSpoilers: true,
  view: 'tracker',
  selectedId: null,
};

let guide = null;
let earned = loadEarned();

function currentTrophy() {
  return guide ? guide.trophies.find((t) => t.id === state.selectedId) || null : null;
}

function renderAll() {
  if (!guide) return;
  renderProgress(guide.trophies, earned);
  const filtered = applyFilters(guide.trophies, state, earned);
  renderList(filtered, state, earned, state.selectedId,
    (id) => { state.selectedId = id; renderAll(); },
    (id) => toggleEarned(id));
  renderDetail(currentTrophy(), state, earned, (id) => toggleEarned(id));
  renderRoadmap(guide, earned);
  renderMissables(guide, (id) => {
    state.selectedId = id;
    state.view = 'tracker';
    state.hideSpoilers = false;
    document.getElementById('spoilerToggle').checked = false;
    showView('tracker');
    renderAll();
  });
  renderSources(guide);
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id);
  else earned.add(id);
  saveEarned(earned);
  renderAll();
}

function showView(view) {
  state.view = view;
  for (const btn of document.querySelectorAll('#tabs .tab')) {
    btn.classList.toggle('active', btn.dataset.view === view);
  }
  for (const section of document.querySelectorAll('main .view')) {
    section.hidden = section.id !== `view-${view}`;
  }
}

function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function boot() {
  guide = await loadGuide();

  const params = new URLSearchParams(location.search);
  if (params.get('view')) showView(params.get('view'));
  if (params.get('spoilers') === 'off') {
    state.hideSpoilers = false;
    document.getElementById('spoilerToggle').checked = false;
  }
  if (params.get('focus')) {
    const focusId = Number(params.get('focus'));
    if (guide.trophies.some((t) => t.id === focusId)) state.selectedId = focusId;
  }

  document.getElementById('searchInput').addEventListener('input', (e) => { state.search = e.target.value; renderAll(); });
  document.getElementById('kindFilter').addEventListener('change', (e) => { state.kind = e.target.value; renderAll(); });
  document.getElementById('gradeFilter').addEventListener('change', (e) => { state.grade = e.target.value; renderAll(); });
  document.getElementById('earnedFilter').addEventListener('change', (e) => { state.earned = e.target.value; renderAll(); });
  document.getElementById('missableOnly').addEventListener('change', (e) => { state.missableOnly = e.target.checked; renderAll(); });
  document.getElementById('spoilerToggle').addEventListener('change', (e) => { state.hideSpoilers = e.target.checked; renderAll(); });
  document.querySelectorAll('#tabs .tab').forEach((btn) => {
    btn.addEventListener('click', () => { showView(btn.dataset.view); });
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    download('leonida-trophy-progress.json', exportText(earned));
    document.getElementById('saveNote').textContent = 'Progress exported.';
  });
  const importFile = document.getElementById('importFile');
  document.getElementById('importBtn').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', async () => {
    const file = importFile.files[0];
    if (!file) return;
    try {
      const ids = parseImport(await file.text());
      const known = new Set(guide.trophies.map((t) => t.id));
      earned = new Set([...ids].filter((id) => known.has(id)));
      saveEarned(earned);
      document.getElementById('saveNote').textContent = `Imported ${earned.size} earned trophies.`;
    } catch {
      document.getElementById('saveNote').textContent = 'That file is not a progress export.';
    }
    importFile.value = '';
    renderAll();
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies?')) {
      earned = new Set();
      saveEarned(earned);
      document.getElementById('saveNote').textContent = 'Progress cleared.';
      renderAll();
    }
  });

  renderAll();
}

boot().catch((err) => {
  document.getElementById('trophyList').textContent = '';
  const note = document.getElementById('resultLine');
  note.textContent = `Could not load the trophy list: ${err.message}`;
});
