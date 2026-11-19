// strings.js — every user-visible word in the game, twice:
// English and Indonesia (REBUILD STEP 18). The settings
// panel's language switch (main.js) sets world.lang and
// persists it (config.js's LANG_KEY); every renderer asks
// t(world, key) and gets the line in the chosen language.
// Proper names stay themselves in both languages:
// Emberward, the Wardens' names, Starfall Abyss, the
// ultimates' names. The Ember Stall's stock lists (shop.js's
// own data) are the one surface this table does not cover.

export const WAVE_TITLES_ID = ['Geliat Pertama', 'Bisikan dalam Gelap', 'Pasukan Senja', 'Badai Berkumpul', 'Ksatria Terbangun', 'Gelap yang Mendalam', 'Lembah Melolong', 'Menjelang Fajar', 'Malam Terpanjang', 'Naga Terakhir'];

export const STRINGS = {
  en: {
    score: 'S C O R E', best: 'B E S T', crystalLight: 'CRYSTAL LIGHT',
    phaseGathers: 'the dark gathers…', phaseQuiet: 'the field lies quiet',
    readyQ: 'READY · Q', bannerQuiet: 'The field lies quiet',
    paused: 'PAUSED', resume: 'RESUME', exitToLobby: 'EXIT TO LOBBY', pauseHint: 'P or ESC resumes · M mutes',
    resultsVictory: 'THE LIGHT ENDURES', resultsDefeat: 'THE LIGHT FADES',
    victorySub: 'The tenth wave is silent, and dawn returns.', endFallen: 'The Warden has fallen.',
    rank: 'R A N K',
    rowScore: 'Score', rowBest: 'Best', rowMap: 'Map', rowWaves: 'Waves cleared', rowFoes: 'Foes banished',
    rowAccuracy: 'Accuracy', rowCombo: 'Finest combo', rowTime: 'Time in the field', rowCoins: 'Ember Coins found',
    rowMats: 'Materials found', rowNone: '— none —',
    againBtn: 'R — ENTER AGAIN', lobbyBtn: 'ENTER — RETURN TO LOBBY',
    settings: 'SETTINGS', language: 'LANGUAGE', tutorialBtn: 'TUTORIAL', exitGame: 'EXIT GAME', back: 'BACK', versionWord: 'Version',
    settingsHint: 'ESC or ✕ closes · your language is remembered',
    tutorialTitle: 'HOW TO PLAY',
    tutorial: [
      'Walk: A / D or ◀ ▶ — on touch, the left stick.',
      'Use a station: E, or click / tap it.',
      'Monument of Wardens: swap your hero — Karlsefni (sword, close), Rosaline (fire bow, far), Tyne (star magic, mid).',
      'ENTER or the Portal: descend into the Starfall Abyss.',
      'Defend the Crystal: 10 waves of 25 monsters, and they come from the edges of the field.',
      'Your Warden attacks on her own when a foe is in range — your job is position.',
      'Ultimate: Q, or tap the round button at bottom-right, when its circle is full.',
      'Dash: SPACE — a blitz step that dodges strikes; you cannot be hit mid-dash. Cooldown 3 seconds.',
      'Items: keys 1–4 · Pause: P · Mute: M.',
      'Between waves, pick 1 of 3 blessings — the Magnet pulls dropped coins to you, so you need not chase them.',
    ],
    draftTitle: 'THE LIGHT GROWS', draftSub: 'Wave {wave} held — choose a blessing for the rest of the run', draftHint: 'Click a card or press 1 · 2 · 3', draftOwned: 'already yours ×{n}', draftPress: 'press {n}',
    selectTitle: 'CHOOSE YOUR WARDEN', roleKarl: 'Melee sword', roleRosa: 'Fire bow', roleTyne: 'Star magic', rangeLabel: 'Range', ultiLabel: 'Ultimate', activeMark: 'ACTIVE',
    upgDmgName: 'Ember Edge', upgDmgDesc: 'Damage +15% — every attack and ultimate hits harder.',
    upgAtkName: 'Swift Hands', upgAtkDesc: 'Attack speed +12% — slashes, arrows and casts come faster.',
    upgCritName: 'Keen Eye', upgCritDesc: 'Critical chance +8% — critical hits deal double damage.',
    upgMagName: 'Ember Magnet', upgMagDesc: 'Magnet +1 — dropped coins fly to you from farther away.',
    upgSpdName: 'Wind Stride', upgSpdDesc: 'Move speed +8% — cross the field faster.',
    upgHullName: 'Reinforced Hull', upgHullDesc: 'Max hull +15, and mend 15 hull right now.',
    upgNovaName: 'Nova Wellspring', upgNovaDesc: 'Nova charge +25% — your ultimate fills faster.',
    upgMendName: 'Mend', upgMendDesc: 'Restore 40 hull right now.',
    propMonument: 'MONUMENT OF WARDENS', propMonumentHint: 'Choose your Warden',
    propPortal: 'THE ABYSS PORTAL', propPortalHint: 'Enter the Abyss',
    propShop: 'EMBER STALL', propShopHint: 'Spend Ember Coins',
    // The dashboard's words (step 19 reuses the lobby's old lines).
    tagline: '~ Keep the Last Light ~', enterBtn: 'ENTER',
    flavour: (name) => `${name} stands watch over the Crystal — and in the Abyss, the Gloomslicks have begun to stir.`,
  },
  id: {
    score: 'S K O R', best: 'T E R B A I K', crystalLight: 'CAHAYA KRISTAL',
    phaseGathers: 'kegelapan berkumpul…', phaseQuiet: 'medan terasa sunyi',
    readyQ: 'SIAP · Q', bannerQuiet: 'Medan terasa sunyi',
    paused: 'JEDA', resume: 'LANJUTKAN', exitToLobby: 'KELUAR KE LOBI', pauseHint: 'P atau ESC lanjut · M bisu',
    resultsVictory: 'CAHAYA BERTAHAN', resultsDefeat: 'CAHAYA MEMUDAR',
    victorySub: 'Gelombang kesepuluh sunyi, dan fajar kembali.', endFallen: 'Sang Warden telah gugur.',
    rank: 'P E R I N G K A T',
    rowScore: 'Skor', rowBest: 'Terbaik', rowMap: 'Peta', rowWaves: 'Gelombang ditahan', rowFoes: 'Musuh dimusnahkan',
    rowAccuracy: 'Akurasi', rowCombo: 'Kombo terbaik', rowTime: 'Waktu di medan', rowCoins: 'Koin Ember ditemukan',
    rowMats: 'Material ditemukan', rowNone: '— tidak ada —',
    againBtn: 'R — MASUK LAGI', lobbyBtn: 'ENTER — KEMBALI KE LOBI',
    settings: 'PENGATURAN', language: 'BAHASA', tutorialBtn: 'TUTORIAL', exitGame: 'KELUAR DARI GAME', back: 'KEMBALI', versionWord: 'Versi',
    settingsHint: 'ESC atau ✕ menutup · bahasamu diingat',
    tutorialTitle: 'CARA BERMAIN',
    tutorial: [
      'Jalan: A / D atau ◀ ▶ — di layar sentuh, stik kiri.',
      'Pakai stasiun: E, atau klik / ketuk stasiunnya.',
      'Monumen Para Warden: ganti hero — Karlsefni (pedang, dekat), Rosaline (busur api, jauh), Tyne (sihir bintang, menengah).',
      'ENTER atau Portal: turun ke Starfall Abyss.',
      'Lindungi Kristal: 10 gelombang × 25 monster, dan mereka datang dari tepi medan.',
      'Warden-mu menyerang sendiri saat musuh dalam jangkauan — tugasmu mengatur posisi.',
      'Ulti: Q, atau ketuk tombol bulat di kanan bawah, saat lingkarannya penuh.',
      'Dash: SPASI — langkah blitz untuk menghindar; kamu tak bisa kena pukul saat dash. Cooldown 3 detik.',
      'Item: tombol 1–4 · Jeda: P · Bisu: M.',
      'Di antara gelombang, pilih 1 dari 3 berkah — Magnet menarik koin yang jatuh ke arahmu, jadi tak perlu mengejarnya.',
    ],
    draftTitle: 'CAHAYA BERTUMBUH', draftSub: 'Gelombang {wave} tertahan — pilih satu berkah untuk sisa perjalanan', draftHint: 'Klik kartu atau tekan 1 · 2 · 3', draftOwned: 'sudah milikmu ×{n}', draftPress: 'tekan {n}',
    selectTitle: 'PILIH WARDEN-MU', roleKarl: 'Pedang jarak dekat', roleRosa: 'Busur api', roleTyne: 'Sihir bintang', rangeLabel: 'Jangkauan', ultiLabel: 'Ulti', activeMark: 'DIPAKAI',
    upgDmgName: 'Bilah Bara', upgDmgDesc: 'Damage +15% — semua serangan dan ultimate lebih sakit.',
    upgAtkName: 'Tangan Cepat', upgAtkDesc: 'Kecepatan serang +12% — tebasan, panah, dan sihir lebih cepat.',
    upgCritName: 'Mata Tajam', upgCritDesc: 'Peluang kritikal +8% — pukulan kritikal memberi damage ganda.',
    upgMagName: 'Magnet Bara', upgMagDesc: 'Magnet +1 — koin yang jatuh terbang menghampirimu dari lebih jauh.',
    upgSpdName: 'Langkah Angin', upgSpdDesc: 'Kecepatan gerak +8% — melintasi arena lebih cepat.',
    upgHullName: 'Lambung Kuat', upgHullDesc: 'Lambung maks +15, dan pulihkan 15 lambung sekarang.',
    upgNovaName: 'Sumber Nova', upgNovaDesc: 'Isi Nova +25% — ultimate-mu terisi lebih cepat.',
    upgMendName: 'Pulihkan', upgMendDesc: 'Pulihkan 40 lambung sekarang juga.',
    propMonument: 'MONUMEN PARA WARDEN', propMonumentHint: 'Pilih Warden-mu',
    propPortal: 'PORTAL ABYSS', propPortalHint: 'Masuk ke Abyss',
    propShop: 'KEDAI EMBER', propShopHint: 'Belanjakan Koin Ember',
    tagline: '~ Jaga Cahaya Terakhir ~', enterBtn: 'MASUK',
    flavour: (name) => `${name} berjaga di sisi Kristal — dan di Abyss, para Gloomslick mulai bergerak.`,
  },
};

// The line for a key in the world's language (English is the
// default and the fallback for anything untranslated).
export function t(world, key) { const lang = world && world.lang === 'id' ? 'id' : 'en'; const v = STRINGS[lang][key]; return v !== undefined ? v : STRINGS.en[key]; }
export function langOf(world) { return world && world.lang === 'id' ? 'id' : 'en'; }
