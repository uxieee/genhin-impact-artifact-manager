import { generateId } from '../utils/helpers';

/**
 * Parse a GOOD format JSON file.
 * GOOD = Genshin Optimizer Output Data
 * 
 * Expected structure:
 * {
 *   format: "GOOD",
 *   version: 2,
 *   source: "...",
 *   characters: [...],
 *   artifacts: [...],
 *   weapons: [...]
 * }
 */
export function parseGOODFormat(jsonData) {
    if (!jsonData || typeof jsonData !== 'object') {
        throw new Error('Invalid JSON data. Please upload a valid GOOD format file.');
    }

    // Allow both strict GOOD format and looser formats
    const isGOOD = jsonData.format === 'GOOD';

    if (!isGOOD && !jsonData.artifacts && !jsonData.characters) {
        throw new Error(
            'Unrecognized format. Please upload a GOOD format JSON file ' +
            '(exported from Genshin Optimizer, Inventory Kamera, or similar tools).'
        );
    }

    const characters = parseGOODCharacters(jsonData.characters || []);
    const artifacts = parseGOODArtifacts(jsonData.artifacts || []);

    return {
        characters,
        artifacts,
        source: jsonData.source || 'Unknown',
        version: jsonData.version || 1,
    };
}

/**
 * Parse GOOD character data
 */
function parseGOODCharacters(rawCharacters) {
    return rawCharacters.map(char => ({
        key: normalizeCharacterKey(char.key),
        level: char.level || 1,
        ascension: char.ascension || 0,
        constellation: char.constellation || 0,
        talents: char.talent || {},
    }));
}

/**
 * Parse GOOD artifact data
 */
function parseGOODArtifacts(rawArtifacts) {
    return rawArtifacts.map(art => {
        const substats = (art.substats || [])
            .filter(sub => sub.key && sub.value)
            .map(sub => ({
                key: normalizeStatKey(sub.key),
                value: sub.value,
            }));

        return {
            id: generateId(),
            setKey: normalizeSetKey(art.setKey),
            slotKey: normalizeSlotKey(art.slotKey),
            rarity: art.rarity || 5,
            level: art.level || 0,
            mainStat: {
                key: normalizeStatKey(art.mainStatKey),
                value: art.mainStatValue || 0,
            },
            substats,
            location: art.location ? normalizeCharacterKey(art.location) : null,
            lock: art.lock || false,
        };
    });
}

/**
 * Normalize character key from GOOD format.
 * GOOD uses PascalCase like "RaidenShogun", we use kebab-case like "raiden"
 */
