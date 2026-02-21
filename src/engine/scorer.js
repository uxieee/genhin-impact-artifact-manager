import { MAX_SUBSTAT_ROLLS } from '../utils/constants';
import { getCharacterBuild } from './builds';

/**
 * Calculate the roll value of a single substat.
 * Returns a value between 0 and ~1 per roll (can exceed 1 if multiple rolls).
 */
export function getSubstatRollValue(statKey, statValue) {
    const maxRoll = MAX_SUBSTAT_ROLLS[statKey];
    if (!maxRoll) return 0;
    return statValue / maxRoll;
}

/**
 * Score an artifact for a specific character.
 * 
 * @param {Object} artifact - normalized artifact { mainStat, substats, slotKey, setKey, rarity, level }
 * @param {string} characterKey - character key like 'raiden', 'yelan'
 * @returns {Object} { score (0-100), tier, breakdown[] }
 */
export function scoreArtifact(artifact, characterKey) {
    const build = getCharacterBuild(characterKey);
    if (!build || !artifact) {
        return { score: 0, tier: 'F', breakdown: [], mainStatMatch: false, setMatch: false };
    }

    const weights = build.substatWeights;
    let totalWeightedRV = 0;
    const breakdown = [];

    // Score each substat
    for (const sub of (artifact.substats || [])) {
        const rv = getSubstatRollValue(sub.key, sub.value);
        const weight = weights[sub.key] ?? 0;
        const contribution = rv * weight;
        totalWeightedRV += contribution;

        breakdown.push({
            key: sub.key,
            value: sub.value,
            rollValue: rv,
            weight,
            contribution,
        });
    }

    // Normalize to 0-100 scale
    // A "perfect" artifact has ~9 max rolls (5 upgrades + 4 initial substats with good rolls)
    // into the best stats (weight = 1), so max weighted RV ≈ 9
    const maxPossibleRV = 9;
    let score = Math.min(100, (totalWeightedRV / maxPossibleRV) * 100);

    // Main stat bonus/penalty
    const mainStatMatch = artifact.slotKey && build.mainStats[artifact.slotKey]
        ? build.mainStats[artifact.slotKey].includes(artifact.mainStat?.key)
        : true; // flower and plume main stats are always fixed

    if (['sands', 'goblet', 'circlet'].includes(artifact.slotKey) && !mainStatMatch) {
        score *= 0.5; // heavy penalty for wrong main stat
    }

    // Set bonus
    const setMatch = build.sets.includes(artifact.setKey) ||
        build.altSets?.some(combo => combo.includes(artifact.setKey));

    if (setMatch) {
        score = Math.min(100, score * 1.1); // 10% boost for matching set
    }

    // Determine tier
    const tier = getTierFromScore(score);

    return {
        score: Math.round(score * 10) / 10,
        tier,
        breakdown,
        mainStatMatch,
        setMatch: !!setMatch,
        totalWeightedRV,
    };
}

/**
 * Score an artifact across ALL characters and return the best match.
 */
export function scoreArtifactBest(artifact, characterKeys) {
    let bestScore = { score: 0, tier: 'F', characterKey: null };

    for (const key of characterKeys) {
        const result = scoreArtifact(artifact, key);
        if (result.score > bestScore.score) {
            bestScore = { ...result, characterKey: key };
        }
    }

    return bestScore;
}

function getTierFromScore(score) {
    if (score >= 80) return 'S';
    if (score >= 65) return 'A';
    if (score >= 50) return 'B';
    if (score >= 35) return 'C';
    if (score >= 20) return 'D';
    return 'F';
}
