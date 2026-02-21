import { useState, useCallback, createContext, useContext } from 'react';
import './index.css';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Characters from './pages/Characters';
import CharacterDetail from './pages/CharacterDetail';
import Inventory from './pages/Inventory';

const AppContext = createContext(null);

export function useAppData() {
  return useContext(AppContext);
}

function App() {
  const [page, setPage] = useState('landing');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [appData, setAppData] = useState({
    playerInfo: null,
    characters: [],
    artifacts: [],
    source: null,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleDataLoaded = useCallback((data) => {
    setAppData(data);
    setPage('dashboard');
  }, []);

  const navigateTo = useCallback((p, charKey = null) => {
    setPage(p);
    if (charKey) setSelectedCharacter(charKey);
    setSidebarOpen(false);
  }, []);

  // Landing page (no sidebar)
  if (page === 'landing' || !appData.playerInfo) {
    return (
      <AppContext.Provider value={{ appData, setAppData, navigateTo, page }}>
        <Landing onDataLoaded={handleDataLoaded} />
      </AppContext.Provider>
    );
  }

  // Main app with sidebar
  return (
    <AppContext.Provider value={{ appData, setAppData, navigateTo, page }}>
      <div className="app-layout">
        {/* Mobile menu button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>

        {/* Sidebar */}
        <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="logo">
            <span className="logo-icon">⚔️</span>
            <div>
              <div className="logo-text">Artifact Manager</div>
              <div className="logo-sub">Genshin Impact</div>
            </div>
          </div>

          <nav className="nav-links">
            <button
              className={`nav-link ${page === 'dashboard' ? 'active' : ''}`}
              onClick={() => navigateTo('dashboard')}
            >
              <span className="nav-icon">📊</span>
              Dashboard
            </button>
            <button
              className={`nav-link ${page === 'characters' || page === 'character-detail' ? 'active' : ''}`}
              onClick={() => navigateTo('characters')}
            >
              <span className="nav-icon">👥</span>
              Characters
            </button>
            <button
              className={`nav-link ${page === 'inventory' ? 'active' : ''}`}
              onClick={() => navigateTo('inventory')}
            >
              <span className="nav-icon">🎯</span>
              Artifacts
            </button>
            <button
              className="nav-link"
              onClick={() => { setAppData({ playerInfo: null, characters: [], artifacts: [], source: null }); setPage('landing'); }}
            >
              <span className="nav-icon">🔄</span>
              New Import
            </button>
          </nav>

          {appData.playerInfo && (
            <div className="player-badge">
              <div className="player-name">{appData.playerInfo.nickname}</div>
              <div className="player-info">
                AR {appData.playerInfo.level} • WL {appData.playerInfo.worldLevel}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="app-main">
          {page === 'dashboard' && <Dashboard />}
          {page === 'characters' && <Characters />}
          {page === 'character-detail' && <CharacterDetail characterKey={selectedCharacter} />}
          {page === 'inventory' && <Inventory />}
        </main>
      </div>
    </AppContext.Provider>
  );
}

export default App;
