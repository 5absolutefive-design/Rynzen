import { useState } from "react";

type Link = { title: string; url: string };
type Folder = { name: string; icon: string; links: Link[] };

const DEFAULT_FOLDERS: Folder[] = [
  {
    name: "AI Tools", icon: "🤖",
    links: [
      { title: "ChatGPT", url: "chatgpt.com" },
      { title: "Claude", url: "claude.ai" },
      { title: "Gemini", url: "gemini.google.com" },
      { title: "Perplexity", url: "perplexity.ai" },
    ],
  },
  {
    name: "Coding", icon: "💻",
    links: [
      { title: "GitHub", url: "github.com" },
      { title: "Stack Overflow", url: "stackoverflow.com" },
      { title: "MDN Docs", url: "developer.mozilla.org" },
    ],
  },
  {
    name: "Videos", icon: "🎬",
    links: [
      { title: "YouTube", url: "youtube.com" },
      { title: "Vimeo", url: "vimeo.com" },
      { title: "Twitch", url: "twitch.tv" },
    ],
  },
  {
    name: "Shopping", icon: "🛍️",
    links: [
      { title: "Amazon", url: "amazon.com" },
      { title: "Daraz", url: "daraz.com.bd" },
    ],
  },
  {
    name: "News", icon: "📰",
    links: [
      { title: "BBC", url: "bbc.com" },
      { title: "Prothom Alo", url: "prothomalo.com" },
      { title: "Daily Star", url: "thedailystar.net" },
    ],
  },
];

const CARD_H = 44;
const CARD_GAP = 6;
const EMOJI_OPTIONS = ["📁","🤖","💻","🎬","🛍️","📰","🎮","🎵","📚","💡","🌍","❤️","⭐","🔥","🏠","💼"];

