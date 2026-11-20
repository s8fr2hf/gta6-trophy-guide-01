// Leonida Trophy Guide — entry point. Wires the toolbar, the tabs and the
// hash routes together, and keeps the progress bar honest.
import { loadTrophies, trophyById } from './js/data.js';
import {
  loadProgress,
  saveProgress,
  toggleEarned,
  exportProgress,
  importProgress,
  loadSpoilers,
  saveSpoilers,
} from './js/store.js';
import {
  renderChecklist,
  renderDetail,
  renderRoadmap,
  renderMissables,
  renderSettings,
} from './js/views.js';

const view = document.getElementById('view');
const detail = document.getElementById('detail');
const searchBox = document.getElementById('search');
const kindBox = document.getElementById('kind');
const gradeBox = document.getElementById('grade');
const spoilerBox = document.getElementById('spoilers');

let data = null;
let earned = loadProgress();
let spoilers = loadSpoilers();
const filter = { q: '', kind: 'all', grade: 'all' };

function route() {
  const hash = location.hash || '#/';
  const parts = hash.replace(/^#\//, '').split('/');
  return { page: parts[0] || '', arg: parts[1] || '' };
}

function updateProgress() {
  const n = earned.size;
  const pct = Math.round((n / 55) * 100);
  document.getElementById('progress-text').textContent = `${n} of 55 earned`;
  document.getElementById('progress-pct').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  for (const a of document.querySelectorAll('.tabs a')) {
    a.classList.toggle('active', a.dataset.tab === currentTab());
  }
}

function currentTab() {
  const { page } = route();
  if (page === 'roadmap') return 'roadmap';
  if (page === 'missables') return 'missables';
  if (page === 'settings') return 'settings';
  return 'checklist';
}

function render() {
  if (!data) return;
  const { page, arg } = route();
  updateProgress();
  if (page === 'roadmap') {
    view.innerHTML = renderRoadmap(data, earned);
    detail.innerHTML = '<h2>Roadmap</h2><p>Three stages, in order. The story first, the open world second, the 100% checklist last.</p>';
  } else if (page === 'missables') {
    view.innerHTML = renderMissables(data, earned);
    detail.innerHTML = '<h2>One to watch</h2><p>Positive Mental Attitude is the only trophy reported as possibly missable. Everything else can wait until after the story.</p>';
  } else if (page === 'settings') {
    view.innerHTML = renderSettings(data, earned, spoilers);
    detail.innerHTML = '<h2>Settings</h2><p>Your progress and the spoiler setting live in this browser only.</p>';
    const box = document.getElementById('spoilers-setting');
    if (box) {
      box.addEventListener('change', () => {
        spoilers = box.checked;
        saveSpoilers(spoilers);
        spoilerBox.checked = spoilers;
        render();
      });
    }
  } else if (page === 'trophy' && arg) {
    const t = trophyById(data, Number(arg));
    view.innerHTML = renderChecklist(data, earned, spoilers, filter);
    detail.innerHTML = t ? renderDetail(data, earned, spoilers, t.id) : '<p>That trophy is not in the list.</p>';
  } else {
    view.innerHTML = renderChecklist(data, earned, spoilers, filter);
    const firstMissable = data.trophies.find((t) => t.missable);
    detail.innerHTML = firstMissable
      ? renderDetail(data, earned, spoilers, firstMissable.id)
      : '<p>Pick a trophy to read its guide.</p>';
  }
  wireEarnBoxes();
}

function wireEarnBoxes() {
  for (const box of document.querySelectorAll('[data-earn]')) {
    box.addEventListener('change', () => {
      earned = toggleEarned(earned, Number(box.dataset.earn));
      saveProgress(earned);
      render();
    });
  }
}

searchBox.addEventListener('input', () => {
  filter.q = searchBox.value;
  if (currentTab() === 'checklist') render();
});
kindBox.addEventListener('change', () => {
  filter.kind = kindBox.value;
  render();
});
gradeBox.addEventListener('change', () => {
  filter.grade = gradeBox.value;
  render();
});
spoilerBox.addEventListener('change', () => {
  spoilers = spoilerBox.checked;
  saveSpoilers(spoilers);
  render();
});
document.getElementById('export').addEventListener('click', () => exportProgress(earned));
document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    earned = await importProgress(file);
    render();
  } catch {
    alert('That file is not a progress export from this guide.');
  }
  event.target.value = '';
});
window.addEventListener('hashchange', render);

spoilerBox.checked = spoilers;

loadTrophies()
  .then((loaded) => {
    data = loaded;
    render();
  })
  .catch(() => {
    view.innerHTML = '<p>The trophy list did not load. Check that data/trophies.json is beside this page and reload.</p>';
  });
