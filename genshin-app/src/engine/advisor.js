import { scoreArtifact, scoreArtifactBest } from './scorer';
import { getCharacterBuild, getAllBuilds } from './builds';

/**
 * Analyze an artifact and provide recommendation.
 * Returns: { recommendation, bestCharacter, bestScore, allScores }
 * 
 * Recommendations:
 *   'best-in-slot' — S tier for at least one character
 *   'keep'         — A or B tier
 *   'potential'    — C tier, might improve
 *   'fodder'       — D or F tier, safe to trash
 */
export function adviseArtifact(artifact, ownedCharacterKeys = null) {
    const builds = getAllBuilds();
    const keys = ownedCharacterKeys || Object.keys(builds);

    const allScores = {};
    let bestScore = { score: 0, tier: 'F', characterKey: null };

    for (const key of keys) {
        const result = scoreArtifact(artifact, key);
        allScores[key] = result;
        if (result.score > bestScore.score) {
            bestScore = { ...result, characterKey: key };
        }
    }

    let recommendation;
    if (bestScore.tier === 'S') {
        recommendation = 'best-in-slot';
    } else if (bestScore.tier === 'A' || bestScore.tier === 'B') {
        recommendation = 'keep';
    } else if (bestScore.tier === 'C') {
        recommendation = 'potential';
    } else {
        recommendation = 'fodder';
    }

    return {
        recommendation,
        bestCharacter: bestScore.characterKey,
        bestScore,
        allScores,
    };
}

/**
 * Get recommendation label and icon
 */
export function getRecommendationDisplay(recommendation) {
    switch (recommendation) {
        case 'best-in-slot':
            return { icon: '🏆', label: 'Best-in-Slot', color: '#FFD700' };
        case 'keep':
            return { icon: '✅', label: 'Keep', color: '#4CC2F1' };
        case 'potential':
            return { icon: '🔄', label: 'Potential', color: '#74C2A8' };
        case 'fodder':
            return { icon: '🗑️', label: 'Fodder', color: '#EF4444' };
        default:
            return { icon: '❓', label: 'Unknown', color: '#888' };
    }
}

/**
 * Analyze all artifacts and produce a summary.
 */
export function analyzeInventory(artifacts, characterKeys) {
    const results = artifacts.map(artifact => {
        const advice = adviseArtifact(artifact, characterKeys);
        return { artifact, ...advice };
    });

    const summary = {
        total: artifacts.length,
        byRecommendation: {
            'best-in-slot': results.filter(r => r.recommendation === 'best-in-slot').length,
            'keep': results.filter(r => r.recommendation === 'keep').length,
            'potential': results.filter(r => r.recommendation === 'potential').length,
            'fodder': results.filter(r => r.recommendation === 'fodder').length,
        },
        byTier: {
            S: results.filter(r => r.bestScore.tier === 'S').length,
            A: results.filter(r => r.bestScore.tier === 'A').length,
            B: results.filter(r => r.bestScore.tier === 'B').length,
            C: results.filter(r => r.bestScore.tier === 'C').length,
            D: results.filter(r => r.bestScore.tier === 'D').length,
            F: results.filter(r => r.bestScore.tier === 'F').length,
        },
        topArtifacts: [...results].sort((a, b) => b.bestScore.score - a.bestScore.score).slice(0, 5),
        fodderCount: results.filter(r => r.recommendation === 'fodder').length,
    };

    return { results, summary };
}

/**
 * Get upgrade suggestions for a character.
 * Compares equipped vs inventory artifacts.
 */
export function getUpgradeSuggestions(characterKey, equippedArtifacts, allArtifacts) {
    const build = getCharacterBuild(characterKey);
    if (!build) return [];

    const suggestions = [];

    for (const slot of ['flower', 'plume', 'sands', 'goblet', 'circlet']) {
        const equipped = equippedArtifacts.find(a => a.slotKey === slot);
        const equippedScore = equipped ? scoreArtifact(equipped, characterKey) : { score: 0 };

        // Find better artifacts in inventory for this slot
        const candidates = allArtifacts
            .filter(a => a.slotKey === slot && a !== equipped)
            .map(a => ({
                artifact: a,
                score: scoreArtifact(a, characterKey),
            }))
            .filter(c => c.score.score > equippedScore.score)
            .sort((a, b) => b.score.score - a.score.score);

        if (candidates.length > 0) {
            suggestions.push({
                slot,
                current: equipped,
                currentScore: equippedScore,
                suggestion: candidates[0].artifact,
                suggestionScore: candidates[0].score,
                improvement: candidates[0].score.score - equippedScore.score,
            });
        }
    }

    return suggestions.sort((a, b) => b.improvement - a.improvement);
}
