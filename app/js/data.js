// Data layer: loads the trophy list and holds the guide's shared constants.
export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export const KIND_LABELS = {
  story: 'Story',
  mission: 'Mission',
  activity: 'Activity',
  collectible: 'Collectible',
  combat: 'Combat',
  misc: 'Misc',
  milestone: 'Milestone',
  platinum: 'Platinum',
};

export const STAGE_TITLES = {
  1: 'Story first',
  2: 'People and strands',
  3: 'Activities',
  4: 'Collectibles',
  5: 'Combat and robberies',
  6: 'Cleanup and 100%',
};

export async function loadGuide() {
  const res = await fetch('data/trophies.json');
  if (!res.ok) throw new Error('Could not load data/trophies.json');
  return res.json();
}

export function countsByGrade(trophies) {
  const out = {};
  for (const grade of GRADE_ORDER) out[grade] = trophies.filter((t) => t.grade === grade).length;
  return out;
}