function normalizeCharacterKey(key) {
    if (!key) return '';

    const mapping = {
        'RaidenShogun': 'raiden',
        'Raiden': 'raiden',
        'KamisatoAyaka': 'ayaka',
        'KamisatoAyato': 'ayato',
        'SangonomiyaKokomi': 'kokomi',
        'KaedeharaKazuha': 'kazuha',
        'AratakiItto': 'arataki-itto',
        'HuTao': 'hu-tao',
        'YaeMiko': 'yae-miko',
        'ShikanoinHeizou': 'shikanoin-heizou',
        'KukiShinobu': 'kuki-shinobu',
        'Tartaglia': 'tartaglia',
        'Wanderer': 'wanderer',
        'Xiangling': 'xiangling',
        'Xingqiu': 'xingqiu',
        'Bennett': 'bennett',
        'Yelan': 'yelan',
        'Furina': 'furina',
        'Nahida': 'nahida',
    };

    return mapping[key] || key.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

/**
 * Normalize stat key from GOOD format
 */
function normalizeStatKey(key) {
    if (!key) return '';

    const mapping = {
        'hp': 'hp',
        'hp_': 'hp_',
        'atk': 'atk',
        'atk_': 'atk_',
        'def': 'def',
        'def_': 'def_',
        'critRate_': 'critRate_',
        'critDMG_': 'critDMG_',
        'enerRech_': 'enerRech_',
        'eleMas': 'eleMas',
        'heal_': 'heal_',
        'pyro_dmg_': 'pyro_dmg_',
        'hydro_dmg_': 'hydro_dmg_',
        'electro_dmg_': 'electro_dmg_',
        'anemo_dmg_': 'anemo_dmg_',
        'dendro_dmg_': 'dendro_dmg_',
        'cryo_dmg_': 'cryo_dmg_',
        'geo_dmg_': 'geo_dmg_',
        'physical_dmg_': 'physical_dmg_',
    };

    return mapping[key] || key;
}

/**
 * Normalize artifact set key from GOOD format
 */
function normalizeSetKey(key) {
    if (!key) return '';

    const mapping = {
        'EmblemOfSeveredFate': 'emblem-of-severed-fate',
        'NoblesseOblige': 'noblesse-oblige',
        'CrimsonWitchOfFlames': 'crimson-witch-of-flames',
        'ViridescentVenerer': 'viridescent-venerer',
        'GoldenTroupe': 'golden-troupe',
        'DeepwoodMemories': 'deepwood-memories',
        'GildedDreams': 'gilded-dreams',
        'DesertPavilionChronicle': 'desert-pavilion-chronicle',
        'MarechausseeHunter': 'marechaussee-hunter',
        'HeartOfDepth': 'heart-of-depth',
        'BlizzardStrayer': 'blizzard-strayer',
        'GladiatorsFinale': 'gladiator-s-finale',
        'WanderersTroupe': 'wanderer-s-troupe',
        'ShimenawasReminiscence': 'shimenawa-s-reminiscence',
        'TenacityOfTheMillelith': 'tenacity-of-the-millelith',
        'PaleFlame': 'pale-flame',
        'Thundersoother': 'thundersoother',
        'ThunderingFury': 'thundering-fury',
        'MaidenBeloved': 'maiden-beloved',
        'Lavawalker': 'lavawalker',
        'BloodstainedChivalry': 'bloodstained-chivalry',
        'ArchaicPetra': 'archaic-petra',
        'RetracingBolide': 'retracing-bolide',
        'HuskOfOpulentDreams': 'husk-of-opulent-dreams',
        'OceanHuedClam': 'ocean-hued-clam',
        'VermillionHereafter': 'vermillion-hereafter',
        'EchoesOfAnOffering': 'echoes-of-an-offering',
        'FlowerOfParadiseLost': 'flower-of-paradise-lost',
        'NymphsDream': 'nymph-s-dream',
        'VourukashasGlow': 'vourukasha-s-glow',
        'SongOfDaysPast': 'song-of-days-past',
        'FragmentOfHarmonicWhimsy': 'fragment-of-harmonic-whimsy',
        'UnfinishedReverie': 'unfinished-reverie',
        'NighttimeWhispersInTheEchoingWoods': 'nighttime-whispers-in-the-echoing-woods',
    };

    return mapping[key] || key.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '').replace(/'/g, '-s-');
}

/**
 * Normalize slot key from GOOD format
 */
function normalizeSlotKey(key) {
    if (!key) return '';

    const mapping = {
        'flower': 'flower',
        'plume': 'plume',
        'sands': 'sands',
        'goblet': 'goblet',
        'circlet': 'circlet',
    };

    return mapping[key] || key;
}

/**
 * Validate GOOD JSON structure and return info about it
 */
export function validateGOODFile(jsonData) {
    const errors = [];
    const warnings = [];

    if (!jsonData) {
        errors.push('File is empty or invalid JSON');
        return { valid: false, errors, warnings };
    }

    if (jsonData.format && jsonData.format !== 'GOOD') {
        warnings.push(`Format is "${jsonData.format}" instead of "GOOD" — may cause parsing issues`);
    }

    if (!jsonData.artifacts || !Array.isArray(jsonData.artifacts)) {
        errors.push('No artifacts array found in the file');
    } else if (jsonData.artifacts.length === 0) {
        warnings.push('Artifacts array is empty');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        stats: {
            artifactCount: jsonData.artifacts?.length || 0,
            characterCount: jsonData.characters?.length || 0,
            weaponCount: jsonData.weapons?.length || 0,
        },
    };
}
