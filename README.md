# Leonida Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/s8fr2hf/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/s8fr2hf/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the [make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01): 1 platinum, 2 gold, 6 silver, 46 bronze.

- **Checklist** with the official name, description and grade of every trophy, saved in the browser (localStorage), with export to a file and import back.
- **Filters** by kind (story, missable, side strands, activities, collectibles, combat & heists, exploration, money, odd jobs), a search box, and a hide-earned switch.
- **Spoiler-safe mode** hides the names and descriptions of story trophies you have not earned yet.
- **Roadmap to the platinum** in six stages, built from the official descriptions, and a **missables page**: only Positive Mental Attitude is reported as possibly missable (meditate at Jason's house in Chapter 1).
- **A cited guide for every trophy**, in our own words. Official facts come from the Exophase trophy list, checked against PSNProfiles; extra facts (meditation spots, shooting-range challenges, drone-race locations, garage count, platinum time) are credited to PowerPyx, GTABase, KeenGamer and FullSweep beside each guide. Where a method is not yet confirmed in the released game, the guide says so.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. The app is static files under `app/` and works with the network off.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.
