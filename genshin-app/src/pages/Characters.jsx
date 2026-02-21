import { useAppData } from '../App';
import { getAllBuilds } from '../engine/builds';
import { scoreArtifact } from '../engine/scorer';
import { getCharacterIconUrl } from '../api/genshinDev';
import { ELEMENT_COLORS } from '../utils/constants';

export default function Characters() {
    const { appData, navigateTo } = useAppData();
    const { characters } = appData;
    const builds = getAllBuilds();

    // Calculate build completion for each character
    const characterData = characters.map(char => {
        const build = builds[char.key];
        const equipped = char.equippedArtifacts || [];

        let avgScore = 0;
        if (build && equipped.length > 0) {
            const scores = equipped.map(a => scoreArtifact(a, char.key));
            avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
        }

        return { ...char, build, avgScore, equippedCount: equipped.length };
    });

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1>Characters</h1>
                <p>{characters.length} characters loaded</p>
            </div>

            {characters.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>No Characters Found</h3>
                    <p>Your showcase may be empty. Try adding characters to your in-game showcase, or import a GOOD JSON file.</p>
                </div>
            ) : (
                <div className="character-grid">
                    {characterData.map(char => {
                        const element = char.build?.element || 'Anemo';
                        const elementColor = ELEMENT_COLORS[element] || '#fff';

                        return (
                            <div
                                key={char.key}
                                className="character-card"
                                onClick={() => navigateTo('character-detail', char.key)}
                                style={{ '--element-color': elementColor }}
                            >
                                <img
                                    src={getCharacterIconUrl(char.key)}
                                    alt={char.build?.name || char.key}
                                    className="char-image"
                                    onError={(e) => {
                                        e.target.src = '';
                                        e.target.style.background = `linear-gradient(135deg, ${elementColor}22, ${elementColor}08)`;
                                    }}
                                />
                                <div className="char-info">
                                    <div className="char-name">{char.build?.name || char.key}</div>
                                    <div className="char-meta">
                                        <span className="char-level">Lv. {char.level} • C{char.constellation}</span>
                                        <span className={`element-badge ${element}`}>
                                            {element}
                                        </span>
                                    </div>
                                    {char.equippedCount > 0 && (
                                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{
                                                flex: 1,
                                                height: 4,
                                                borderRadius: 2,
                                                background: 'rgba(20, 25, 45, 0.6)',
                                                overflow: 'hidden',
                                            }}>
                                                <div style={{
                                                    width: `${char.avgScore}%`,
                                                    height: '100%',
                                                    borderRadius: 2,
                                                    background: `linear-gradient(90deg, ${elementColor}, ${elementColor}88)`,
                                                    transition: 'width 0.5s ease',
                                                }} />
                                            </div>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 28 }}>
                                                {Math.round(char.avgScore)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
