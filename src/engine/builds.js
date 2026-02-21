/**
 * Character build recommendations database.
 * Each character has:
 *   - name: display name
 *   - element: vision element
 *   - weapon: weapon type
 *   - sets: array of recommended artifact set slugs (best first)
 *   - mainStats: recommended main stats per slot
 *   - substatWeights: weight 0-1 per substat key for scoring
 *   - notes: short build note
 */
const CHARACTER_BUILDS = {
    yelan: {
        name: 'Yelan',
        element: 'Hydro',
        weapon: 'Bow',
        sets: ['emblem-of-severed-fate'],
        altSets: [['noblesse-oblige', 'heart-of-depth']],
        mainStats: {
            sands: ['enerRech_', 'hp_'],
            goblet: ['hydro_dmg_', 'hp_'],
            circlet: ['critRate_', 'critDMG_'],
        },
        substatWeights: {
            critRate_: 1,
            critDMG_: 1,
            hp_: 0.9,
            enerRech_: 0.85,
            atk_: 0.2,
            eleMas: 0.1,
            hp: 0.3,
            atk: 0.05,
            def_: 0,
            def: 0,
        },
        notes: 'Burst-reliant Hydro sub-DPS. Needs ~200% ER. HP% scales her damage.',
    },

    bennett: {
        name: 'Bennett',
        element: 'Pyro',
        weapon: 'Sword',
        sets: ['noblesse-oblige'],
        altSets: [['emblem-of-severed-fate']],
        mainStats: {
            sands: ['enerRech_', 'hp_'],
            goblet: ['hp_'],
            circlet: ['hp_', 'heal_'],
        },
        substatWeights: {
            enerRech_: 1,
            hp_: 0.9,
            hp: 0.6,
            critRate_: 0.2,
            critDMG_: 0.2,
            atk_: 0.1,
            def_: 0.1,
            eleMas: 0.1,
            atk: 0.05,
            def: 0.05,
        },
        notes: 'Support build. ATK buff scales from base ATK (character + weapon only). Stack ER and HP.',
    },

    xiangling: {
        name: 'Xiangling',
        element: 'Pyro',
        weapon: 'Polearm',
        sets: ['emblem-of-severed-fate'],
        altSets: [['crimson-witch-of-flames']],
        mainStats: {
            sands: ['enerRech_'],
            goblet: ['pyro_dmg_'],
            circlet: ['critRate_', 'critDMG_'],
        },
        substatWeights: {
            critRate_: 1,
            critDMG_: 1,
            enerRech_: 0.9,
            atk_: 0.75,
            eleMas: 0.7,
            atk: 0.3,
            hp_: 0,
            hp: 0,
            def_: 0,
            def: 0,
        },
        notes: 'Off-field Pyro DPS. Needs 200-250% ER. Pyronado is the main damage source.',
    },

    xingqiu: {
        name: 'Xingqiu',
        element: 'Hydro',
        weapon: 'Sword',
        sets: ['emblem-of-severed-fate'],
        altSets: [['noblesse-oblige'], ['heart-of-depth']],
        mainStats: {
            sands: ['enerRech_', 'atk_'],
            goblet: ['hydro_dmg_'],
            circlet: ['critRate_', 'critDMG_'],
        },
        substatWeights: {
            critRate_: 1,
            critDMG_: 1,
            enerRech_: 0.85,
            atk_: 0.75,
            eleMas: 0.3,
            atk: 0.3,
            hp_: 0.1,
            hp: 0.05,
            def_: 0,
            def: 0,
        },
        notes: 'Hydro sub-DPS. Needs 190-260% ER depending on team. Rain swords deal massive damage.',
    },

    wanderer: {
        name: 'Wanderer',
        element: 'Anemo',
        weapon: 'Catalyst',
        sets: ['desert-pavilion-chronicle'],
        altSets: [['marechaussee-hunter'], ['shimenawa-s-reminiscence']],
        mainStats: {
            sands: ['atk_'],
            goblet: ['anemo_dmg_'],
            circlet: ['critRate_', 'critDMG_'],
        },
        substatWeights: {
            critRate_: 1,
            critDMG_: 1,
            atk_: 0.85,
            eleMas: 0.4,
            enerRech_: 0.3,
            atk: 0.35,
            hp_: 0,
            hp: 0,
            def_: 0,
            def: 0,
        },
        notes: 'Main DPS hypercarry. Uses normal/charged attacks while hovering. Aim for 70%+ Crit Rate.',
    },

    furina: {
        name: 'Furina',
        element: 'Hydro',
        weapon: 'Sword',
        sets: ['golden-troupe'],
        altSets: [['tenacity-of-the-millelith']],
        mainStats: {
            sands: ['hp_', 'enerRech_'],
            goblet: ['hp_', 'hydro_dmg_'],
            circlet: ['critRate_', 'critDMG_'],
        },
        substatWeights: {
            hp_: 1,
            critRate_: 0.9,
            critDMG_: 0.9,
            enerRech_: 0.8,
            hp: 0.5,
            atk_: 0.1,
            eleMas: 0.1,
            atk: 0.05,
            def_: 0,
            def: 0,
        },
        notes: 'Off-field support/sub-DPS. Scales off HP. Aim for ~40,000 HP and sufficient ER.',
    },

    nahida: {
        name: 'Nahida',
        element: 'Dendro',
        weapon: 'Catalyst',
        sets: ['deepwood-memories'],
        altSets: [['gilded-dreams']],
        mainStats: {
            sands: ['eleMas'],
            goblet: ['dendro_dmg_', 'eleMas'],
            circlet: ['critRate_', 'critDMG_', 'eleMas'],
        },
        substatWeights: {
            eleMas: 1,
            critRate_: 0.9,
            critDMG_: 0.9,
            enerRech_: 0.5,
            atk_: 0.4,
            atk: 0.2,
            hp_: 0,
            hp: 0,
            def_: 0,
            def: 0,
        },
        notes: 'Dendro app/buffer. Wants ~1000 EM. After 1000 EM, Crit and DMG% become more valuable.',
    },

    raiden: {
        name: 'Raiden Shogun',
        element: 'Electro',
        weapon: 'Polearm',
        sets: ['emblem-of-severed-fate'],
        altSets: [['tenacity-of-the-millelith', 'emblem-of-severed-fate']],
        mainStats: {
            sands: ['enerRech_'],
            goblet: ['electro_dmg_'],
            circlet: ['critRate_', 'critDMG_'],
        },
        substatWeights: {
            critRate_: 1,
            critDMG_: 1,
            enerRech_: 0.95,
            atk_: 0.75,
            eleMas: 0.3,
            atk: 0.35,
            hp_: 0,
            hp: 0,
            def_: 0,
            def: 0,
        },
        notes: 'Burst DPS / battery. Aim for 250%+ ER. EoSF synergizes perfectly with her kit.',
    },
};

/**
 * Get build for a character by key
 */
export function getCharacterBuild(characterKey) {
    return CHARACTER_BUILDS[characterKey] || null;
}

/**
 * Get all character builds
 */
export function getAllBuilds() {
    return CHARACTER_BUILDS;
}

/**
 * Check if a main stat is recommended for a character's slot
 */
export function isRecommendedMainStat(characterKey, slot, statKey) {
    const build = CHARACTER_BUILDS[characterKey];
    if (!build || !build.mainStats[slot]) return false;
    return build.mainStats[slot].includes(statKey);
}

/**
 * Check if an artifact set is recommended for a character
 */
export function isRecommendedSet(characterKey, setKey) {
    const build = CHARACTER_BUILDS[characterKey];
    if (!build) return false;
    if (build.sets.includes(setKey)) return true;
    return build.altSets?.some(combo => combo.includes(setKey)) || false;
}

export default CHARACTER_BUILDS;