export function FolderCards() {
  const [folders, setFolders] = useState<Folder[]>(DEFAULT_FOLDERS);
  const [active, setActive] = useState<string | null>(null);

  // New folder form
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderIcon, setNewFolderIcon] = useState("📁");

  // New link form
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const activeIndex = folders.findIndex((f) => f.name === active);
  const activeFolder = activeIndex >= 0 ? folders[activeIndex] : null;

  // Panel top = center of active card (folders only, not the + card)
  const activeCenterY = activeIndex >= 0
    ? activeIndex * (CARD_H + CARD_GAP) + CARD_H / 2
    : 0;

  function addFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    setFolders((prev) => [...prev, { name, icon: newFolderIcon, links: [] }]);
    setNewFolderName("");
    setNewFolderIcon("📁");
    setShowAddFolder(false);
    setActive(name);
  }

  function addLink() {
    const title = newLinkTitle.trim();
    const url = newLinkUrl.trim();
    if (!title || !url || !active) return;
    setFolders((prev) =>
      prev.map((f) =>
        f.name === active ? { ...f, links: [...f.links, { title, url }] } : f
      )
    );
    setNewLinkTitle("");
    setNewLinkUrl("");
    setShowAddLink(false);
  }

  return (
    <div className="min-h-screen bg-[#f0efe9] relative font-sans select-none overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 flex flex-col items-center justify-start pt-14 pointer-events-none">
        <div className="text-[72px] font-thin text-[#222] tracking-tight leading-none mb-2">12:06</div>
        <div className="text-sm text-[#888] mb-10">Thursday, May 28</div>
        <div className="w-[520px] h-11 rounded-full bg-white/80 shadow-sm border border-gray-200/70 flex items-center px-4 gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-400/40" />
          <span className="text-[#bbb] text-sm">Search with Google...</span>
        </div>
        <div className="mt-8 flex gap-4">
          {["YT","FB","X","IG","G","W","WA","TK"].map((l) => (
            <div key={l} className="w-12 h-12 rounded-2xl bg-white/70 shadow-sm flex items-center justify-center text-xs font-semibold text-gray-400">{l}</div>
          ))}
        </div>
      </div>

      {/* Dismiss overlay */}
      {(active || showAddFolder) && (
        <div className="absolute inset-0 z-10" onClick={() => {
          setActive(null);
          setShowAddFolder(false);
          setShowAddLink(false);
        }} />
      )}

      {/* Floating widget */}
      <div className="absolute z-20" style={{ left: 20, top: "50%", transform: "translateY(-50%)" }}>

        {/* Folder column */}
        <div className="flex flex-col" style={{ gap: CARD_GAP }}>
          {folders.map((folder) => {
            const isActive = active === folder.name;
            return (
              <button
                key={folder.name}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddFolder(false);
                  setShowAddLink(false);
                  setActive(isActive ? null : folder.name);
                }}
                className="flex items-center gap-2 px-3 rounded-xl text-left"
                style={{
                  height: CARD_H,
                  width: 148,
                  transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s, background 0.15s",
                  background: isActive ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.80)",
                  backdropFilter: "blur(16px)",
                  boxShadow: isActive ? "0 4px 20px rgba(0,0,0,0.13)" : "0 1px 6px rgba(0,0,0,0.08)",
                  border: isActive ? "1.5px solid rgba(99,102,241,0.35)" : "1.5px solid rgba(255,255,255,0.6)",
                  transform: isActive ? "translateX(4px)" : "translateX(0)",
                }}
              >
                <span className="text-base leading-none">{folder.icon}</span>
                <span className="text-[12.5px] font-medium flex-1 truncate" style={{ color: isActive ? "#3730a3" : "#555" }}>
                  {folder.name}
                </span>
                <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  className="flex-shrink-0"
                  style={{ color: isActive ? "#6366f1" : "#ccc", transition: "transform 0.15s", transform: isActive ? "rotate(-90deg)" : "rotate(0deg)" }}>
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
            );
          })}

          {/* ── + New Folder card ── */}
          {!showAddFolder ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActive(null);
                setShowAddLink(false);
                setShowAddFolder(true);
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl"
              style={{
                height: CARD_H,
                width: 148,
                background: "rgba(255,255,255,0.50)",
                backdropFilter: "blur(12px)",
                border: "1.5px dashed rgba(99,102,241,0.35)",
                color: "#8b8ff0",
                transition: "background 0.15s",
              }}
            >
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M8 3v10M3 8h10"/>
              </svg>
              <span className="text-[12px] font-medium">New Folder</span>
            </button>
          ) : (
            /* Add folder inline form */
            <div
              onClick={(e) => e.stopPropagation()}
              className="rounded-xl overflow-hidden"
              style={{
                width: 148,
                background: "rgba(255,255,255,0.98)",
                border: "1.5px solid rgba(99,102,241,0.4)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              }}
            >
              {/* Emoji picker */}
              <div className="px-2 pt-2 pb-1 flex flex-wrap gap-1" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    onClick={() => setNewFolderIcon(em)}
                    className="text-sm rounded-md transition-all"
                    style={{
                      width: 24, height: 24,
                      background: newFolderIcon === em ? "rgba(99,102,241,0.15)" : "transparent",
                      border: newFolderIcon === em ? "1px solid rgba(99,102,241,0.4)" : "1px solid transparent",
                    }}
                  >
                    {em}
                  </button>
                ))}
              </div>
              <div className="px-2 py-2 flex flex-col gap-1.5">
                <input
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addFolder(); if (e.key === "Escape") setShowAddFolder(false); }}
                  placeholder="Folder name..."
                  className="w-full text-[11px] px-2 py-1.5 rounded-lg outline-none"
                  style={{ background: "#f5f5fa", color: "#333", border: "1px solid #e0e0f0" }}
                />
                <div className="flex gap-1">
                  <button
                    onClick={addFolder}
                    className="flex-1 text-[10px] font-semibold py-1 rounded-lg text-white"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddFolder(false)}
                    className="flex-1 text-[10px] font-medium py-1 rounded-lg"
                    style={{ background: "#f0f0f5", color: "#888" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Link panel — centered on active folder */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            left: 148 + 8,
            top: activeCenterY,
            transform: `translateY(-50%) ${activeFolder ? "scale(1) translateX(0)" : "scale(0.96) translateX(-8px)"}`,
            opacity: activeFolder ? 1 : 0,
            pointerEvents: activeFolder ? "auto" : "none",
            transition: "opacity 0.2s, transform 0.22s cubic-bezier(0.34,1.1,0.64,1), top 0.2s ease",
            width: 200,
            borderRadius: 16,
            overflow: "hidden",
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
            border: "1.5px solid rgba(255,255,255,0.7)",
          }}
        >
          {activeFolder && (
            <>
              {/* Links */}
              <div className="py-1.5">
                {activeFolder.links.length === 0 && (
                  <div className="text-center py-4 text-[11px] text-gray-400">No bookmarks yet</div>
                )}
                {activeFolder.links.map((link, i) => (
                  <div
                    key={link.title + i}
                    className="flex items-center gap-2.5 px-3.5 py-2 cursor-pointer group"
                    style={{ animation: "fadeSlideIn 0.16s ease both", animationDelay: `${i * 28}ms` }}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ background: `hsl(${(link.title.charCodeAt(0) * 37) % 360}, 55%, 60%)` }}
                    >
                      {link.title[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-gray-700 group-hover:text-indigo-600 truncate transition-colors">{link.title}</div>
                      <div className="text-[10px] text-gray-400 truncate">{link.url}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── + Add bookmark ── */}
              {!showAddLink ? (
                <button
                  onClick={() => setShowAddLink(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2"
                  style={{
                    borderTop: "1px solid rgba(0,0,0,0.06)",
                    color: "#8b8ff0",
                  }}
                >
                  <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M8 3v10M3 8h10"/>
                  </svg>
                  <span className="text-[11px] font-medium">Add bookmark</span>
                </button>
              ) : (
                <div
                  className="px-3 pb-2.5 pt-2"
                  style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    autoFocus
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    placeholder="Name..."
                    className="w-full text-[11px] px-2 py-1.5 rounded-lg mb-1.5 outline-none"
                    style={{ background: "#f5f5fa", color: "#333", border: "1px solid #e0e0f0" }}
                  />
                  <input
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addLink(); if (e.key === "Escape") setShowAddLink(false); }}
                    placeholder="https://..."
                    className="w-full text-[11px] px-2 py-1.5 rounded-lg mb-2 outline-none"
                    style={{ background: "#f5f5fa", color: "#333", border: "1px solid #e0e0f0" }}
                  />
                  <div className="flex gap-1.5">
                    <button
                      onClick={addLink}
                      className="flex-1 text-[10px] font-semibold py-1 rounded-lg text-white"
                      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddLink(false)}
                      className="flex-1 text-[10px] font-medium py-1 rounded-lg"
                      style={{ background: "#f0f0f5", color: "#888" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-5px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
