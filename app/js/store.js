// Saved progress: which trophies are earned, kept in the browser's
// localStorage, plus export to a file and import back. Nothing leaves the
// browser except the file the reader asks to download.
const PROGRESS_KEY = 'leonida-trophy-progress-v1';
const SETTINGS_KEY = 'leonida-trophy-settings-v1';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

export function saveProgress(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { spoiler: !!parsed.spoiler, hideEarned: !!parsed.hideEarned };
  } catch {
    return { spoiler: false, hideEarned: false };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function exportProgress(earned) {
  const blob = new Blob([JSON.stringify({ app: 'leonida-trophy-guide', version: 1, earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

export async function importProgress(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  const ids = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(ids)) throw new Error('That file holds no earned list.');
  return new Set(ids.filter((n) => Number.isInteger(n)));
}
