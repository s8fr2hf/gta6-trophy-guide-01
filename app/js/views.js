// Views: everything the reader sees, rendered from the data and the store.
import { GRADE_ORDER, GRADE_LABELS, KIND_LABELS, STAGE_TITLES, countsByGrade } from './data.js';
import { isMasked } from './filters.js';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

export function renderProgress(trophies, earned) {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('earnedCount').textContent = done;
  document.getElementById('progressFill').style.width = `${pct}%`;
  const platinumDone = trophies.some((t) => t.grade === 'platinum' && earned.has(t.id));
  document.getElementById('progressLine').textContent =
    `${done} earned · ${pct}% · platinum ${platinumDone ? '1' : '0'} of 1`;
  const counts = countsByGrade(trophies);
  const box = document.getElementById('gradeCounts');
  box.textContent = '';
  for (const grade of GRADE_ORDER) {
    const got = trophies.filter((t) => t.grade === grade && earned.has(t.id)).length;
    const span = el('span');
    span.append(document.createTextNode(`${GRADE_LABELS[grade]} `));
    span.append(el('b', null, `${got}/${counts[grade]}`));
    box.append(span);
  }
}

export function renderList(trophies, state, earned, selectedId, onSelect, onToggle) {
  const list = document.getElementById('trophyList');
  list.textContent = '';
  document.getElementById('resultLine').textContent =
    trophies.length === 0
      ? 'No trophies match those filters.'
      : `Showing ${trophies.length} of 55 trophies.`;
  for (const t of trophies) {
    const row = el('li');
    const btn = el('button', `trophy-row${earned.has(t.id) ? ' earned' : ''}${selectedId === t.id ? ' selected' : ''}`);
    btn.type = 'button';
    btn.addEventListener('click', (event) => {
      if (event.target.classList.contains('tick')) return;
      onSelect(t.id);
    });

    const tick = el('button', 'tick', '✓');
    tick.type = 'button';
    tick.setAttribute('aria-label', earned.has(t.id) ? `Mark ${t.name} as not earned` : `Mark ${t.name} as earned`);
    tick.addEventListener('click', (event) => {
      event.stopPropagation();
      onToggle(t.id);
    });
    btn.append(tick);

    btn.append(el('span', `medal ${t.grade}`));
    const main = el('span', 'trophy-main');
    const masked = isMasked(t, state, earned);
    main.append(el('span', 'trophy-name', masked ? 'Hidden trophy — earn it to reveal' : t.name));
    main.append(el('span', 'trophy-desc', masked ? 'Story trophy, hidden by the spoiler setting.' : t.description));
    const tags = el('span', 'trophy-tags');
    tags.append(el('span', `tag grade-${t.grade}`, GRADE_LABELS[t.grade]));
    if (t.kind !== 'platinum') tags.append(el('span', 'tag', KIND_LABELS[t.kind] || t.kind));
    if (t.psn !== null && t.psn !== undefined) tags.append(el('span', 'tag', `PSN ×${t.psn}`));
    if (t.missable) tags.append(el('span', 'tag missable', 'Missable'));
    if (masked) tags.append(el('span', 'tag spoiler-hidden', 'spoiler hidden'));
    main.append(tags);
    btn.append(main);
    row.append(btn);
    list.append(row);
  }
}

export function renderDetail(trophy, state, earned, onToggle) {
  const pane = document.getElementById('detailPane');
  pane.textContent = '';
  if (!trophy) {
    pane.append(el('p', 'detail-empty', 'Pick a trophy to see its guide, steps and sources.'));
    return;
  }
  const masked = isMasked(trophy, state, earned);
  pane.append(el('h3', null, masked ? 'Hidden trophy' : trophy.name));
  pane.append(el('p', 'trophy-desc', masked ? 'This is a story trophy. Turn off “Hide story spoilers” or earn it to see its name and guide.' : trophy.description));
  const tags = el('p', 'trophy-tags');
  tags.append(el('span', `tag grade-${trophy.grade}`, GRADE_LABELS[trophy.grade]));
  tags.append(el('span', 'tag', KIND_LABELS[trophy.kind] || trophy.kind));
  tags.append(el('span', 'tag', `Roadmap stage ${trophy.stage}: ${STAGE_TITLES[trophy.stage]}`));
  pane.append(tags);
  if (!masked) {
    if (trophy.missable) {
      const callout = el('div', 'missable-callout', '⚠ Missable — the only one in the game. Meditate at Jason’s house in Chapter 1 before the story moves on.');
      pane.append(callout);
    }
    pane.append(el('h4', null, 'Guide'));
    pane.append(el('p', null, trophy.guide));
    if (trophy.steps && trophy.steps.length) {
      pane.append(el('h4', null, 'Steps'));
      const steps = el('ol', 'steps');
      for (const step of trophy.steps) steps.append(el('li', null, step));
      pane.append(steps);
    }
    if (trophy.sources && trophy.sources.length) {
      pane.append(el('h4', null, 'Sources'));
      const srcs = el('ul', 'sources');
      for (const s of trophy.sources) srcs.append(el('li', null, s));
      pane.append(srcs);
    }
  }
  const earn = el('button', `earn-btn${earned.has(trophy.id) ? ' earned' : ''}`,
    earned.has(trophy.id) ? '✓ Earned — click to undo' : 'Mark as earned');
  earn.type = 'button';
  earn.addEventListener('click', () => onToggle(trophy.id));
  pane.append(earn);
}

export function renderRoadmap(guide, earned) {
  const list = document.getElementById('roadmapList');
  list.textContent = '';
  for (const stage of guide.roadmap) {
    const members = guide.trophies.filter((t) => t.stage === stage.stage);
    const done = members.filter((t) => earned.has(t.id)).length;
    const item = el('li');
    item.append(el('span', 'stage-no', `Stage ${stage.stage}`));
    item.append(el('h3', null, stage.title));
    item.append(el('p', 'stage-count', `${done} of ${members.length} trophies earned in this stage`));
    item.append(el('p', null, stage.text));
    item.append(el('p', 'stage-trophies', members.map((t) => t.name).join(' · ')));
    list.append(item);
  }
}

export function renderMissables(guide, onSelect) {
  const box = document.getElementById('missableList');
  box.textContent = '';
  const missable = guide.trophies.filter((t) => t.missable);
  for (const t of missable) {
    const card = el('div', 'missable-card');
    card.append(el('h3', null, `${t.name} — the one missable trophy`));
    card.append(el('p', null, t.guide));
    const steps = el('ol', 'steps');
    for (const step of t.steps) steps.append(el('li', null, step));
    card.append(steps);
    const open = el('button', 'earn-btn', 'Open in the tracker');
    open.type = 'button';
    open.addEventListener('click', () => onSelect(t.id));
    card.append(open);
    box.append(card);
  }
  const safe = el('div', 'safe-note');
  safe.append(el('h3', null, 'Everything else is safe'));
  safe.append(el('p', null, 'All 54 other trophies stay available in free roam after the story ends. PowerPyx reports exactly one possibly missable trophy, and this guide flags only that one — so play the story at your own pace and mop the rest up afterwards.'));
  box.append(safe);
}

export function renderSources(guide) {
  const list = document.getElementById('sourceList');
  list.textContent = '';
  for (const s of guide.sources_page) {
    const item = el('li');
    if (s.url) {
      const link = el('a', null, s.name);
      link.href = s.url;
      link.rel = 'noopener';
      const h = el('h3');
      h.append(link);
      item.append(h);
    } else {
      item.append(el('h3', null, s.name));
    }
    item.append(el('p', null, s.what));
    list.append(item);
  }
}
