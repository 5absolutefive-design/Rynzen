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
  const [now, setNow] = useState(new Date());
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
        <div className="clock-area">
          <div className="clock-time">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div className="clock-date">
            {now.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        <div className="search-section">
          <div className="search-bar-row" ref={dropdownRef}>
            <div
              className="engine-pill"
              onClick={() => setShowDropdown(!showDropdown)}
              title={selectedEngine.name}
              style={{ "--engine-color": selectedEngine.color } as React.CSSProperties}
            >
              <span className="engine-pill-icon" style={{ color: selectedEngine.color }}>
                {selectedEngine.icon}
              </span>
            </div>

            <div className="search-input-box">
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

              <div className="input-right-actions">
                {query && (
                  <>
                    <button
                      className="input-icon-btn"
                      onClick={() => {
                        setQuery("");
                        setShowSuggestions(false);
                        inputRef.current?.focus();
                      }}
                      title="Clear"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                    <span className="input-divider" />
                  </>
                )}
                <button
                  className="input-icon-btn"
                  title="Voice Search"
                  onClick={() => alert("Voice search coming soon!")}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </button>
                <button
                  className="input-icon-btn"
                  title="Image Search"
                  onClick={() => window.open("https://lens.google.com", "_blank")}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM22 7h-2V4h-3V2h5v5zm0 15v-5h-2v3h-3v2h5zM2 22h5v-2H4v-3H2v5zM2 2v5h2V4h3V2H2z"/>
                  </svg>
                </button>
              </div>

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
                      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style={{ opacity: 0.4, flexShrink: 0 }}>
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                      </svg>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
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
