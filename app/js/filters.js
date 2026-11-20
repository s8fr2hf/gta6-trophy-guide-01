// Filters: by kind, by text, and the spoiler rule. A story trophy the reader
// has not earned yet hides its name and description while spoiler-safe mode
// is on; its grade and its guide stay hidden with it.
export const KINDS = [
  ['all', 'All kinds'],
  ['story', 'Story'],
  ['missable', 'Missable'],
  ['side', 'Side strands'],
  ['activity', 'Activities'],
  ['collectible', 'Collectibles'],
  ['combat', 'Combat & heists'],
  ['exploration', 'Exploration'],
  ['economy', 'Money'],
  ['misc', 'Odd jobs'],
  ['completion', '100% & platinum'],
];

export function kindOf(trophy) {
  if (trophy.kind === 'platinum' || trophy.kind === 'completion') return 'completion';
  return trophy.kind;
}

export function applyFilters(trophies, earned, { kind, query, hideEarned }) {
  const q = query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (kind === 'missable') {
      if (!t.missable) return false;
    } else if (kind !== 'all' && kindOf(t) !== kind) {
      return false;
    }
    if (hideEarned && earned.has(t.id)) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

export function isSpoilerHidden(trophy, earned, spoilerOn) {
  return spoilerOn && trophy.kind === 'story' && !earned.has(trophy.id);
}

export function gradeCounts(trophies, earned) {
  const counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) {
    if (!counts[t.grade]) continue;
    counts[t.grade][1] += 1;
    if (earned.has(t.id)) counts[t.grade][0] += 1;
  }
  return counts;
}
