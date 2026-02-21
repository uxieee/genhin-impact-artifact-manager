// Element colors matching Genshin Impact
export const ELEMENT_COLORS = {
  Pyro: '#EF7938',
  Hydro: '#4CC2F1',
  Electro: '#B07FD8',
  Anemo: '#74C2A8',
  Dendro: '#A5C83B',
  Cryo: '#9FD6E3',
  Geo: '#F2B723',
};

export const ARTIFACT_SLOTS = ['flower', 'plume', 'sands', 'goblet', 'circlet'];

export const ARTIFACT_SLOT_NAMES = {
  flower: 'Flower of Life',
  plume: 'Plume of Death',
  sands: 'Sands of Eon',
  goblet: 'Goblet of Eonothem',
  circlet: 'Circlet of Logos',
};

export const STAT_LABELS = {
  hp: 'HP',
  hp_: 'HP%',
  atk: 'ATK',
  atk_: 'ATK%',
  def: 'DEF',
  def_: 'DEF%',
  critRate_: 'CRIT Rate',
  critDMG_: 'CRIT DMG',
  enerRech_: 'Energy Recharge',
  eleMas: 'Elemental Mastery',
  heal_: 'Healing Bonus',
  pyro_dmg_: 'Pyro DMG Bonus',
  hydro_dmg_: 'Hydro DMG Bonus',
  electro_dmg_: 'Electro DMG Bonus',
  anemo_dmg_: 'Anemo DMG Bonus',
  dendro_dmg_: 'Dendro DMG Bonus',
  cryo_dmg_: 'Cryo DMG Bonus',
  geo_dmg_: 'Geo DMG Bonus',
  physical_dmg_: 'Physical DMG Bonus',
};

// Enka prop map IDs to our stat keys
export const ENKA_STAT_MAP = {
  'FIGHT_PROP_HP': 'hp',
  'FIGHT_PROP_HP_PERCENT': 'hp_',
  'FIGHT_PROP_ATTACK': 'atk',
  'FIGHT_PROP_ATTACK_PERCENT': 'atk_',
  'FIGHT_PROP_DEFENSE': 'def',
  'FIGHT_PROP_DEFENSE_PERCENT': 'def_',
  'FIGHT_PROP_CRITICAL': 'critRate_',
  'FIGHT_PROP_CRITICAL_HURT': 'critDMG_',
  'FIGHT_PROP_CHARGE_EFFICIENCY': 'enerRech_',
  'FIGHT_PROP_ELEMENT_MASTERY': 'eleMas',
  'FIGHT_PROP_HEAL_ADD': 'heal_',
  'FIGHT_PROP_FIRE_ADD_HURT': 'pyro_dmg_',
  'FIGHT_PROP_WATER_ADD_HURT': 'hydro_dmg_',
  'FIGHT_PROP_ELEC_ADD_HURT': 'electro_dmg_',
  'FIGHT_PROP_WIND_ADD_HURT': 'anemo_dmg_',
  'FIGHT_PROP_GRASS_ADD_HURT': 'dendro_dmg_',
  'FIGHT_PROP_ICE_ADD_HURT': 'cryo_dmg_',
  'FIGHT_PROP_ROCK_ADD_HURT': 'geo_dmg_',
  'FIGHT_PROP_PHYSICAL_ADD_HURT': 'physical_dmg_',
};

// Enka flat prop type IDs (numeric) to our stat keys
export const ENKA_FLAT_PROP_MAP = {
  'FIGHT_PROP_BASE_HP': 'hp',
  'FIGHT_PROP_HP': 'hp',
  'FIGHT_PROP_HP_PERCENT': 'hp_',
  'FIGHT_PROP_BASE_ATTACK': 'atk',
  'FIGHT_PROP_ATTACK': 'atk',
  'FIGHT_PROP_ATTACK_PERCENT': 'atk_',
  'FIGHT_PROP_BASE_DEFENSE': 'def',
  'FIGHT_PROP_DEFENSE': 'def',
  'FIGHT_PROP_DEFENSE_PERCENT': 'def_',
  'FIGHT_PROP_CRITICAL': 'critRate_',
  'FIGHT_PROP_CRITICAL_HURT': 'critDMG_',
  'FIGHT_PROP_CHARGE_EFFICIENCY': 'enerRech_',
  'FIGHT_PROP_ELEMENT_MASTERY': 'eleMas',
  'FIGHT_PROP_HEAL_ADD': 'heal_',
  'FIGHT_PROP_FIRE_ADD_HURT': 'pyro_dmg_',
  'FIGHT_PROP_WATER_ADD_HURT': 'hydro_dmg_',
  'FIGHT_PROP_ELEC_ADD_HURT': 'electro_dmg_',
  'FIGHT_PROP_WIND_ADD_HURT': 'anemo_dmg_',
  'FIGHT_PROP_GRASS_ADD_HURT': 'dendro_dmg_',
  'FIGHT_PROP_ICE_ADD_HURT': 'cryo_dmg_',
  'FIGHT_PROP_ROCK_ADD_HURT': 'geo_dmg_',
  'FIGHT_PROP_PHYSICAL_ADD_HURT': 'physical_dmg_',
};

