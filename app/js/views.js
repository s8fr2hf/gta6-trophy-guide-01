// Views: the checklist, one trophy's guide, the roadmap, the missables page
// and the settings page. Every view renders from the same trophy list and
// the same earned set, so the checklist, the roadmap and the counts agree.
import { applyFilters, gradeCounts, isSpoilerHidden, kindOf, KINDS } from './filters.js';

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function renderProgress(trophies, earned) {
  const count = document.getElementById('earnedCount');
  const fill = document.getElementById('progressFill');
  const grades = document.getElementById('gradeCounts');
  count.textContent = String(earned.size);
  fill.style.width = Math.round((earned.size / trophies.length) * 100) + '%';
  const c = gradeCounts(trophies, earned);
  grades.textContent = `Platinum ${c.platinum[0]}/${c.platinum[1]} · Gold ${c.gold[0]}/${c.gold[1]} · Silver ${c.silver[0]}/${c.silver[1]} · Bronze ${c.bronze[0]}/${c.bronze[1]}`;
}

export function renderKindFilters(activeKind, onPick) {
  const box = document.getElementById('kindFilters');
  box.innerHTML = '';
  for (const [value, label] of KINDS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    if (value === activeKind) b.classList.add('active');
    b.addEventListener('click', () => onPick(value));
    box.appendChild(b);
  }
}

function trophyRow(t, earned, spoilerOn, onToggle, onOpen) {
  const hidden = isSpoilerHidden(t, earned, spoilerOn);
  const row = document.createElement('article');
  row.className = 'trophy' + (earned.has(t.id) ? ' earned' : '');
  const check = document.createElement('input');
  check.type = 'checkbox';
  check.checked = earned.has(t.id);
  check.setAttribute('aria-label', 'Earned: ' + t.name);
  check.addEventListener('change', () => onToggle(t.id, check.checked));
  const medal = document.createElement('span');
  medal.className = 'medal ' + t.grade;
  medal.textContent = t.grade;
  const body = document.createElement('div');
  const name = document.createElement('h3');
  name.textContent = hidden ? 'Hidden story trophy' : t.name;
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = hidden ? 'Spoiler-safe mode hides this story trophy until you earn it.' : t.description;
  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.innerHTML = esc(kindOf(t)) + (t.missable ? ' · <b>Missable — do it in Chapter 1</b>' : '') + ' · Roadmap stage ' + t.stage;
  body.append(name, desc, meta);
  const open = document.createElement('button');
  open.type = 'button';
  open.className = 'open';
  open.textContent = hidden ? 'Why hidden?' : 'Guide →';
  open.addEventListener('click', () => onOpen(t.id));
  row.append(check, medal, body, open);
  return row;
}

export function renderChecklist(view, trophies, earned, filters, settings, callbacks) {
  const list = applyFilters(trophies, earned, filters);
  view.innerHTML = '';
  const head = document.createElement('h2');
  head.textContent = 'Checklist — ' + list.length + ' of 55 trophies';
  const lede = document.createElement('p');
  lede.className = 'lede';
  lede.textContent = 'Tick a trophy when you earn it; progress is saved in this browser. Open a trophy for its guide and its sources.';
  view.append(head, lede);
  if (list.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No trophies match these filters.';
    view.appendChild(empty);
    return;
  }
  for (const t of list) {
    view.appendChild(trophyRow(t, earned, settings.spoiler, callbacks.onToggle, callbacks.onOpen));
  }
}

export function renderDetail(detailBox, trophy, earned, spoilerOn, onClose, onToggle) {
  detailBox.hidden = false;
  const hidden = isSpoilerHidden(trophy, earned, spoilerOn);
  detailBox.innerHTML = '';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'close';
  close.textContent = 'Close ×';
  close.addEventListener('click', onClose);
  const medal = document.createElement('span');
  medal.className = 'medal ' + trophy.grade;
  medal.textContent = trophy.grade;
  const name = document.createElement('h2');
  name.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  const desc = document.createElement('p');
  desc.textContent = hidden ? 'Spoiler-safe mode hides this story trophy until you earn it. Its guide stays hidden with it.' : trophy.description;
  detailBox.append(close, medal, name, desc);
  if (trophy.missable) {
    const warn = document.createElement('p');
    warn.className = 'warn';
    warn.textContent = 'Missable: meditate at Jason’s house in Chapter 1, the first chance you get. PowerPyx and GTABase both flag this as the only trophy that may be missable.';
    detailBox.appendChild(warn);
  }
  if (!hidden) {
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    const src = document.createElement('p');
    src.className = 'src';
    src.textContent = 'Sources: ' + trophy.sources;
    detailBox.append(guide, src);
  }
  const earnedLine = document.createElement('p');
  const label = document.createElement('label');
  label.className = 'check';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.id);
  box.addEventListener('change', () => onToggle(trophy.id, box.checked));
  label.append(box, document.createTextNode(' Earned'));
  earnedLine.appendChild(label);
  detailBox.appendChild(earnedLine);
}

