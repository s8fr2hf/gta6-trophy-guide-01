// Progress store: earned trophy ids kept in localStorage, with export and import.
const STORAGE_KEY = 'leonida-trophy-progress-v1';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    // Storage full or unavailable: progress lives only for this visit.
  }
}

export function exportText(earned) {
  return JSON.stringify({ app: 'leonida-trophy-guide', version: 1, earned: [...earned].sort((a, b) => a - b) }, null, 2);
}

export function parseImport(text) {
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(list)) throw new Error('Not a progress file');
  const ids = list.filter((id) => Number.isInteger(id));
  if (ids.length === 0 && list.length > 0) throw new Error('No trophy ids in file');
  return new Set(ids);
}
