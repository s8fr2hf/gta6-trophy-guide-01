# Leonida Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/s8fr2hf/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/s8fr2hf/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the [make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01).

- **Every trophy, with a guide**: all 55 official names, descriptions and grades, each with a guide in our own words that names its source. Methods no published guide has confirmed are marked unconfirmed rather than guessed.
- **Tracker**: a checklist whose progress is saved in the browser (localStorage), with export and import. Filters by kind (story, missable, collectibles, activities) and grade, plus search.
- **Roadmap to the platinum**: three stages — story first, open world second, 100% cleanup last — built from the official descriptions.
- **Missables**: only Positive Mental Attitude is reported as possibly missable (the Chapter 1 meditation with Lucia at Jason's house). It is flagged everywhere it matters.
- **Spoiler setting**: hides the names and descriptions of the 28 hidden story trophies until they are earned.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Everything loads from its own files; it works with the network off.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's library. Run it twice: both runs must write the same bytes.

## Sources

Official trophy names, descriptions and grades as Exophase and PSNProfiles list them. Guide facts from PowerPyx, Push Square, KeenGamer, GTADB, gamemapa and WeHunt — each trophy names its source in `app/data/trophies.json`.
