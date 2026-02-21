import { useState, useRef } from 'react';
import { fetchEnkaData } from '../api/enka';
import { parseGOODFormat, validateGOODFile } from '../api/parser';

export default function Landing({ onDataLoaded }) {
    const [uid, setUid] = useState('858178637');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragover, setDragover] = useState(false);
    const fileInputRef = useRef(null);

    const handleEnkaFetch = async () => {
        if (!uid || uid.length < 9) {
            setError('Please enter a valid 9-digit UID');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await fetchEnkaData(uid);
            if (!data.hasShowcase || data.characters.length === 0) {
                setError(
                    'Your Character Showcase appears to be empty or closed. ' +
                    'Please open it in-game (Character Screen → Edit Showcase) and add your characters.'
                );
                setLoading(false);
                return;
            }
            onDataLoaded({
                playerInfo: data.playerInfo,
                characters: data.characters,
                artifacts: data.artifacts,
                source: 'enka',
            });
        } catch (err) {
            setError(err.message || 'Failed to fetch data. Please try again.');
        }
        setLoading(false);
    };

    const handleFileUpload = (file) => {
        if (!file) return;
        setError(null);
        setLoading(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                const validation = validateGOODFile(json);

                if (!validation.valid) {
                    setError(validation.errors.join('. '));
                    setLoading(false);
                    return;
                }

                const parsed = parseGOODFormat(json);
                onDataLoaded({
                    playerInfo: {
                        nickname: parsed.source || 'Traveler',
                        level: '-',
                        worldLevel: '-',
                        achievements: '-',
                        spiralAbyss: '-',
                    },
                    characters: parsed.characters,
                    artifacts: parsed.artifacts,
                    source: 'good-json',
                });
            } catch (err) {
                setError('Failed to parse file. Make sure it\'s a valid GOOD format JSON file.');
            }
            setLoading(false);
        };
        reader.readAsText(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragover(false);
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.json')) {
            handleFileUpload(file);
        } else {
            setError('Please drop a .json file');
        }
    };

    return (
        <div className="landing-page">
            <div className="landing-hero animate-in">
                <h1>Artifact Manager</h1>
                <p>
                    Analyze, score, and optimize your Genshin Impact artifacts.
                    Find your best builds and know exactly what to keep or scrap.
                </p>
            </div>

            {error && (
                <div className="error-card animate-in" style={{ maxWidth: 600, marginBottom: 24 }}>
                    ⚠️ {error}
                </div>
            )}

            <div className="landing-inputs animate-in" style={{ animationDelay: '0.1s' }}>
                {/* Enka.Network Section */}
                <div className="input-section">
                    <h3>🌐 Fetch via UID</h3>
                    <p className="desc">
                        Enter your Genshin Impact UID to fetch your character showcase data from Enka.Network.
                    </p>
                    <div className="uid-input-group">
                        <input
                            type="text"
                            placeholder="Enter your UID..."
                            value={uid}
                            onChange={(e) => setUid(e.target.value.replace(/\D/g, ''))}
                            maxLength={10}
                            onKeyDown={(e) => e.key === 'Enter' && handleEnkaFetch()}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={handleEnkaFetch}
                            disabled={loading}
                        >
                            {loading ? '...' : 'Fetch'}
                        </button>
                    </div>
                </div>

                {/* JSON Upload Section */}
                <div className="input-section">
                    <h3>📁 Import JSON</h3>
                    <p className="desc">
                        Upload a GOOD format JSON file from Genshin Optimizer, Inventory Kamera, or similar tools.
                    </p>
                    <div
                        className={`file-drop-zone ${dragover ? 'dragover' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
                        onDragLeave={() => setDragover(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="drop-icon">📂</div>
                        <div className="drop-text">Drop GOOD JSON file here</div>
                        <div className="drop-hint">or click to browse</div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e.target.files[0])}
                    />
                </div>
            </div>

            <div style={{ marginTop: 32, color: 'var(--text-muted)', fontSize: 12 }}>
                Your data is processed locally — nothing is stored on any server.
            </div>
        </div>
    );
}