// Max substat roll values for 5-star artifacts
export const MAX_SUBSTAT_ROLLS = {
  hp: 298.75,
  hp_: 5.83,
  atk: 19.45,
  atk_: 5.83,
  def: 23.15,
  def_: 7.29,
  critRate_: 3.89,
  critDMG_: 7.77,
  enerRech_: 6.48,
  eleMas: 23.31,
};

// Rarity star colors
export const RARITY_COLORS = {
  5: '#FFB13F',
  4: '#D28FFF',
  3: '#6CB4FF',
  2: '#78E97B',
  1: '#B0B0B0',
};

// Score tier thresholds (out of 100)
export const SCORE_TIERS = {
  S: { min: 80, color: '#FFD700', label: 'S', desc: 'God Roll' },
  A: { min: 65, color: '#FF8C00', label: 'A', desc: 'Excellent' },
  B: { min: 50, color: '#4CC2F1', label: 'B', desc: 'Good' },
  C: { min: 35, color: '#74C2A8', label: 'C', desc: 'Average' },
  D: { min: 20, color: '#B07FD8', label: 'D', desc: 'Below Average' },
  F: { min: 0, color: '#EF4444', label: 'F', desc: 'Fodder' },
};

export function getScoreTier(score) {
  for (const tier of Object.values(SCORE_TIERS)) {
    if (score >= tier.min) return tier;
  }
  return SCORE_TIERS.F;
}

// Enka avatar ID to character key mapping
export const AVATAR_ID_MAP = {
  10000002: 'ayaka',
  10000003: 'jean',
  10000005: 'traveler-anemo',
  10000006: 'lisa',
  10000007: 'traveler-anemo',
  10000014: 'barbara',
  10000015: 'kaeya',
  10000016: 'diluc',
  10000020: 'razor',
  10000021: 'amber',
  10000022: 'venti',
  10000023: 'xiangling',
  10000024: 'beidou',
  10000025: 'xingqiu',
  10000026: 'xiao',
  10000027: 'ningguang',
  10000029: 'klee',
  10000030: 'zhongli',
  10000031: 'fischl',
  10000032: 'bennett',
  10000033: 'tartaglia',
  10000034: 'noelle',
  10000035: 'qiqi',
  10000036: 'chongyun',
  10000037: 'ganyu',
  10000038: 'albedo',
  10000039: 'diona',
  10000041: 'mona',
  10000042: 'keqing',
  10000043: 'sucrose',
  10000044: 'xinyan',
  10000045: 'rosaria',
  10000046: 'hu-tao',
  10000047: 'kazuha',
  10000048: 'yanfei',
  10000049: 'yoimiya',
  10000050: 'thoma',
  10000051: 'eula',
  10000052: 'raiden',
  10000053: 'sayu',
  10000054: 'kokomi',
  10000055: 'gorou',
  10000056: 'sara',
  10000057: 'arataki-itto',
  10000058: 'yae-miko',
  10000059: 'shikanoin-heizou',
  10000060: 'yelan',
  10000062: 'aloy',
  10000063: 'shenhe',
  10000064: 'yun-jin',
  10000065: 'kuki-shinobu',
  10000066: 'collei',
  10000067: 'dori',
  10000068: 'tighnari',
  10000069: 'nilou',
  10000070: 'cyno',
  10000071: 'candace',
  10000072: 'nahida',
  10000073: 'layla',
  10000074: 'wanderer',
  10000075: 'faruzan',
  10000076: 'yaoyao',
  10000077: 'alhaitham',
  10000078: 'dehya',
  10000079: 'mika',
  10000080: 'baizhu',
  10000081: 'kaveh',
  10000082: 'kirara',
  10000083: 'lyney',
  10000084: 'lynette',
  10000085: 'freminet',
  10000086: 'wriothesley',
  10000087: 'neuvillette',
  10000088: 'charlotte',
  10000089: 'furina',
  10000090: 'chevreuse',
  10000091: 'navia',
  10000092: 'gaming',
  10000093: 'xianyun',
  10000094: 'chiori',
  10000095: 'sigewinne',
  10000096: 'arlecchino',
  10000097: 'sethos',
  10000098: 'clorinde',
  10000099: 'emilie',
  10000100: 'kachina',
  10000101: 'kinich',
  10000102: 'mualani',
};

// Equip type mapping from Enka
export const EQUIP_TYPE_MAP = {
  'EQUIP_BRACER': 'flower',
  'EQUIP_NECKLACE': 'plume',
  'EQUIP_SHOES': 'sands',
  'EQUIP_RING': 'goblet',
  'EQUIP_DRESS': 'circlet',
};
