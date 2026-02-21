import { AVATAR_ID_MAP, EQUIP_TYPE_MAP, ENKA_FLAT_PROP_MAP } from '../utils/constants';
import { generateId } from '../utils/helpers';

const ENKA_BASE = 'https://enka.network';
const CORS_PROXY = 'https://corsproxy.io/?url=';

/**
 * Fetch player data from Enka.Network API
 * @param {string} uid - Genshin Impact UID
 * @returns {Object} { playerInfo, characters, artifacts, raw }
 */
export async function fetchEnkaData(uid) {
    const url = `${ENKA_BASE}/api/uid/${uid}/`;

    // Try direct first, then CORS proxy
    let response;
    try {
        response = await fetch(url, {
            headers: { 'User-Agent': 'GenshinArtifactManager/1.0' },
        });
    } catch (e) {
        // CORS blocked, try proxy
        response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
    }

    if (!response.ok) {
        const errorMessages = {
            400: 'Invalid UID format. Please enter a valid 9-digit UID.',
            404: 'Player not found. Please check your UID.',
            424: 'Game is under maintenance. Please try again later.',
            429: 'Too many requests. Please wait a moment and try again.',
            500: 'Server error. Please try again later.',
            503: 'Service unavailable. Please try again later.',
        };
        throw new Error(errorMessages[response.status] || `API error: ${response.status}`);
    }

    const data = await response.json();
    return parseEnkaResponse(data);
}

/**
 * Parse raw Enka API response into normalized format
 */
function parseEnkaResponse(data) {
    const playerInfo = {
        nickname: data.playerInfo?.nickname || 'Unknown',
        level: data.playerInfo?.level || 0,
        worldLevel: data.playerInfo?.worldLevel || 0,
        achievements: data.playerInfo?.finishAchievementNum || 0,
        spiralAbyss: data.playerInfo?.towerFloorIndex
            ? `${data.playerInfo.towerFloorIndex}-${data.playerInfo.towerLevelIndex}`
            : 'N/A',
    };

    const characters = [];
    const artifacts = [];

    if (data.avatarInfoList) {
        for (const avatar of data.avatarInfoList) {
            const characterKey = AVATAR_ID_MAP[avatar.avatarId];
            if (!characterKey) continue;

            const character = {
                key: characterKey,
                avatarId: avatar.avatarId,
                level: avatar.propMap?.['4001']?.val ? parseInt(avatar.propMap['4001'].val) : 0,
                ascension: avatar.propMap?.['1002']?.val ? parseInt(avatar.propMap['1002'].val) : 0,
                constellation: avatar.talentIdList?.length || 0,
                equippedArtifacts: [],
            };

            // Parse equipped artifacts
            if (avatar.equipList) {
                for (const equip of avatar.equipList) {
                    if (!equip.reliquary) continue; // Skip weapons

                    const flat = equip.flat;
                    if (!flat) continue;

                    const slotKey = EQUIP_TYPE_MAP[flat.equipType];
                    if (!slotKey) continue;

                    // Parse set name from icon
                    const setKey = parseSetKeyFromIcon(flat.icon);

                    // Parse main stat
                    const mainStatProp = flat.reliquaryMainstat;
                    const mainStat = mainStatProp ? {
                        key: ENKA_FLAT_PROP_MAP[mainStatProp.mainPropId] || mainStatProp.mainPropId,
                        value: mainStatProp.statValue,
                    } : null;

                    // Parse substats
                    const substats = (flat.reliquarySubstats || []).map(sub => ({
                        key: ENKA_FLAT_PROP_MAP[sub.appendPropId] || sub.appendPropId,
                        value: sub.statValue,
                    }));

                    const artifact = {
                        id: generateId(),
                        setKey,
                        slotKey,
                        rarity: flat.rankLevel || 5,
                        level: equip.reliquary.level ? equip.reliquary.level - 1 : 0,
                        mainStat,
                        substats,
                        location: characterKey,
                        setName: flat.setNameTextMapHash,
                        icon: flat.icon,
                    };

                    artifacts.push(artifact);
                    character.equippedArtifacts.push(artifact);
                }
            }

            characters.push(character);
        }
    }

    return {
        playerInfo,
        characters,
        artifacts,
        ttl: data.ttl,
        raw: data,
        hasShowcase: !!data.avatarInfoList,
    };
}

/**
 * Extract set key from icon name
 * Icon format like "UI_RelicIcon_15026_4" → need to map set ID
 */
function parseSetKeyFromIcon(icon) {
    if (!icon) return 'unknown';
    // Extract the set number from icon like "UI_RelicIcon_15026_4"
    const match = icon.match(/UI_RelicIcon_(\d+)_/);
    if (!match) return 'unknown';

    const setId = match[1];
    return SET_ID_MAP[setId] || `set-${setId}`;
}

// Map Enka set IDs to our slug keys
const SET_ID_MAP = {
    '10001': 'resolution-of-sojourner',
    '10002': 'brave-heart',
    '10003': 'defender-s-will',
    '10004': 'tiny-miracle',
    '10005': 'berserker',
    '10006': 'martial-artist',
    '10007': 'instructor',
    '10008': 'gambler',
    '10009': 'the-exile',
    '10010': 'adventurer',
    '10011': 'lucky-dog',
    '10012': 'scholar',
    '10013': 'traveling-doctor',
    '14001': 'gladiator-s-finale',
    '14002': 'wanderer-s-troupe',
    '14003': 'thundersoother',
    '14004': 'thundering-fury',
    '15001': 'maiden-beloved',
    '15002': 'viridescent-venerer',
    '15003': 'crimson-witch-of-flames',
    '15004': 'lavawalker',
    '15005': 'noblesse-oblige',
    '15006': 'bloodstained-chivalry',
    '15007': 'archaic-petra',
    '15008': 'retracing-bolide',
    '15009': 'heart-of-depth',
    '15010': 'blizzard-strayer',
    '15013': 'tenacity-of-the-millelith',
    '15014': 'pale-flame',
    '15015': 'emblem-of-severed-fate',
    '15016': 'shimenawa-s-reminiscence',
    '15017': 'husk-of-opulent-dreams',
    '15018': 'ocean-hued-clam',
    '15019': 'vermillion-hereafter',
    '15020': 'echoes-of-an-offering',
    '15021': 'deepwood-memories',
    '15022': 'gilded-dreams',
    '15023': 'desert-pavilion-chronicle',
    '15024': 'flower-of-paradise-lost',
    '15025': 'nymph-s-dream',
    '15026': 'vourukasha-s-glow',
    '15027': 'golden-troupe',
    '15028': 'marechaussee-hunter',
    '15029': 'song-of-days-past',
    '15030': 'nighttime-whispers-in-the-echoing-woods',
    '15031': 'fragment-of-harmonic-whimsy',
    '15032': 'unfinished-reverie',
};
