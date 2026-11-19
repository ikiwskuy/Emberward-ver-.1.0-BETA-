// domains.js — the one map: Starfall Abyss.
// CHARACTER WIPE (2026-11-19): the domain's retinue went with the
// cast — its debut ladder, foe mix, boss names/colours, burst counts,
// signature kind and add tables were all read by the spawn and boss
// code that no longer exists. What remains is the map's identity,
// which the shell still uses (the results screen names the map, the
// shop prices upgrades in its Essence).

export const ESSENCES={ umbral: { name: 'Umbral Essence', color: '#b78cff' }, };

export const DOMAINS = [ { id: 'abyss', name: 'Starfall Abyss', sub: 'GELAP · the darkest night', theme: 'abyss', essence: 'umbral', accent: '#b78cff', line: 'The original grove, gone quiet' }, ];

export const domainAt=(world)=>DOMAINS[world.domainIndex] ?? DOMAINS[0];
