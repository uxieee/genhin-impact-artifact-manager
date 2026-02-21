const GENSHIN_DEV_BASE = 'https://genshin.jmp.blue';

// In-memory cache
const cache = {};

/**
 * Fetch with caching from genshin.jmp.blue
 */
async function fetchCached(path) {
    if (cache[path]) return cache[path];

    const response = await fetch(`${GENSHIN_DEV_BASE}${path}`);
    if (!response.ok) throw new Error(`genshin.dev API error: ${response.status}`);

    const data = await response.json();
    cache[path] = data;
    return data;
}

/**
 * Get list of all artifact set keys
 */
export async function getArtifactSetList() {
    return fetchCached('/artifacts');
}

/**
 * Get artifact set details
 */
export async function getArtifactSet(setId) {
    return fetchCached(`/artifacts/${setId}`);
}

/**
 * Get artifact set image URL
 */
export function getArtifactImageUrl(setId, piece) {
    return `${GENSHIN_DEV_BASE}/artifacts/${setId}/${piece}`;
}

/**
 * Get list of all character keys
 */
export async function getCharacterList() {
    return fetchCached('/characters');
}

/**
 * Get character details
 */
export async function getCharacterDetails(characterId) {
    return fetchCached(`/characters/${characterId}`);
}

/**
 * Get character icon URL
 */
export function getCharacterIconUrl(characterId) {
    return `${GENSHIN_DEV_BASE}/characters/${characterId}/icon-big`;
}

/**
 * Get character card/wish art URL
 */
export function getCharacterWishUrl(characterId) {
    return `${GENSHIN_DEV_BASE}/characters/${characterId}/gacha-splash`;
}

/**
 * Preload data for known characters and artifacts
 */
export async function preloadReferenceData(characterKeys, artifactSetKeys) {
    const promises = [];

    for (const key of characterKeys) {
        promises.push(getCharacterDetails(key).catch(() => null));
    }

    for (const key of artifactSetKeys) {
        promises.push(getArtifactSet(key).catch(() => null));
    }

    await Promise.allSettled(promises);
}
