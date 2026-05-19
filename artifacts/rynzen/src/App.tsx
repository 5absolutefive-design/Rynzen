import { useState, useRef, useEffect } from "react";

interface SearchEngine {
  name: string;
  domain: string;
  color: string;
  searchUrl: string;
  homeUrl: string;
}

const engines: SearchEngine[] = [
  { name: "Google", domain: "google.com", color: "#4285F4", searchUrl: "https://www.google.com/search?q=", homeUrl: "https://www.google.com" },
  { name: "YouTube", domain: "youtube.com", color: "#FF0000", searchUrl: "https://www.youtube.com/results?search_query=", homeUrl: "https://www.youtube.com" },
  { name: "Facebook", domain: "facebook.com", color: "#1877F2", searchUrl: "https://www.facebook.com/search/top?q=", homeUrl: "https://www.facebook.com" },
  { name: "Twitter / X", domain: "x.com", color: "#000000", searchUrl: "https://twitter.com/search?q=", homeUrl: "https://twitter.com" },
  { name: "Wikipedia", domain: "wikipedia.org", color: "#636466", searchUrl: "https://en.wikipedia.org/w/index.php?search=", homeUrl: "https://www.wikipedia.org" },
  { name: "Bing", domain: "bing.com", color: "#008272", searchUrl: "https://www.bing.com/search?q=", homeUrl: "https://www.bing.com" },
  { name: "Instagram", domain: "instagram.com", color: "#E1306C", searchUrl: "https://www.instagram.com/explore/tags/", homeUrl: "https://www.instagram.com" },
  { name: "Amazon", domain: "amazon.com", color: "#FF9900", searchUrl: "https://www.amazon.com/s?k=", homeUrl: "https://www.amazon.com" },
];

const initialShortcuts = [
  { name: "YouTube", url: "https://www.youtube.com", domain: "youtube.com" },
  { name: "Facebook", url: "https://www.facebook.com", domain: "facebook.com" },
  { name: "Twitter", url: "https://twitter.com", domain: "x.com" },
  { name: "Instagram", url: "https://www.instagram.com", domain: "instagram.com" },
  { name: "Gmail", url: "https://mail.google.com", domain: "gmail.com" },
  { name: "Wikipedia", url: "https://www.wikipedia.org", domain: "wikipedia.org" },
  { name: "WhatsApp", url: "https://web.whatsapp.com", domain: "whatsapp.com" },
  { name: "TikTok", url: "https://www.tiktok.com", domain: "tiktok.com" },
];

