import { useMemo } from 'react';
import { useAppData } from '../App';
import { getCharacterBuild, isRecommendedSet } from '../engine/builds';
import { scoreArtifact } from '../engine/scorer';
import { adviseArtifact } from '../engine/advisor';
import { getCharacterIconUrl } from '../api/genshinDev';
import { ARTIFACT_SLOT_NAMES, ELEMENT_COLORS } from '../utils/constants';
import { formatSetName, formatStat, getStatLabel } from '../utils/helpers';

export default function CharacterDetail({ characterKey }) {
    const { appData, navigateTo } = useAppData();
    const { characters, artifacts } = appData;

    const character = characters.find(c => c.key === characterKey);
    const build = getCharacterBuild(characterKey);

    const equippedArtifacts = useMemo(() => {
        if (!character) return [];
        return character.equippedArtifacts || artifacts.filter(a => a.location === characterKey);
    }, [character, artifacts, characterKey]);

    const artifactScores = useMemo(() => {
        return equippedArtifacts.map(a => ({
            artifact: a,
            score: scoreArtifact(a, characterKey),
        }));
    }, [equippedArtifacts, characterKey]);

    const totalScore = useMemo(() => {
        if (artifactScores.length === 0) return 0;
        return artifactScores.reduce((sum, a) => sum + a.score.score, 0) / artifactScores.length;
    }, [artifactScores]);

    if (!character) {
        return (
            <div className="empty-state animate-in">
                <div className="empty-icon">❓</div>
                <h3>Character Not Found</h3>
                <p>This character wasn't in your imported data.</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigateTo('characters')}>
                    ← Back to Characters
                </button>
            </div>
        );
    }

    const element = build?.element || 'Anemo';
    const elementColor = ELEMENT_COLORS[element] || '#fff';
    const slots = ['flower', 'plume', 'sands', 'goblet', 'circlet'];

    return (
        <div className="animate-in">
            {/* Back Button */}
            <button
                className="btn btn-sm btn-secondary"
                onClick={() => navigateTo('characters')}
                style={{ marginBottom: 20 }}
            >
                ← Back to Characters
            </button>

            {/* Header */}
            <div className="char-detail-header">
                <img
                    src={getCharacterIconUrl(characterKey)}
                    alt={build?.name || characterKey}
                    className="char-detail-avatar"
                    style={{ borderColor: elementColor }}
                    onError={(e) => {
                        e.target.style.background = `linear-gradient(135deg, ${elementColor}22, ${elementColor}08)`;
                    }}
                />
                <div className="char-detail-info">
                    <h1 style={{ color: elementColor }}>{build?.name || characterKey}</h1>
                    <span className={`element-badge ${element}`} style={{ marginBottom: 8 }}>
                        {element} • {build?.weapon || 'Unknown'}
                    </span>
                    <div className="char-detail-stats">
                        <div className="char-detail-stat">Level: <span>{character.level}</span></div>
                        <div className="char-detail-stat">Constellation: <span>C{character.constellation}</span></div>
                        <div className="char-detail-stat">Build Score: <span style={{ color: elementColor }}>{Math.round(totalScore)}/100</span></div>
                    </div>
                    {build?.notes && (
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, maxWidth: 500, lineHeight: 1.5 }}>
                            💡 {build.notes}
                        </p>
                    )}
                </div>
            </div>

            {/* Equipped Artifacts */}
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
                Equipped Artifacts
            </h3>
            <div className="artifacts-row">
                {slots.map(slot => {
                    const data = artifactScores.find(a => a.artifact.slotKey === slot);
                    if (!data) {
                        return (
                            <div key={slot} className="artifact-card" style={{ opacity: 0.4 }}>
                                <div className="artifact-slot">{ARTIFACT_SLOT_NAMES[slot]}</div>
                                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                                    Empty
                                </div>
                            </div>
                        );
                    }

                    const { artifact, score } = data;
                    return (
                        <div key={slot} className="artifact-card">
                            <div className="artifact-level">+{artifact.level}</div>
                            <div className="artifact-header">
                                <div>
                                    <div className="rarity-stars">{'★'.repeat(artifact.rarity)}</div>
                                    <div className="artifact-set-name">{formatSetName(artifact.setKey)}</div>
                                    <div className="artifact-slot">{ARTIFACT_SLOT_NAMES[slot]}</div>
                                </div>
                                <div className={`score-badge tier-${score.tier}`}>{score.tier}</div>
                            </div>
                            {artifact.mainStat && (
                                <div className="main-stat">
                                    {getStatLabel(artifact.mainStat.key)}: {formatStat(artifact.mainStat.key, artifact.mainStat.value)}
                                    {!score.mainStatMatch && ['sands', 'goblet', 'circlet'].includes(slot) && (
                                        <span style={{ color: 'var(--tier-f)', fontSize: 11, marginLeft: 6 }}>⚠️ Off-meta</span>
                                    )}
                                </div>
                            )}
                            <div className="substats">
                                {(artifact.substats || []).map((sub, j) => {
                                    const breakdown = score.breakdown?.find(b => b.key === sub.key);
                                    const quality = breakdown ?
                                        (breakdown.weight >= 0.8 ? 'great' : breakdown.weight >= 0.4 ? 'good' : 'bad')
                                        : 'bad';
                                    return (
                                        <div key={j} className={`substat ${quality}`}>
                                            <span>{getStatLabel(sub.key)}</span>
                                            <span>{formatStat(sub.key, sub.value)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                                Score: {score.score}/100
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recommended Build */}
            {build && (
                <div className="build-panel" style={{ marginTop: 8 }}>
                    <h3>📋 Recommended Build</h3>
                    <div className="build-row">
                        <span className="build-label">Best Set</span>
                        <span className="build-value">{build.sets.map(s => formatSetName(s)).join(', ')}</span>
                    </div>
                    {build.altSets?.map((combo, i) => (
                        <div key={i} className="build-row">
                            <span className="build-label">Alternative {i + 1}</span>
                            <span className="build-value" style={{ color: 'var(--text-secondary)' }}>
                                {combo.map(s => formatSetName(s)).join(' + ')}
                            </span>
                        </div>
                    ))}
                    <div style={{ height: 8 }} />
                    {['sands', 'goblet', 'circlet'].map(slot => (
                        <div key={slot} className="build-row">
                            <span className="build-label">{ARTIFACT_SLOT_NAMES[slot]}</span>
                            <span className="build-value">
                                {build.mainStats[slot].map(s => getStatLabel(s)).join(' / ')}
                            </span>
                        </div>
                    ))}
                    <div style={{ height: 8 }} />
                    <div className="build-row">
                        <span className="build-label">Priority Substats</span>
                        <span className="build-value">
                            {Object.entries(build.substatWeights)
                                .filter(([_, w]) => w >= 0.7)
                                .sort((a, b) => b[1] - a[1])
                                .map(([k]) => getStatLabel(k))
                                .join(', ')}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
