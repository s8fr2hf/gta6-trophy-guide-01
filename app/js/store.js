// Progress saved in the browser: which trophies are earned, and the spoiler setting.
const KEY = 'leonida-trophy-guide-v1';
const SPOILER_KEY = 'leonida-trophy-guide-spoilers';

function readRaw() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function loadProgress() {
  const raw = readRaw();
  const earned = new Set();
  if (Array.isArray(raw.earned)) {
    for (const id of raw.earned) earned.add(Number(id));
  }
  return earned;
}

export function saveProgress(earned) {
  localStorage.setItem(KEY, JSON.stringify({ earned: [...earned].sort((a, b) => a - b) }));
}

export function toggleEarned(earned, id) {
  if (earned.has(id)) earned.delete(id);
  else earned.add(id);
  saveProgress(earned);
  return earned;
}

export function exportProgress(earned) {
  const blob = new Blob([JSON.stringify({ earned: [...earned].sort((a, b) => a - b) }, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

export async function importProgress(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!Array.isArray(data.earned)) throw new Error('not a progress file');
  const earned = new Set(data.earned.map(Number).filter((n) => Number.isInteger(n)));
  saveProgress(earned);
  return earned;
}

export function loadSpoilers() {
  return localStorage.getItem(SPOILER_KEY) === '1';
}

export function saveSpoilers(on) {
  localStorage.setItem(SPOILER_KEY, on ? '1' : '0');
}
