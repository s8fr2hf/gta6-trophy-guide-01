// Filters: search, kind, grade, earned state, missable-only, and the spoiler rule.
export function applyFilters(trophies, state, earned) {
  const query = state.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.kind && t.kind !== state.kind) return false;
    if (state.grade && t.grade !== state.grade) return false;
    if (state.earned === 'earned' && !earned.has(t.id)) return false;
    if (state.earned === 'unearned' && earned.has(t.id)) return false;
    if (state.missableOnly && !t.missable) return false;
    if (query) {
      const hay = `${t.name} ${t.description} ${t.guide} ${t.kind}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}

// A story trophy is masked while spoilers are hidden and it is not earned yet.
export function isMasked(trophy, state, earned) {
  return state.hideSpoilers && trophy.spoiler && !earned.has(trophy.id);
}
