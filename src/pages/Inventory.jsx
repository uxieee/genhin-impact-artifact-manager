import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppData } from '../App';
import { adviseArtifact, getRecommendationDisplay } from '../engine/advisor';
import { getAllBuilds } from '../engine/builds';
import { parseArtifactScreenshot } from '../engine/ocr';
import { generateId } from '../utils/helpers';
import { ARTIFACT_SLOT_NAMES } from '../utils/constants';
import { formatSetName, formatStat, getStatLabel } from '../utils/helpers';

export default function Inventory() {
    const { appData, setAppData } = useAppData();
    const { artifacts, characters } = appData;
    const builds = getAllBuilds();
    const characterKeys = characters.map(c => c.key).filter(k => builds[k]);

    const [filter, setFilter] = useState('all'); // all, best-in-slot, keep, potential, fodder
    const [slotFilter, setSlotFilter] = useState('all');
    const [sortBy, setSortBy] = useState('score'); // score, level, set
    const [searchQuery, setSearchQuery] = useState('');

    // OCR State
    const [isDragging, setIsDragging] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState(null);

    // Handle File Drop/Paste for OCR
    const processImageFile = async (file) => {
        if (!file || !file.type.startsWith('image/')) {
            setScanError('Please drop a valid image file.');
            return;
        }

        setIsScanning(true);
        setScanError(null);
        try {
            const parsedData = await parseArtifactScreenshot(file);
            console.log("OCR Extracted Data:", parsedData);

            // Add a unique ID and save to global state
            const newArtifact = {
                ...parsedData,
                id: generateId(),
                rarity: 5,
                location: ''
            };

            setAppData(prev => ({
                ...prev,
                artifacts: [newArtifact, ...prev.artifacts]
            }));

            // Auto-clear filter to see new item
            setFilter('all');
            setSortBy('level');
        } catch (e) {
            console.error(e);
            setScanError('Failed to read artifact. Ensure it is a clear 16:9 screenshot.');
        } finally {
            setIsScanning(false);
        }
    };

    // Drag events
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processImageFile(e.dataTransfer.files[0]);
        }
    }, []);

    // Global Paste Listener
    useEffect(() => {
        const handlePaste = (e) => {
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            for (let index in items) {
                const item = items[index];
                if (item.kind === 'file') {
                    const blob = item.getAsFile();
                    processImageFile(blob);
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, []);

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
        <div
            className="animate-in"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ minHeight: '80vh', position: 'relative' }}
        >
            {/* Drag Overlay */}
            {isDragging && (
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(76, 194, 241, 0.1)',
                    border: '3px dashed var(--accent)',
                    borderRadius: 16, zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                }}>
                    <h2 style={{ color: 'var(--accent)' }}>Drop Artifact Screenshot Here</h2>
                </div>
            )}

            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>Artifact Inventory</h1>
                    <p>{artifacts.length} artifacts loaded • {counts.fodder} can be scrapped</p>
                </div>

                {/* Scanner Status Box */}
                <div style={{
                    background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 12,
                    border: '1px solid var(--border-subtle)', maxWidth: 350, fontSize: 13
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 18 }}>📸</span>
                        <strong>In-Browser Scanner Active</strong>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                        Take a screenshot of an artifact in-game, then press <code>Ctrl+V</code> anywhere on this page to scan it instantly.
                    </p>
                    {isScanning && <div style={{ color: 'var(--accent)', marginTop: 8, fontWeight: 500 }}>Scanning image with Tesseract AI...</div>}
                    {scanError && <div style={{ color: '#EF4444', marginTop: 8 }}>{scanError}</div>}
                </div>
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