const bgPresets = [
  { label: "Default", value: "#f5f4f0" },
  { label: "Dark", value: "#1a1a2e" },
  { label: "Midnight", value: "#0d1117" },
  { label: "Ocean", value: "#0a192f" },
  { label: "Forest", value: "#1b2f1b" },
  { label: "Lavender", value: "#e8e4f0" },
  { label: "Warm", value: "#fdf6ec" },
  { label: "Rose", value: "#2d1b1b" },
];

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(engines[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [now, setNow] = useState(new Date());
  const [shortcuts, setShortcuts] = useState(initialShortcuts);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Settings state
  const [darkMode, setDarkMode] = useState(false);
  const [bgColor, setBgColor] = useState("#f5f4f0");
  const [showClock, setShowClock] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [engineColorEffect, setEngineColorEffect] = useState(true);
  const [clockSize, setClockSize] = useState<"small" | "medium" | "large">("large");
  const [footerText, setFooterText] = useState("SearchHub — Search anywhere, all in one place");

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Apply dark mode & bg color to body
  useEffect(() => {
    document.body.style.background = darkMode ? "#1a1a2e" : bgColor;
    document.body.style.color = darkMode ? "#e8e8f0" : "#1a1a2e";
  }, [darkMode, bgColor]);

  const suggestions = query.length > 0
    ? [`${query}`, `${query} meaning`, `${query} in Bengali`, `${query} tutorial`, `${query} 2024`]
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        const fab = document.getElementById("settings-fab");
        if (fab && fab.contains(e.target as Node)) return;
        setShowSettings(false);
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
    if (e.key === "Enter") handleSearch();
    else if (e.key === "Escape") setShowSuggestions(false);
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverIndex(index);
  }

  function handleDrop(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) { setDragIndex(null); setOverIndex(null); return; }
    const updated = [...shortcuts];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setShortcuts(updated);
    setDragIndex(null);
    setOverIndex(null);
  }

  function handleDragEnd() { setDragIndex(null); setOverIndex(null); }

  const isDark = darkMode;
  const clockFontSize = clockSize === "small" ? "42px" : clockSize === "medium" ? "58px" : "72px";

  return (
    <div className="app-root" style={{ background: isDark ? "#1a1a2e" : bgColor, color: isDark ? "#e8e8f0" : "#1a1a2e" }}>
      <div className="top-bar">
        <span className="top-link" style={{ color: isDark ? "#aab" : "#444" }}>Gmail</span>
        <span className="top-link" style={{ color: isDark ? "#aab" : "#444" }}>Images</span>
        <div className="avatar">S</div>
      </div>

      <main className="main-content">
        {showClock && (
          <div className="clock-area">
            <div className="clock-time" style={{ fontSize: clockFontSize, color: isDark ? "#e8e8f0" : "#1a1a2e" }}>
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div className="clock-date" style={{ color: isDark ? "#8899aa" : "#666" }}>
              {now.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        )}

        <div className="search-section">
          <div className="search-bar-row" ref={dropdownRef}>
            <div
              className="search-input-box"
              style={{
                borderColor: engineColorEffect ? selectedEngine.color : (isDark ? "#3a3a5c" : "#dde0e8"),
                boxShadow: engineColorEffect
                  ? `0 0 0 3px ${selectedEngine.color}22, 0 2px 8px rgba(0,0,0,0.07)`
                  : `0 2px 8px rgba(0,0,0,0.07)`,
                background: isDark ? "#252540" : "#ffffff",
              }}
            >
              <div className="engine-pill" onClick={() => setShowDropdown(!showDropdown)} title={selectedEngine.name}>
                <img
                  src={`https://www.google.com/s2/favicons?domain=${selectedEngine.domain}&sz=64`}
                  alt={selectedEngine.name}
                  className="engine-pill-favicon"
                />
              </div>
              <span className="engine-divider" style={{ background: isDark ? "#3a3a5c" : "#dde0e8" }} />
              <input
                ref={inputRef}
                type="text"
                className="search-input"
                placeholder={`Search with ${selectedEngine.name}...`}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(e.target.value.length > 0); }}
                onFocus={() => setShowSuggestions(query.length > 0)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                style={{ color: isDark ? "#e8e8f0" : "#1a1a2e" }}
              />

              <div className="input-right-actions">
                {query && (
                  <>
                    <button className="input-icon-btn" onClick={() => { setQuery(""); setShowSuggestions(false); inputRef.current?.focus(); }} title="Clear">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                    <span className="input-divider" />
                  </>
                )}
                <button className="input-icon-btn" title="Voice Search" onClick={() => alert("Voice search coming soon!")}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </button>
                <button className="input-icon-btn" title="Image Search" onClick={() => window.open("https://lens.google.com", "_blank")}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM22 7h-2V4h-3V2h5v5zm0 15v-5h-2v3h-3v2h5zM2 22h5v-2H4v-3H2v5zM2 2v5h2V4h3V2H2z"/>
                  </svg>
                </button>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown" style={{ background: isDark ? "rgba(30,30,50,0.92)" : "rgba(255,255,255,0.18)" }}>
                  {suggestions.map((s) => (
                    <div key={s} className="suggestion-item" style={{ color: isDark ? "#e8e8f0" : "#1a1a2e" }} onClick={() => { setQuery(s); handleSearch(s); }}>
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
              <div className="engine-dropdown" style={{ background: isDark ? "#252540" : "#ffffff", borderColor: isDark ? "#3a3a5c" : "#dde0e8" }}>
                <p className="dropdown-label">Search with:</p>
                {engines.map((engine) => (
                  <div
                    key={engine.name}
                    className={`dropdown-item ${selectedEngine.name === engine.name ? "active" : ""}`}
                    style={{ color: isDark ? "#e8e8f0" : "#1a1a2e" }}
                    onClick={() => { setSelectedEngine(engine); setShowDropdown(false); inputRef.current?.focus(); }}
                  >
                    <img src={`https://www.google.com/s2/favicons?domain=${engine.domain}&sz=32`} alt={engine.name} className="dropdown-favicon" />
                    <span>{engine.name}</span>
                    {selectedEngine.name === engine.name && <span className="check">✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showShortcuts && (
          <div className="shortcuts-section">
            <h3 className="shortcuts-title" style={{ color: isDark ? "#667799" : "#9aa0b2" }}>Quick Access</h3>
            <div className="shortcuts-grid">
              {shortcuts.map((s, index) => (
                <a
                  key={s.name}
                  href={dragIndex !== null ? undefined : s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`shortcut-card${dragIndex === index ? " dragging" : ""}${overIndex === index && dragIndex !== index ? " drag-over" : ""}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => { if (dragIndex !== null) e.preventDefault(); }}
                  style={{ cursor: dragIndex !== null ? "grabbing" : "grab" }}
                >
                  <img src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=64`} alt={s.name} className="shortcut-favicon" title={s.name} />
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="footer" style={{ color: isDark ? "#556677" : "#aaa", borderTopColor: isDark ? "#2a2a44" : "#e8e8e4" }}>
        <span>{footerText}</span>
      </footer>

      {/* Settings FAB */}
      <button
        id="settings-fab"
        className="settings-fab"
        onClick={() => setShowSettings(!showSettings)}
        title="Customize"
        style={{ background: isDark ? "#252540" : "#fff", boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.15)" }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style={{ color: isDark ? "#aab" : "#555" }}>
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
      </button>

      {/* Settings Sidebar Overlay */}
      {showSettings && <div className="settings-overlay" onClick={() => setShowSettings(false)} />}

      {/* Settings Sidebar */}
      <div
        ref={settingsRef}
        className={`settings-sidebar${showSettings ? " open" : ""}`}
        style={{ background: isDark ? "#1e1e38" : "#ffffff", color: isDark ? "#e8e8f0" : "#1a1a2e" }}
      >
        <div className="settings-header">
          <span className="settings-title">Customize</span>
          <button className="settings-close" onClick={() => setShowSettings(false)} style={{ color: isDark ? "#aab" : "#666" }}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="settings-body">

          {/* General */}
          <div className="settings-group-label">General</div>

          <div className="settings-row">
            <span className="settings-row-label">Dark Mode</span>
            <button className={`toggle${darkMode ? " on" : ""}`} onClick={() => setDarkMode(!darkMode)} />
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Show Clock</span>
            <button className={`toggle${showClock ? " on" : ""}`} onClick={() => setShowClock(!showClock)} />
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Show Quick Access</span>
            <button className={`toggle${showShortcuts ? " on" : ""}`} onClick={() => setShowShortcuts(!showShortcuts)} />
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Engine Color Effect</span>
            <button className={`toggle${engineColorEffect ? " on" : ""}`} onClick={() => setEngineColorEffect(!engineColorEffect)} />
          </div>

          {/* Clock Size */}
          <div className="settings-group-label" style={{ marginTop: 20 }}>Clock Size</div>
          <div className="settings-option-row">
            {(["small", "medium", "large"] as const).map((size) => (
              <button
                key={size}
                className={`option-chip${clockSize === size ? " selected" : ""}`}
                onClick={() => setClockSize(size)}
                style={{
                  background: clockSize === size ? selectedEngine.color : (isDark ? "#2a2a48" : "#f0f0f5"),
                  color: clockSize === size ? "#fff" : (isDark ? "#aab" : "#555"),
                }}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>

          {/* Background */}
          <div className="settings-group-label" style={{ marginTop: 20 }}>Background Color</div>
          <div className="bg-presets">
            {bgPresets.map((p) => (
              <button
                key={p.value}
                className={`bg-swatch${bgColor === p.value && !darkMode ? " selected" : ""}`}
                style={{ background: p.value, borderColor: bgColor === p.value && !darkMode ? selectedEngine.color : "transparent" }}
                title={p.label}
                onClick={() => { setBgColor(p.value); if (p.value === "#1a1a2e" || p.value === "#0d1117" || p.value === "#0a192f" || p.value === "#1b2f1b" || p.value === "#2d1b1b") { setDarkMode(true); } else { setDarkMode(false); } }}
              />
            ))}
          </div>
          <div className="settings-row" style={{ marginTop: 8 }}>
            <span className="settings-row-label">Custom color</span>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => { setBgColor(e.target.value); setDarkMode(false); }}
              className="color-picker-input"
              title="Pick background color"
            />
          </div>

          {/* Footer Text */}
          <div className="settings-group-label" style={{ marginTop: 20 }}>Footer Text</div>
          <input
            type="text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            className="settings-text-input"
            style={{ background: isDark ? "#2a2a48" : "#f5f5f8", color: isDark ? "#e8e8f0" : "#1a1a2e", borderColor: isDark ? "#3a3a5c" : "#dde0e8" }}
            placeholder="Footer text..."
          />

          {/* Reset */}
          <button
            className="settings-reset-btn"
            onClick={() => { setDarkMode(false); setBgColor("#f5f4f0"); setShowClock(true); setShowShortcuts(true); setEngineColorEffect(true); setClockSize("large"); setFooterText("SearchHub — Search anywhere, all in one place"); }}
            style={{ borderColor: isDark ? "#3a3a5c" : "#dde0e8", color: isDark ? "#aab" : "#666" }}
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}
