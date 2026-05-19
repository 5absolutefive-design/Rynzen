import { useState, useRef, useEffect } from "react";

interface SearchEngine {
  name: string;
  icon: string;
  color: string;
  searchUrl: string;
  homeUrl: string;
}

const engines: SearchEngine[] = [
  {
    name: "Google",
    icon: "G",
    color: "#4285F4",
    searchUrl: "https://www.google.com/search?q=",
    homeUrl: "https://www.google.com",
  },
  {
    name: "YouTube",
    icon: "▶",
    color: "#FF0000",
    searchUrl: "https://www.youtube.com/results?search_query=",
    homeUrl: "https://www.youtube.com",
  },
  {
    name: "Facebook",
    icon: "f",
    color: "#1877F2",
    searchUrl: "https://www.facebook.com/search/top?q=",
    homeUrl: "https://www.facebook.com",
  },
  {
    name: "Twitter",
    icon: "𝕏",
    color: "#000000",
    searchUrl: "https://twitter.com/search?q=",
    homeUrl: "https://twitter.com",
  },
  {
    name: "Wikipedia",
    icon: "W",
    color: "#636466",
    searchUrl: "https://en.wikipedia.org/w/index.php?search=",
    homeUrl: "https://www.wikipedia.org",
  },
  {
    name: "Bing",
    icon: "B",
    color: "#008272",
    searchUrl: "https://www.bing.com/search?q=",
    homeUrl: "https://www.bing.com",
  },
  {
    name: "Instagram",
    icon: "📷",
    color: "#E1306C",
    searchUrl: "https://www.instagram.com/explore/tags/",
    homeUrl: "https://www.instagram.com",
  },
  {
    name: "Amazon",
    icon: "a",
    color: "#FF9900",
    searchUrl: "https://www.amazon.com/s?k=",
    homeUrl: "https://www.amazon.com",
  },
];

const shortcuts = [
  { name: "YouTube", url: "https://www.youtube.com", icon: "▶", color: "#FF0000" },
  { name: "Facebook", url: "https://www.facebook.com", icon: "f", color: "#1877F2" },
  { name: "Twitter", url: "https://twitter.com", icon: "𝕏", color: "#000000" },
  { name: "Instagram", url: "https://www.instagram.com", icon: "📷", color: "#E1306C" },
  { name: "Gmail", url: "https://mail.google.com", icon: "✉", color: "#D44638" },
  { name: "Wikipedia", url: "https://www.wikipedia.org", icon: "W", color: "#636466" },
];

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(engines[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const suggestions = query.length > 0
    ? [
        `${query}`,
        `${query} meaning`,
        `${query} in Bengali`,
        `${query} tutorial`,
        `${query} 2024`,
      ]
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(q: string = query) {
    if (!q.trim()) return;
    const url = selectedEngine.searchUrl + encodeURIComponent(q.trim());
    window.open(url, "_blank");
    setShowSuggestions(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  return (
    <div className="app-root">
      <div className="top-bar">
        <span className="top-link">Gmail</span>
        <span className="top-link">Images</span>
        <div className="avatar">S</div>
      </div>

      <main className="main-content">
        <div className="logo-area">
          <span className="logo-blue">S</span>
          <span className="logo-red">e</span>
          <span className="logo-yellow">a</span>
          <span className="logo-blue">r</span>
          <span className="logo-green">c</span>
          <span className="logo-red">h</span>
          <span className="logo-yellow">H</span>
          <span className="logo-blue">u</span>
          <span className="logo-green">b</span>
        </div>

        <div className="search-section">
          <div className="search-bar-wrapper" ref={dropdownRef}>
            <div className="engine-selector" onClick={() => setShowDropdown(!showDropdown)} title={selectedEngine.name}>
              <span className="engine-icon" style={{ color: selectedEngine.color }}>
                {selectedEngine.icon}
              </span>
              <span className="chevron">▾</span>
            </div>

            <div className="search-input-area">
              <input
                ref={inputRef}
                type="text"
                className="search-input"
                placeholder={`Search with ${selectedEngine.name}...`}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggestions(query.length > 0)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              {query && (
                <button
                  className="clear-btn"
                  onClick={() => {
                    setQuery("");
                    setShowSuggestions(false);
                    inputRef.current?.focus();
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="search-actions">
              <button className="action-icon-btn" title="Voice Search" onClick={() => alert("Voice search coming soon!")}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>
              <button className="action-icon-btn" title="Image Search" onClick={() => window.open("https://images.google.com", "_blank")}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5.04 15.96L10 15l-4 5H5.12l4.96-6.22 3.96 4.96 2.1-2.63 3.86 4.85h-1.5l-3.54-4z"/>
                  <circle cx="8" cy="8" r="2"/>
                </svg>
              </button>
              <button
                className="search-go-btn"
                onClick={() => handleSearch()}
                style={{ background: selectedEngine.color }}
                title={`Search on ${selectedEngine.name}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </button>
            </div>

            {showDropdown && (
              <div className="engine-dropdown">
                <p className="dropdown-label">Search with:</p>
                {engines.map((engine) => (
                  <div
                    key={engine.name}
                    className={`dropdown-item ${selectedEngine.name === engine.name ? "active" : ""}`}
                    onClick={() => {
                      setSelectedEngine(engine);
                      setShowDropdown(false);
                      inputRef.current?.focus();
                    }}
                  >
                    <span className="dropdown-icon" style={{ color: engine.color }}>
                      {engine.icon}
                    </span>
                    <span>{engine.name}</span>
                    {selectedEngine.name === engine.name && <span className="check">✓</span>}
                  </div>
                ))}
              </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((s) => (
                  <div
                    key={s}
                    className="suggestion-item"
                    onClick={() => {
                      setQuery(s);
                      handleSearch(s);
                    }}
                  >
                    <span className="suggestion-icon">🔍</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        <div className="shortcuts-section">
          <h3 className="shortcuts-title">Quick Access</h3>
          <div className="shortcuts-grid">
            {shortcuts.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shortcut-card"
              >
                <div className="shortcut-icon-bg" style={{ background: s.color + "22" }}>
                  <span className="shortcut-icon" style={{ color: s.color }}>{s.icon}</span>
                </div>
                <span className="shortcut-name">{s.name}</span>
              </a>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer">
        <span>SearchHub — Search anywhere, all in one place</span>
      </footer>
    </div>
  );
}
