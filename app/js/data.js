// Loads the trophy list and answers simple questions about it.
let cache = null;

export async function loadTrophies() {
  if (cache) return cache;
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('trophies.json did not load');
  const data = await response.json();
  cache = data;
  return cache;
}

export function trophyById(data, id) {
  return data.trophies.find((t) => t.id === id) || null;
}

export function counts(data) {
  const out = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of data.trophies) out[t.grade] = (out[t.grade] || 0) + 1;
  return out;
}

// The three roadmap stages: story first, then the open world, then cleanup.
export const STAGES = [
  {
    n: 1,
    title: 'Stage 1 — Play the story',
    text: 'Chapters 1 to 4, in order. Keep a manual save at the start and the end of every chapter: there is no mission replay, and cheats disable trophies and saving, so leave them off. Do the Chapter 1 meditation with Lucia at Jason\u2019s house while you still can — it is the one trophy you can miss.',
  },
  {
    n: 2,
    title: 'Stage 2 — Open up Leonida',
    text: 'From Chapter 2 onward you can free roam with both protagonists. Work through the activities, collectibles and robberies in any order: shooting ranges, drone races, races, fishing, golf, WAiNK scans, card sets, vehicles, bank vaults and gang operations. Try all 9 activity types once for Master of None.',
  },
  {
    n: 3,
    title: 'Stage 3 — Cleanup and 100%',
    text: 'After the final mission, the 100% Completion checklist appears under Progress > Stats. Finish the remaining counts — 250 stunts, 50 of 80 Challenges, 15 of 18 meditations — and tick off whatever the checklist still asks for. The platinum pops when the last of the other 54 does.',
  },
];

export function trophiesInStage(data, n) {
  return data.trophies.filter((t) => t.stage === n);
}
