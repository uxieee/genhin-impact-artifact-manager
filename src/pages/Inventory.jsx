import { useState, useMemo } from 'react';
import { useAppData } from '../App';
import { adviseArtifact, getRecommendationDisplay } from '../engine/advisor';
import { getAllBuilds } from '../engine/builds';
import { ARTIFACT_SLOT_NAMES } from '../utils/constants';
import { formatSetName, formatStat, getStatLabel } from '../utils/helpers';

export default function Inventory() {
    const { appData } = useAppData();
    const { artifacts, characters } = appData;
    const builds = getAllBuilds();
    const characterKeys = characters.map(c => c.key).filter(k => builds[k]);

    const [filter, setFilter] = useState('all'); // all, best-in-slot, keep, potential, fodder
    const [slotFilter, setSlotFilter] = useState('all');
    const [sortBy, setSortBy] = useState('score'); // score, level, set
    const [searchQuery, setSearchQuery] = useState('');

    // Analyze all artifacts
    const analyzed = useMemo(() => {
        const keys = characterKeys.length > 0 ? characterKeys : Object.keys(builds);
        return artifacts.map(artifact => {
            const advice = adviseArtifact(artifact, keys);
            return { artifact, ...advice };
        });
    }, [artifacts, characterKeys]);

    // Filter and sort
    const filtered = useMemo(() => {
        let result = [...analyzed];

        if (filter !== 'all') {
            result = result.filter(a => a.recommendation === filter);
        }

        if (slotFilter !== 'all') {
            result = result.filter(a => a.artifact.slotKey === slotFilter);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a =>
                formatSetName(a.artifact.setKey).toLowerCase().includes(q) ||
                a.artifact.slotKey?.toLowerCase().includes(q)
            );
        }

        result.sort((a, b) => {
            if (sortBy === 'score') return b.bestScore.score - a.bestScore.score;
            if (sortBy === 'level') return (b.artifact.level || 0) - (a.artifact.level || 0);
            if (sortBy === 'set') return (a.artifact.setKey || '').localeCompare(b.artifact.setKey || '');
            return 0;
        });

        return result;
    }, [analyzed, filter, slotFilter, sortBy, searchQuery]);

    const counts = useMemo(() => ({
        all: analyzed.length,
        'best-in-slot': analyzed.filter(a => a.recommendation === 'best-in-slot').length,
        keep: analyzed.filter(a => a.recommendation === 'keep').length,
        potential: analyzed.filter(a => a.recommendation === 'potential').length,
        fodder: analyzed.filter(a => a.recommendation === 'fodder').length,
    }), [analyzed]);

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1>Artifact Inventory</h1>
                <p>{artifacts.length} artifacts loaded • {counts.fodder} can be scrapped</p>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                {[
                    { key: 'all', label: '🎯 All' },
                    { key: 'best-in-slot', label: '🏆 Best-in-Slot' },
                    { key: 'keep', label: '✅ Keep' },
                    { key: 'potential', label: '🔄 Potential' },
                    { key: 'fodder', label: '🗑️ Fodder' },
                ].map(f => (
                    <button
                        key={f.key}
                        className={`filter-btn ${filter === f.key ? 'active' : ''}`}
                        onClick={() => setFilter(f.key)}
                    >
                        {f.label} ({counts[f.key]})
                    </button>
                ))}

                <div style={{ width: 1, height: 24, background: 'var(--border-subtle)', margin: '0 4px' }} />

                <select
                    value={slotFilter}
                    onChange={(e) => setSlotFilter(e.target.value)}
                    style={{
                        padding: '6px 12px',
                        borderRadius: 20,
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                    }}
                >
                    <option value="all">All Slots</option>
                    {Object.entries(ARTIFACT_SLOT_NAMES).map(([key, name]) => (
                        <option key={key} value={key}>{name}</option>
                    ))}
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                        padding: '6px 12px',
                        borderRadius: 20,
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                    }}
                >
                    <option value="score">Sort: Best Score</option>
                    <option value="level">Sort: Level</option>
                    <option value="set">Sort: Set Name</option>
                </select>

                <input
                    type="text"
                    className="search-input"
                    placeholder="Search sets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <h3>No Artifacts Found</h3>
                    <p>Try adjusting your filters or import more data.</p>
                </div>
            ) : (
                <div className="grid-4">
                    {filtered.map((item, i) => {
                        const { artifact, recommendation, bestCharacter, bestScore } = item;
                        const recDisplay = getRecommendationDisplay(recommendation);
                        const charBuild = builds[bestCharacter];

                        return (
                            <div key={artifact.id || i} className="artifact-card">
                                <div className="artifact-level">+{artifact.level || 0}</div>
                                <div className="artifact-header">
                                    <div>
                                        <div className="rarity-stars">{'★'.repeat(artifact.rarity || 5)}</div>
                                        <div className="artifact-set-name">{formatSetName(artifact.setKey)}</div>
                                        <div className="artifact-slot">{ARTIFACT_SLOT_NAMES[artifact.slotKey] || artifact.slotKey}</div>
                                    </div>
                                    <div className={`score-badge tier-${bestScore.tier}`}>{bestScore.tier}</div>
                                </div>

                                {artifact.mainStat && (
                                    <div className="main-stat">
                                        {getStatLabel(artifact.mainStat.key)}: {formatStat(artifact.mainStat.key, artifact.mainStat.value)}
                                    </div>
                                )}

                                <div className="substats">
                                    {(artifact.substats || []).map((sub, j) => {
                                        const breakdown = bestScore.breakdown?.find(b => b.key === sub.key);
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

                                <div style={{
                                    marginTop: 10,
                                    paddingTop: 10,
                                    borderTop: '1px solid var(--border-subtle)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}>
                                    <span className={`rec-badge ${recommendation}`}>
                                        {recDisplay.icon} {recDisplay.label}
                                    </span>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                        {charBuild?.name || bestCharacter}
                                    </span>
                                </div>

                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                    Score: {bestScore.score}/100
                                    {artifact.location && ` • On: ${builds[artifact.location]?.name || artifact.location}`}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
