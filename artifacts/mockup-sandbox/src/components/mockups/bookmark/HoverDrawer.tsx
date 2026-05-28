import { useState } from "react";

const DATA = [
  { name: "AI Tools", icon: "🤖", items: ["ChatGPT", "Claude", "Gemini", "Perplexity"] },
  { name: "Coding", icon: "💻", items: ["GitHub", "Stack Overflow", "MDN Docs", "CodePen"] },
  { name: "Videos", icon: "🎬", items: ["YouTube", "Vimeo", "Twitch"] },
  { name: "Shopping", icon: "🛍️", items: ["Amazon", "Daraz", "Shajgoj"] },
  { name: "News", icon: "📰", items: ["BBC", "Prothom Alo", "Daily Star"] },
];

export function HoverDrawer() {
  const [hovered, setHovered] = useState(false);
  const [openFolder, setOpenFolder] = useState<string | null>("AI Tools");

  return (
    <div className="min-h-screen bg-[#f0efe9] flex relative overflow-hidden font-sans select-none">
      {/* Background — new tab page simulation */}
      <div className="flex-1 flex flex-col items-center justify-start pt-14 pointer-events-none">
        <div className="text-[72px] font-thin text-[#222] tracking-tight leading-none mb-2">12:00</div>
        <div className="text-sm text-[#888] mb-10">Thursday, May 28</div>
        <div className="w-[520px] h-11 rounded-full bg-white/80 shadow-sm border border-gray-200/70 flex items-center px-4 gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-400/40" />
          <span className="text-[#bbb] text-sm">Search with Google...</span>
        </div>
        <div className="mt-8 flex gap-4">
          {["YT","FB","X","IG","G"].map(l => (
            <div key={l} className="w-12 h-12 rounded-2xl bg-white/70 shadow-sm flex items-center justify-center text-xs font-semibold text-gray-400">{l}</div>
          ))}
        </div>
        <div className="mt-16 text-xs text-gray-400 italic">← Hover the left edge to reveal bookmarks</div>
      </div>

      {/* Hover trigger strip */}
      <div
        className="absolute left-0 top-0 h-full z-20"
        style={{ width: hovered ? 260 : 36 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Collapsed tab */}
        <div
          className="absolute left-0 top-0 h-full flex flex-col items-center justify-center gap-3"
          style={{
            width: 36,
            opacity: hovered ? 0 : 1,
            transition: "opacity 0.2s",
          }}
        >
          <div className="w-1 h-16 rounded-full bg-gray-300/80" />
          <div className="w-1 h-8 rounded-full bg-gray-200/80" />
          <div className="w-1 h-12 rounded-full bg-gray-300/80" />
        </div>

        {/* Drawer panel */}
        <div
          className="absolute left-0 top-0 h-full rounded-r-2xl overflow-hidden"
          style={{
            width: 260,
            transform: hovered ? "translateX(0)" : "translateX(-230px)",
            transition: "transform 0.28s cubic-bezier(0.34,1.2,0.64,1)",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            boxShadow: hovered ? "4px 0 32px rgba(0,0,0,0.12)" : "none",
          }}
        >
          {/* Header */}
          <div className="px-4 pt-5 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-base">🔖</span>
              <span className="font-semibold text-[13px] text-gray-700">Bookmarks</span>
            </div>
          </div>

          {/* Folder list */}
          <div className="py-2 overflow-y-auto" style={{ maxHeight: "calc(100% - 60px)" }}>
            {DATA.map((folder) => (
              <div key={folder.name}>
                <button
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                  onClick={() => setOpenFolder(openFolder === folder.name ? null : folder.name)}
                >
                  <span className="text-base">{folder.icon}</span>
                  <span className="text-[13px] text-gray-700 font-medium flex-1">{folder.name}</span>
                  <svg
                    viewBox="0 0 16 16" width="12" height="12" fill="currentColor"
                    className="text-gray-400 transition-transform duration-200"
                    style={{ transform: openFolder === folder.name ? "rotate(90deg)" : "rotate(0deg)" }}
                  >
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </button>
                <div
                  style={{
                    maxHeight: openFolder === folder.name ? `${folder.items.length * 36}px` : "0",
                    overflow: "hidden",
                    transition: "max-height 0.22s ease",
                  }}
                >
                  {folder.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 pl-10 pr-4 py-2 hover:bg-blue-50/60 cursor-pointer group"
                    >
                      <div className="w-4 h-4 rounded bg-gray-200/80 group-hover:bg-blue-200/60 transition-colors" />
                      <span className="text-[12px] text-gray-600 group-hover:text-blue-700 transition-colors">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
        Variant A — Hover to slide open
      </div>
    </div>
  );
}
