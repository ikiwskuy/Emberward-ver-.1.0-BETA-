// shop.js — the Ember Stall and the persistent profile.

import { PROFILE_KEY } from './config.js'; import { ESSENCES } from './domains.js';

// Consumables live on the hotbar: keys 1–4 during a run.
export const ITEMS = [ { id: 'tonic', name: 'Ember Tonic', key: '1', price: 40, color: '#ff9d5c', desc: 'Restore 30 Warden HP' }, { id: 'greater', name: 'Greater Tonic', key: '2', price: 90, color: '#ff7d9c', desc: 'Restore 80 Warden HP' },
  { id: 'salve', name: 'Crystal Salve', key: '3', price: 70, color: '#5ff2d0', desc: 'Restore 25% Crystal Light' }, { id: 'draught', name: 'Nova Draught', key: '4', price: 60, color: '#fff3c4', desc: 'Fill the Nova charge at once' }, ];

export const UPGRADES = [ { id: 'vitality', name: 'Vitality', essence: 'umbral', max: 5, desc: '+10 Warden max HP per level' }, { id: 'power', name: 'Power', essence: 'umbral', max: 5, desc: '+5% spell damage per level' },
  { id: 'swiftness', name: 'Swiftness', essence: 'umbral', max: 3, desc: '+4% move speed per level' }, { id: 'nova', name: 'Nova Affinity', essence: 'umbral', max: 3, desc: '+8% Nova charge rate per level' }, { id: 'greed', name: 'Greed', essence: 'umbral', max: 3, desc: '+10% coin drop chance per level' }, ];

// Cost of the NEXT level (1-based): Starshards always, Essence from Lv3.
export function upgradeCost(track,level) { const table=[null,{ shard:3,ess:0 },{ shard:6,ess:0 },{ shard:10,ess:1 },{ shard:14,ess:2 },{ shard:20,ess:3 }]; return level > track.max ? null:table[level]; }

export function freshProfile() { return { embers:0,inv:{ tonic:0,greater:0,salve:0,draught:0 },materials:{ starshard:0,umbral:0 },upgrades:{ vitality:0,power:0,swiftness:0,nova:0,greed:0 },domainBest:[0],}; }

export function loadProfile() { const p=freshProfile(); try { const raw=localStorage.getItem(PROFILE_KEY); if (raw) { const saved=JSON.parse(raw); Object.assign(p.inv,saved.inv ?? {});
      if (saved.materials) { for (const k of Object.keys(p.materials)) { if (k in saved.materials) p.materials[k]=saved.materials[k]; }
        // Migration: any stored Seraph Essence becomes Umbral, 1:1.
        if (saved.materials.seraph) p.materials.umbral += Number(saved.materials.seraph) || 0;
      }
      Object.assign(p.upgrades,saved.upgrades ?? {}); if (Array.isArray(saved.domainBest)) {
        // One map now: an old multi-domain save keeps its Abyss best
        // (index 1 in the five-domain order, index 0 in the two-domain one).
        p.domainBest=[saved.domainBest.length > 2 ? (saved.domainBest[1] ?? 0) : (saved.domainBest[0] ?? 0)]; }
      p.embers=Number(saved.embers ?? 0)||0; }
  } catch { /* fresh profile */ }
  return p; }

export function saveProfile(world) { if (world.shotMode) return; try { localStorage.setItem(PROFILE_KEY,JSON.stringify(world.profile));
  } catch { /* storage may refuse */ }
}

export function buyItem(world,id) { const item=ITEMS.find((i)=>i.id===id); const p=world.profile; if (!item||p.embers < item.price||p.inv[id]>=9) return false; p.embers -=item.price; p.inv[id]++; saveProfile(world); return true; }

export function buyUpgrade(world,id) { const track=UPGRADES.find((u)=>u.id===id); const p=world.profile; if (!track) return false; const level=p.upgrades[id]; const cost=upgradeCost(track,level + 1); if (!cost) return false;
  if (p.materials.starshard < cost.shard||p.materials[track.essence] < cost.ess) return false; p.materials.starshard -=cost.shard; p.materials[track.essence] -=cost.ess; p.upgrades[id]++; saveProfile(world); return true; }

// Drink/use a consumable mid-run; false when it cannot help.
export function useItem(world,id) { const p = world.player; const inv = world.profile.inv; if (!p) return false; if (!inv[id]) return false; if (id === 'tonic' || id === 'greater') { if (p.hull >= p.maxHull) return false; p.hull = Math.min(p.maxHull, p.hull + (id === 'tonic' ? 30 : 80)); } else if (id === 'salve') {
    const c=world.crystal; if (c.light>=c.maxLight) return false; c.light=Math.min(c.maxLight,c.light + c.maxLight*0.25); } else if (id === 'draught') { if (p.novaCharge>=100) return false; p.novaCharge=100; }
  inv[id]--; saveProfile(world); const item=ITEMS.find((i)=>i.id===id); world.particles.sparkles(p.x,p.y - 10,item.color,14); world.particles.floatText(p.x,p.y - 34,item.name,item.color,15); return true; }

export { ESSENCES };