const STAGES = [
  [1, 'Play the story', 'Chapters 1 to 4 and the final mission. Thirteen trophies, including the one missable: meditate at Jason’s house in Chapter 1.'],
  [2, 'Side strands', 'Andy, Kenton, Billy, Randy and Tyrone, Bret’s hunt, and eight stranger strands across Leonida.'],
  [3, 'Activities', 'Stunts, the shooting range, races, fishing, arcade, bowling and 50 challenges.'],
  [4, 'Collectibles & combat', 'Cards, WAiNK spots, vehicles, heists, exploration and the partner robberies.'],
  [5, 'Money & odd jobs', 'Laundering, spending, garages, registrations, the beach cocktail and the hidden trophies.'],
  [6, '100% & platinum', 'Finish the completion checklist for A Long Road; Vice Got a Price! follows.'],
];

export function renderRoadmap(view, trophies, earned) {
  view.innerHTML = '';
  const head = document.createElement('h2');
  head.textContent = 'Roadmap to the platinum';
  const lede = document.createElement('p');
  lede.className = 'lede';
  lede.textContent = 'Built from the official descriptions: story first, side strands second, then activities, collectibles and money, with 100% completion last. PowerPyx estimates about 200 hours to the platinum, difficulty 4 out of 10, in one playthrough.';
  view.append(head, lede);
  for (const [stage, title, blurb] of STAGES) {
    const members = trophies.filter((t) => t.stage === stage);
    const got = members.filter((t) => earned.has(t.id)).length;
    const section = document.createElement('section');
    section.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = `Stage ${stage}: ${title} — ${got}/${members.length}`;
    const p = document.createElement('p');
    p.textContent = blurb;
    const ul = document.createElement('ul');
    for (const t of members) {
      const li = document.createElement('li');
      li.textContent = (earned.has(t.id) ? '✓ ' : '○ ') + t.name + ' (' + t.grade + ')' + (t.missable ? ' — missable' : '');
      ul.appendChild(li);
    }
    section.append(h, p, ul);
    view.appendChild(section);
  }
}

export function renderMissables(view, trophies, earned) {
  view.innerHTML = '';
  const head = document.createElement('h2');
  head.textContent = 'Missable trophies';
  const lede = document.createElement('p');
  lede.className = 'lede';
  lede.textContent = 'Built from the official descriptions and the guides that flag them: only one trophy in the whole list is reported as possibly missable. Everything else can be earned after the story, in any order.';
  view.append(head, lede);
  const missable = trophies.filter((t) => t.missable);
  for (const t of missable) {
    const warn = document.createElement('div');
    warn.className = 'warn';
    warn.innerHTML = '<strong>' + esc(t.name) + '</strong> (' + esc(t.grade) + ') — ' + esc(t.guide);
    view.appendChild(warn);
  }
  const note = document.createElement('p');
  note.className = 'lede';
  note.textContent = 'Sources: PowerPyx and GTABase both flag Positive Mental Attitude as the only possibly missable trophy; KeenGamer counts 18 meditation spots. All 54 other trophies are earned in the open world or by replaying missions and activities after the story.';
  view.appendChild(note);
  void earned;
}

export function renderSettings(view, trophies, earned, callbacks) {
  view.innerHTML = '';
  const head = document.createElement('h2');
  head.textContent = 'Settings & export';
  view.appendChild(head);
  const wrap = document.createElement('div');
  wrap.className = 'settings';
  const save = document.createElement('section');
  save.className = 'card';
  save.innerHTML = '<h3>Your progress</h3><p>' + earned.size + ' of ' + trophies.length + ' trophies earned. Progress lives in this browser’s localStorage and is never sent anywhere.</p>';
  const exportBtn = document.createElement('button');
  exportBtn.type = 'button';
  exportBtn.className = 'btn';
  exportBtn.textContent = 'Export progress (.json)';
  exportBtn.addEventListener('click', callbacks.onExport);
  const importLabel = document.createElement('label');
  importLabel.className = 'btn ghost';
  importLabel.textContent = 'Import progress…';
  importLabel.style.marginLeft = '8px';
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json,.json';
  fileInput.hidden = true;
  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) callbacks.onImport(fileInput.files[0]);
  });
  importLabel.appendChild(fileInput);
  importLabel.addEventListener('click', (e) => { e.preventDefault(); fileInput.click(); });
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'btn ghost';
  resetBtn.textContent = 'Reset progress';
  resetBtn.style.marginLeft = '8px';
  resetBtn.addEventListener('click', callbacks.onReset);
  save.append(exportBtn, importLabel, resetBtn);
  const about = document.createElement('section');
  about.className = 'card';
  about.innerHTML = '<h3>About this guide</h3><p>Leonida Trophy Guide covers all 55 PlayStation 5 trophies of Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver, 46 bronze. Official names, descriptions and grades come from the Exophase trophy list, checked against PSNProfiles. Every guide is written for this entry in its own words and names its sources. The guide is static files only and works with the network off.</p>';
  wrap.append(save, about);
  view.appendChild(wrap);
}
