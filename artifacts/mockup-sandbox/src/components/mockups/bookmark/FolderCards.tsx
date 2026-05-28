import { useState } from "react";

const FOLDERS = [
  {
    name: "AI Tools",
    icon: "🤖",
    links: [
      { title: "ChatGPT", url: "chatgpt.com" },
      { title: "Claude", url: "claude.ai" },
      { title: "Gemini", url: "gemini.google.com" },
      { title: "Perplexity", url: "perplexity.ai" },
    ],
  },
  {
    name: "Coding",
    icon: "💻",
    links: [
      { title: "GitHub", url: "github.com" },
      { title: "Stack Overflow", url: "stackoverflow.com" },
      { title: "MDN Docs", url: "developer.mozilla.org" },
    ],
  },
  {
    name: "Videos",
    icon: "🎬",
    links: [
      { title: "YouTube", url: "youtube.com" },
      { title: "Vimeo", url: "vimeo.com" },
      { title: "Twitch", url: "twitch.tv" },
    ],
  },
  {
    name: "Shopping",
    icon: "🛍️",
    links: [
      { title: "Amazon", url: "amazon.com" },
      { title: "Daraz", url: "daraz.com.bd" },
      { title: "Shajgoj", url: "shajgoj.com" },
    ],
  },
  {
    name: "News",
    icon: "📰",
    links: [
      { title: "BBC", url: "bbc.com" },
      { title: "Prothom Alo", url: "prothomalo.com" },
      { title: "Daily Star", url: "thedailystar.net" },
    ],
  },
];

export function FolderCards() {
  const [active, setActive] = useState<string | null>(null);

  const activeFolder = FOLDERS.find((f) => f.name === active);

  return (
    <div className="min-h-screen bg-[#f0efe9] relative font-sans select-none overflow-hidden">

      {/* ── New-tab background simulation ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-start pt-14 pointer-events-none">
        <div className="text-[72px] font-thin text-[#222] tracking-tight leading-none mb-2">
          12:06
        </div>
        <div className="text-sm text-[#888] mb-10">Thursday, May 28</div>
        <div className="w-[520px] h-11 rounded-full bg-white/80 shadow-sm border border-gray-200/70 flex items-center px-4 gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-400/40" />
          <span className="text-[#bbb] text-sm">Search with Google...</span>
        </div>
        <div className="mt-8 flex gap-4">
          {["YT", "FB", "X", "IG", "G", "W", "WA", "TK"].map((l) => (
            <div
              key={l}
              className="w-12 h-12 rounded-2xl bg-white/70 shadow-sm flex items-center justify-center text-xs font-semibold text-gray-400"
            >
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* ── Dismiss overlay (click outside to close) ── */}
      {active && (
        <div
          className="absolute inset-0 z-10"
          onClick={() => setActive(null)}
        />
      )}

      {/* ── Floating bookmark widget ── */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 z-20 flex items-start gap-1.5">

        {/* Folder card column */}
        <div className="flex flex-col gap-1.5">
          {FOLDERS.map((folder) => {
            const isActive = active === folder.name;
            return (
              <button
                key={folder.name}
                onClick={(e) => {
                  e.stopPropagation();
                  setActive(isActive ? null : folder.name);
                }}
                className="flex items-center gap-2 px-3 rounded-xl text-left transition-all duration-150"
                style={{
                  height: 44,
                  width: 148,
                  background: isActive
                    ? "rgba(255,255,255,0.98)"
                    : "rgba(255,255,255,0.80)",
                  backdropFilter: "blur(16px)",
                  boxShadow: isActive
                    ? "0 4px 20px rgba(0,0,0,0.14), 0 1px 0 rgba(255,255,255,0.7) inset"
                    : "0 1px 6px rgba(0,0,0,0.08)",
                  border: isActive
                    ? "1.5px solid rgba(99,102,241,0.3)"
                    : "1.5px solid rgba(255,255,255,0.6)",
                  transform: isActive ? "translateX(4px)" : "translateX(0)",
                }}
              >
                <span className="text-base leading-none">{folder.icon}</span>
                <span
                  className="text-[12.5px] font-medium leading-tight flex-1 truncate"
                  style={{ color: isActive ? "#3730a3" : "#555" }}
                >
                  {folder.name}
                </span>
                {/* Arrow indicator */}
                <svg
                  viewBox="0 0 16 16"
                  width="10"
                  height="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="flex-shrink-0 transition-transform duration-150"
                  style={{
                    color: isActive ? "#6366f1" : "#ccc",
                    transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
            );
          })}
        </div>

        {/* Link cards panel — appears to the right */}
        <div
          style={{
            width: activeFolder ? 200 : 0,
            opacity: activeFolder ? 1 : 0,
            transform: activeFolder ? "translateX(0) scale(1)" : "translateX(-12px) scale(0.97)",
            transition: "all 0.22s cubic-bezier(0.34,1.1,0.64,1)",
            overflow: "hidden",
            pointerEvents: activeFolder ? "auto" : "none",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {activeFolder && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.96)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 1px 0 rgba(255,255,255,0.8) inset",
                border: "1.5px solid rgba(255,255,255,0.7)",
              }}
            >
              {/* Panel header */}
              <div
                className="flex items-center gap-2 px-3.5 py-2.5"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
              >
                <span className="text-base">{activeFolder.icon}</span>
                <span className="text-[12px] font-semibold text-gray-700">
                  {activeFolder.name}
                </span>
                <span className="ml-auto text-[10px] text-gray-400">
                  {activeFolder.links.length}
                </span>
              </div>

              {/* Link list */}
              <div className="py-1.5">
                {activeFolder.links.map((link, i) => (
                  <div
                    key={link.title}
                    className="flex items-center gap-2.5 px-3.5 py-2 cursor-pointer group"
                    style={{
                      animation: `fadeSlideIn 0.18s ease both`,
                      animationDelay: `${i * 35}ms`,
                    }}
                  >
                    {/* Favicon placeholder */}
                    <div
                      className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white"
                      style={{
                        background: `hsl(${(link.title.charCodeAt(0) * 37) % 360}, 55%, 60%)`,
                      }}
                    >
                      {link.title[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-gray-700 group-hover:text-indigo-600 truncate transition-colors">
                        {link.title}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">{link.url}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Label */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
        Click a folder card → bookmarks appear to the right
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
