import { useMemo } from 'react';
import { useAppData } from '../App';
import { analyzeInventory } from '../engine/advisor';
import { getAllBuilds } from '../engine/builds';
import { getScoreTier, SCORE_TIERS } from '../utils/constants';
import { formatSetName } from '../utils/helpers';
import { getCharacterIconUrl } from '../api/genshinDev';

export default function Dashboard() {
    const { appData, navigateTo } = useAppData();
    const { characters, artifacts, playerInfo } = appData;

    const builds = getAllBuilds();
    const characterKeys = characters.map(c => c.key).filter(k => builds[k]);

    const analysis = useMemo(() => {
        if (artifacts.length === 0) return null;
        return analyzeInventory(artifacts, characterKeys.length > 0 ? characterKeys : Object.keys(builds));
    }, [artifacts, characterKeys]);

    const tierEntries = Object.entries(SCORE_TIERS);
    const totalArtifacts = analysis?.summary?.total || 0;

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Overview of your artifact collection quality</p>
            </div>

            {/* Stat Cards */}
            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Artifacts</div>
                    <div className="stat-value">{totalArtifacts}</div>
                    <div className="stat-sub">across {characters.length} characters</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Characters</div>
                    <div className="stat-value">{characters.length}</div>
                    <div className="stat-sub">in your showcase</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Fodder Artifacts</div>
                    <div className="stat-value" style={{ color: 'var(--tier-f)' }}>
                        {analysis?.summary?.fodderCount || 0}
                    </div>
                    <div className="stat-sub">safe to scrap</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">God Rolls</div>
                    <div className="stat-value" style={{ color: 'var(--tier-s)' }}>
                        {analysis?.summary?.byTier?.S || 0}
                    </div>
                    <div className="stat-sub">S-tier artifacts</div>
                </div>
            </div>

            {/* Tier Distribution */}
            {analysis && totalArtifacts > 0 && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-header">
                        <span className="card-title">Quality Distribution</span>
                    </div>
                    <div className="tier-bar">
                        {tierEntries.map(([key, tier]) => {
                            const count = analysis.summary.byTier[key] || 0;
                            const pct = (count / totalArtifacts) * 100;
                            return (
                                <div
                                    key={key}
                                    className="tier-bar-segment"
                                    style={{
                                        width: `${pct}%`,
                                        backgroundColor: tier.color,
                                    }}
                                    title={`${key}: ${count} (${pct.toFixed(1)}%)`}
                                />
                            );
                        })}
                    </div>
                    <div className="tier-legend">
                        {tierEntries.map(([key, tier]) => (
                            <div key={key} className="tier-legend-item">
                                <div className="tier-legend-dot" style={{ backgroundColor: tier.color }} />
                                <span>{key}: {analysis.summary.byTier[key] || 0} — {tier.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Two Column: Characters + Top Artifacts */}
            <div className="grid-2">
                {/* Characters Quick View */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Your Characters</span>
                        <button className="btn btn-sm btn-secondary" onClick={() => navigateTo('characters')}>
                            View All →
                        </button>
                    </div>
                    {characters.length === 0 ? (
                        <div className="empty-state">
                            <p>No characters found. Try fetching your showcase or importing a GOOD JSON.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {characters.slice(0, 6).map(char => {
                                const build = builds[char.key];
                                return (
                                    <div
                                        key={char.key}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            padding: '8px 12px',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            background: 'rgba(20, 25, 45, 0.4)',
                                            transition: 'background 0.2s',
                                        }}
                                        onClick={() => navigateTo('character-detail', char.key)}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(40, 50, 80, 0.6)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(20, 25, 45, 0.4)'}
                                    >
                                        <img
                                            src={getCharacterIconUrl(char.key)}
                                            alt={build?.name || char.key}
                                            style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', background: 'rgba(20,25,45,0.5)' }}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: 600 }}>{build?.name || char.key}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                Lv. {char.level} • {char.equippedArtifacts?.length || 0} artifacts
                                            </div>
                                        </div>
                                        {build && (
                                            <span className={`element-badge ${build.element}`}>
                                                {build.element}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Top Artifacts */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Top Artifacts</span>
                        <button className="btn btn-sm btn-secondary" onClick={() => navigateTo('inventory')}>
                            View All →
                        </button>
                    </div>
                    {(!analysis || analysis.summary.topArtifacts.length === 0) ? (
                        <div className="empty-state">
                            <p>No artifacts analyzed yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {analysis.summary.topArtifacts.map((item, i) => {
                                const tier = getScoreTier(item.bestScore.score);
                                const build = builds[item.bestCharacter];
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            padding: '8px 12px',
                                            borderRadius: 'var(--radius-sm)',
                                            background: 'rgba(20, 25, 45, 0.4)',
                                        }}
                                    >
                                        <div className={`score-badge tier-${item.bestScore.tier}`}>
                                            {item.bestScore.tier}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>
                                                {formatSetName(item.artifact.setKey)}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                {item.artifact.slotKey} • Score: {item.bestScore.score}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                            Best for {build?.name || item.bestCharacter}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
