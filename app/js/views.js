// Renders each view of the guide into plain HTML strings.
import { STAGES, trophiesInStage } from './data.js';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function displayName(t, spoilers, earned) {
  if (t.hidden && spoilers && !earned.has(t.id)) {
    return '<span class="hidden-name">Hidden story trophy</span>';
  }
  return `<span class="tname">${esc(t.name)}</span>`;
}

function displayDesc(t, spoilers, earned) {
  if (t.hidden && spoilers && !earned.has(t.id)) {
    return '<span class="hidden-name">Earn it to reveal its description.</span>';
  }
  return `<span class="tdesc">${esc(t.description)}</span>`;
}

export function renderChecklist(data, earned, spoilers, filter) {
  const q = (filter.q || '').toLowerCase();
  const rows = data.trophies.filter((t) => {
    if (filter.kind !== 'all' && t.kind !== filter.kind) return false;
    if (filter.grade !== 'all' && t.grade !== filter.grade) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
  if (rows.length === 0) {
    return '<p>No trophies match those filters. Clear the search or widen the kind and grade.</p>';
  }
  const body = rows
    .map((t) => {
      const done = earned.has(t.id);
      return `<tr class="${done ? 'earned' : ''}">
        <td><input type="checkbox" data-earn="${t.id}" ${done ? 'checked' : ''} aria-label="Earned: ${esc(t.name)}"></td>
        <td>${displayName(t, spoilers, earned)}<br>${displayDesc(t, spoilers, earned)}</td>
        <td><span class="grade ${t.grade}">${t.grade}</span>${t.missable ? ' <span class="missable-flag">Missable</span>' : ''}</td>
        <td><a href="#/trophy/${t.id}">Guide</a></td>
      </tr>`;
    })
    .join('');
  return `<table class="checklist">
    <thead><tr><th>Earned</th><th>Trophy</th><th>Grade</th><th></th></tr></thead>
    <tbody>${body}</tbody>
  </table>
  <p>${rows.length} of 55 trophies shown.</p>`;
}

export function renderDetail(data, earned, spoilers, id) {
  const t = data.trophies.find((x) => x.id === id);
  if (!t) return '<p>That trophy is not in the list. Pick one from the checklist.</p>';
  const done = earned.has(t.id);
  const hiddenNow = t.hidden && spoilers && !done;
  const name = hiddenNow ? 'Hidden story trophy' : esc(t.name);
  const desc = hiddenNow ? 'Earn it to reveal its description.' : esc(t.description);
  const guide = hiddenNow
    ? 'This is a hidden story trophy. Turn the spoiler setting off in Settings to read its guide, or earn it first.'
    : esc(t.guide);
  return `<h2>${name}</h2>
    <p><span class="grade ${t.grade}">${t.grade}</span> ${t.missable ? '<span class="missable-flag">Missable — read this first</span>' : ''} ${done ? '<span class="badge">Earned</span>' : ''}</p>
    <p><em>${desc}</em></p>
    ${t.missable ? '<div class="warn"><strong>Do not miss this.</strong> The Chapter 1 meditation with Lucia at Jason\u2019s house disappears after Chapter 1, and it is not yet confirmed whether the trophy needs it. Do it while you can and keep a save from inside Chapter 1.</div>' : ''}
    <h3>Guide</h3>
    <p>${guide}</p>
    <p class="source">Source: ${esc(t.source)}. The official name and description are as PlayStation publishes them; the guide above is written for this entry.</p>
    <p><label><input type="checkbox" data-earn="${t.id}" ${done ? 'checked' : ''}> I earned this trophy</label></p>
    <p><a href="#/">Back to the checklist</a></p>`;
}

export function renderRoadmap(data, earned) {
  const sections = STAGES.map((s) => {
    const list = trophiesInStage(data, s.n);
    const done = list.filter((t) => earned.has(t.id)).length;
    const items = list
      .map((t) => `<li>${esc(t.name)} <span class="grade ${t.grade}">${t.grade}</span>${t.missable ? ' <span class="missable-flag">Missable</span>' : ''}</li>`)
      .join('');
    return `<section class="roadmap-stage"><h3>${esc(s.title)} — ${done} of ${list.length} earned</h3>
      <p>${esc(s.text)}</p><ol>${items}</ol></section>`;
  }).join('');
  return `<h2>Roadmap to the platinum</h2>
    <p>PowerPyx rates the platinum 4 out of 10 and about 200 hours, in a single playthrough. The order below is the order the game itself suggests: story first, open world second, cleanup last.</p>
    ${sections}`;
}

export function renderMissables(data, earned) {
  const miss = data.trophies.filter((t) => t.missable);
  const items = miss
    .map((t) => `<li><strong>${esc(t.name)}</strong> — ${esc(t.guide)} <span class="source">Source: ${esc(t.source)}.</span></li>`)
    .join('');
  return `<h2>Missable trophies</h2>
    <p>Only one trophy is reported as possibly missable. Every other trophy can be earned after the story, so there is no need to rush the rest — but this one deserves a save.</p>
    <ul>${items}</ul>
    <p>Because there is no mission replay, keep a manual save at the start and the end of every chapter. Cheats disable trophies and saving, so keep them off the save you use for the platinum.</p>`;
}

export function renderSettings(data, earned, spoilers) {
  const c = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of data.trophies) if (earned.has(t.id)) c[t.grade]++;
  return `<h2>Settings</h2>
    <p><label><input type="checkbox" id="spoilers-setting" ${spoilers ? 'checked' : ''}> Hide story trophies until earned</label></p>
    <p>When this is on, the names and descriptions of the 28 hidden story trophies show as “Hidden story trophy” until you tick them earned. Their guides stay hidden too. Turn it off to read everything.</p>
    <h3>Your progress</h3>
    <p>${earned.size} of 55 earned — ${c.platinum} platinum, ${c.gold} gold, ${c.silver} silver, ${c.bronze} bronze.</p>
    <p>Progress lives in this browser's localStorage and is exported and imported with the buttons above. Nothing is sent anywhere.</p>
    <h3>About this guide</h3>
    <p>Built for the make.fun GTA 6 trophy guide bounty. Official names, descriptions and grades as Exophase and PSNProfiles list them; every guide is written for this entry and names its source. Methods no published guide has confirmed are marked unconfirmed rather than guessed.</p>`;
}
