import { useState } from "react";

const DATA = [
  { name: "AI", icon: "🤖", color: "#a78bfa", items: ["ChatGPT", "Claude", "Gemini", "Perplexity"] },
  { name: "Code", icon: "💻", color: "#60a5fa", items: ["GitHub", "Stack Overflow", "MDN Docs"] },
  { name: "Video", icon: "🎬", color: "#f87171", items: ["YouTube", "Vimeo", "Twitch"] },
  { name: "Shop", icon: "🛍️", color: "#34d399", items: ["Amazon", "Daraz", "Shajgoj"] },
  { name: "News", icon: "📰", color: "#fbbf24", items: ["BBC", "Prothom Alo"] },
];

export function FloatingPanel() {
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("AI");

  const active = DATA.find((d) => d.name === activeTab) ?? DATA[0];

  return (
    <div className="min-h-screen bg-[#f0efe9] flex relative font-sans select-none">
      {/* Background */}
      <div className="flex-1 flex flex-col items-center justify-start pt-14">
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
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setVisible((v) => !v)}
        className="absolute top-5 left-5 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 z-30"
        style={{
          background: visible ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.7)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
        }}
      >
        <span className="text-base">🔖</span>
      </button>

      {/* Floating Panel */}
      <div
        className="absolute left-5 top-16 z-20 rounded-2xl overflow-hidden"
        style={{
          width: 240,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0) scale(1)" : "translateX(-20px) scale(0.95)",
          transition: "all 0.25s cubic-bezier(0.34,1.1,0.64,1)",
          pointerEvents: visible ? "auto" : "none",
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.14), 0 1px 0 rgba(255,255,255,0.6) inset",
          border: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        {/* Tab bar */}
        <div className="flex items-center gap-1 px-2.5 pt-2.5 pb-2 overflow-x-auto"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          {DATA.map((d) => (
            <button
              key={d.name}
              onClick={() => setActiveTab(d.name)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 whitespace-nowrap flex-shrink-0"
              style={{
                background: activeTab === d.name ? d.color + "22" : "transparent",
                color: activeTab === d.name ? d.color : "#999",
                border: activeTab === d.name ? `1.5px solid ${d.color}44` : "1.5px solid transparent",
              }}
            >
              <span>{d.icon}</span>
              {d.name}
            </button>
          ))}
        </div>

        {/* Bookmark list */}
        <div className="py-1.5">
          {active.items.map((item, i) => (
            <div
              key={item}
              className="flex items-center gap-2.5 px-3.5 py-2 cursor-pointer group"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div
                className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: active.color + "cc" }}
              >
                {item[0]}
              </div>
              <span
                className="text-[12px] font-medium group-hover:opacity-100 transition-opacity"
                style={{ color: "#444", opacity: 0.8 }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-3.5 pb-3 pt-1 flex items-center gap-1.5" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          <div className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center">
            <svg viewBox="0 0 16 16" width="9" height="9" fill="currentColor" className="text-gray-400"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <span className="text-[10px] text-gray-400">Add bookmark</span>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
        Variant C — Floating panel with category tabs
      </div>
    </div>
  );
}
