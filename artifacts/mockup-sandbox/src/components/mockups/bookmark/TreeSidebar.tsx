import { useState } from "react";

const DATA = [
  { name: "AI Tools", icon: "🤖", items: ["ChatGPT", "Claude", "Gemini", "Perplexity"] },
  { name: "Coding", icon: "💻", items: ["GitHub", "Stack Overflow", "MDN Docs", "CodePen"] },
  { name: "Videos", icon: "🎬", items: ["YouTube", "Vimeo", "Twitch"] },
  { name: "Shopping", icon: "🛍️", items: ["Amazon", "Daraz", "Shajgoj"] },
  { name: "News", icon: "📰", items: ["BBC", "Prothom Alo", "Daily Star"] },
];

export function TreeSidebar() {
  const [open, setOpen] = useState<string[]>(["AI Tools", "Coding"]);

  const toggle = (name: string) =>
    setOpen((p) => p.includes(name) ? p.filter((n) => n !== name) : [...p, name]);

  return (
    <div className="min-h-screen bg-[#f0efe9] flex font-sans select-none">
      {/* Sidebar */}
      <div
        className="flex-shrink-0 flex flex-col"
        style={{
          width: 220,
          background: "rgba(30,30,46,0.96)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
          <span className="text-base">🔖</span>
          <span className="text-[13px] font-semibold text-white/90 tracking-wide">Bookmarks</span>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto py-2">
          {DATA.map((folder, fi) => {
            const isOpen = open.includes(folder.name);
            return (
              <div key={folder.name}>
                {/* Folder row */}
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 group hover:bg-white/8 transition-colors text-left"
                  onClick={() => toggle(folder.name)}
                  style={{ background: isOpen ? "rgba(255,255,255,0.06)" : undefined }}
                >
                  {/* Tree indent line indicator */}
                  <div className="flex items-center" style={{ width: 16 }}>
                    <svg
                      viewBox="0 0 16 16" width="10" height="10" fill="currentColor"
                      className="text-white/40 transition-transform duration-150 flex-shrink-0"
                      style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                    >
                      <path d="M5 3l6 5-6 5V3z"/>
                    </svg>
                  </div>
                  <span className="text-sm">{folder.icon}</span>
                  <span className="text-[12px] text-white/80 font-medium flex-1">{folder.name}</span>
                  <span className="text-[10px] text-white/30 mr-1">{folder.items.length}</span>
                </button>

                {/* Children with tree lines */}
                <div
                  style={{
                    maxHeight: isOpen ? `${folder.items.length * 32}px` : "0",
                    overflow: "hidden",
                    transition: "max-height 0.2s ease",
                  }}
                >
                  {folder.items.map((item, idx) => {
                    const isLast = idx === folder.items.length - 1;
                    return (
                      <div key={item} className="flex items-center hover:bg-white/6 cursor-pointer group py-1.5 pr-3" style={{ paddingLeft: 20 }}>
                        {/* Tree line */}
                        <div className="flex flex-col items-center mr-1" style={{ width: 16, alignSelf: "stretch" }}>
                          <div className="flex-1" style={{ width: 1, background: isLast ? "transparent" : "rgba(255,255,255,0.12)", marginLeft: 7 }} />
                          <div style={{ width: 1, background: "rgba(255,255,255,0.12)", height: "50%", marginLeft: 7, position: "relative" }}>
                            <div style={{ position: "absolute", top: "50%", left: 0, width: 8, height: 1, background: "rgba(255,255,255,0.12)" }} />
                          </div>
                          {!isLast && <div className="flex-1" style={{ width: 1, background: "rgba(255,255,255,0.12)", marginLeft: 7 }} />}
                        </div>
                        <div className="w-3.5 h-3.5 rounded-sm bg-white/10 group-hover:bg-blue-400/30 flex-shrink-0 mr-2 transition-colors" />
                        <span className="text-[11px] text-white/60 group-hover:text-white/90 transition-colors">{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-white/8">
          <div className="flex items-center gap-2 text-[11px] text-white/30">
            <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor"><path d="M10 3a7 7 0 100 14A7 7 0 0010 3zm1 10H9v-4h2v4zm0-6H9V5h2v2z"/></svg>
            Always visible sidebar
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-start pt-14">
        <div className="text-[72px] font-thin text-[#222] tracking-tight leading-none mb-2">12:00</div>
        <div className="text-sm text-[#888] mb-10">Thursday, May 28</div>
        <div className="w-[480px] h-11 rounded-full bg-white/80 shadow-sm border border-gray-200/70 flex items-center px-4 gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-400/40" />
          <span className="text-[#bbb] text-sm">Search with Google...</span>
        </div>
        <div className="mt-8 flex gap-4">
          {["YT","FB","X","IG","G"].map(l => (
            <div key={l} className="w-12 h-12 rounded-2xl bg-white/70 shadow-sm flex items-center justify-center text-xs font-semibold text-gray-400">{l}</div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
        Variant B — Dark tree sidebar, always visible
      </div>
    </div>
  );
}
