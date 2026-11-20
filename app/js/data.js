// Loads the trophy list: app/data/trophies.json, the 55 official trophies with
// our own guides. One fetch, same origin, no network beyond the app's server.
let cache = null;

export async function loadTrophies() {
  if (cache) return cache;
  const res = await fetch('./data/trophies.json');
  if (!res.ok) throw new Error('trophies.json failed to load: ' + res.status);
  const data = await res.json();
  cache = Array.isArray(data) ? data : data.trophies;
  return cache;
}

export function gradeRank(grade) {
  return { platinum: 0, gold: 1, silver: 2, bronze: 3 }[grade] ?? 4;
}

export function sortTrophies(list) {
  return [...list].sort((a, b) => gradeRank(a.grade) - gradeRank(b.grade) || a.id - b.id);
}
