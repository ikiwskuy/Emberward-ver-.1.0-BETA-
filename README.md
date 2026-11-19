# Emberward — Keep the Last Light

An original anime-fantasy side-view defence game that runs entirely in the
browser. You are a Warden guarding the Starfall Crystal on a wide, dark
stage — the Starfall Abyss, 3,200 px across with a river, a bridge, dead
trees and lanterns. The waves never end: 25 foes a wave, a new kind joining
the hunt as the ladder climbs, and a boss every fourth wave — Pyrrhax the
Ember Dragon, Kael the Dread Knight and Cerberus, Gatekeeper of the Abyss,
returning thicker each cycle. The run ends only when the Crystal falls or
the Warden dies; your rank keys off waves cleared (S ≥ 16, A ≥ 12, B ≥ 8,
C ≥ 5).

**Play it:** open `emberward.html` in any browser (single file, no install,
no internet needed — all art is inlined). The multi-file source lives in
`game/` — serve that folder with any static server (for example
`npx serve game`) and open `index.html`. On a phone, play in landscape:
a fixed joystick and round MOBA buttons appear (there is no attack button —
your Warden strikes on her own).

## The Wardens

Portraits and pixel sprites designed by the author; each Warden's in-game
sprite matches her portrait — hair, outfit and weapon. Every Warden starts
basic — plain attacks, small damage — and builds her power in the skill
draft after every wave, from a pool of 22 cards themed to her weapon.

- **Hei Karlsefni** (Frost) — a frost katana: close sector slashes that slow.
- **An Rosaline** (Flame) — the Flame Archer: flaming arrows from 560 px,
  and the piercing Phoenix Shot.
- **Tyne Vgernaut** (Lightning) — the Storm Catalyst: instant lightning
  strikes from a floating tome that chain foe to foe.

## How to play

- Walk the plaza: the **Monument** chooses your Warden, the **Ember Stall**
  sells supplies and permanent upgrades, the **Portal** enters the Abyss.
- **A/D or ◀ ▶** — move (side view: left and right only; your feet stay on
  the ground) · your Warden auto-attacks the nearest foe in range
- **E** — hero skill · **Q** — Starfall Nova when charged · **SPACE** — dash
- **1–4** — hotbar items · **P** — pause · **M** — mute
- After each wave, pick 1 of 3 draft cards: damage, speed, reach and
  signature effects stack into your build for the rest of the run.
- Ember Coins buy supplies; Starshards and Umbral Essence (from bosses)
  buy permanent upgrades between runs.

## The hunt

Gloomslick (water slime) · Rustfang Raider (goblin) · Gravemaw Husk
(zombie, wave III) · Skullcantor (necromancer, wave V) · Dreadwisp
(wave VI) · Riftstone Golem (wave VII — Rift Slam, and Rune Awakening at
low HP) · the Riftborn elite (wave IX).

## Tech

Vanilla JavaScript on a single HTML canvas — no engine, no network. The
world renders through a 480×270 pixel layer for crisp pixel art; portraits
and UI draw full-res. All sound and music is synthesized live with the
Web Audio API. Profile and best score are kept in `localStorage`.

## License

MIT — see `LICENSE`.

---

# Emberward — Jaga Cahaya Terakhir

Game defence fantasi-anime tampak samping (side view) original yang jalan
sepenuhnya di browser. Kamu adalah seorang Warden penjaga Starfall Crystal
di panggung gelap yang luas — Starfall Abyss, selebar 3.200 px dengan
sungai, jembatan, pohon mati, dan lentera. Gelombangnya tanpa akhir:
25 musuh per gelombang, jenis baru ikut berburu seiring naiknya tangga,
dan bos tiap empat gelombang — Pyrrhax si Naga Ember, Kael si Ksatria
Dread, dan Cerberus Penjaga Gerbang Abyss, kembali makin tebal tiap
siklus. Permainan hanya berakhir kalau Crystal hancur atau Warden gugur;
peringkatmu dihitung dari gelombang yang dituntaskan (S ≥ 16, A ≥ 12,
B ≥ 8, C ≥ 5).

**Cara main:** buka `emberward.html` di browser apa pun (satu file, tanpa
install, tanpa internet — semua gambar sudah menyatu di dalamnya). Source
multi-file ada di folder `game/` — jalankan folder itu dengan static
server apa saja (misalnya `npx serve game`) lalu buka `index.html`.
Di HP, mainkan dalam posisi landscape: muncul joystick tetap dan tombol
bulat ala MOBA (tidak ada tombol serang — Warden menyerang sendiri).

## Para Warden

Potret dan sprite pixel dirancang oleh pembuatnya sendiri; sprite tiap
Warden di dalam game disamakan dengan potretnya — rambut, pakaian, dan
senjata. Semua Warden mulai dari dasar — serangan polos, damage kecil —
dan membangun kekuatannya lewat draft skill setelah tiap gelombang,
dari kumpulan 22 kartu bertema senjatanya.

- **Hei Karlsefni** (Frost) — katana es: tebasan sektor jarak dekat yang memperlambat.
- **An Rosaline** (Flame) — Pemanah Api: panah berapi dari jarak 560 px, plus Phoenix Shot penembus.
- **Tyne Vgernaut** (Lightning) — Katalis Badai: sambaran petir seketika dari buku melayang yang berantai antar musuh.

## Kontrol

- Jalan di plaza: **Monument** untuk memilih Warden, **Ember Stall** untuk
  membeli persediaan dan upgrade permanen, **Portal** untuk masuk Abyss.
- **A/D atau ◀ ▶** — gerak (tampak samping: hanya kiri-kanan; kaki tetap di tanah)
- **E** — skill hero · **Q** — Starfall Nova kalau penuh · **SPACE** — dash
- **1–4** — item hotbar · **P** — pause · **M** — mute
- Setelah tiap gelombang, pilih 1 dari 3 kartu draft: damage, kecepatan,
  jangkauan, dan efek khas menumpuk jadi build-mu selama permainan.
- Ember Coin membeli persediaan; Starshard dan Umbral Essence (dari bos)
  membeli upgrade permanen antar permainan.

## Para Pemburu

Gloomslick (slime air) · Rustfang Raider (goblin) · Gravemaw Husk
(zombie, gelombang III) · Skullcantor (necromancer, gelombang V) ·
Dreadwisp (gelombang VI) · Riftstone Golem (gelombang VII — Rift Slam,
dan Rune Awakening saat HP rendah) · elite Riftborn (gelombang IX).

## Teknologi

JavaScript vanilla di satu canvas HTML — tanpa engine, tanpa jaringan.
Dunia digambar lewat layer pixel 480×270 agar pixel art-nya tajam;
potret dan UI digambar full-res. Semua suara dan musik disintesis
langsung dengan Web Audio API. Profil dan skor terbaik disimpan di
`localStorage`.

## Lisensi

MIT — lihat `LICENSE`.
