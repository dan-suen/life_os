import { useState } from "react";
import CommitmentsModule from "./modules/commitments";
import TvShowsModule from "./modules/tv_shows";

type ModuleId = "commitments" | "tv";

const MODULES: { id: ModuleId; label: string }[] = [
  { id: "commitments", label: "Commitments" },
  { id: "tv", label: "TV Shows" },
];

export default function App() {
  const [active, setActive] = useState<ModuleId>("commitments");
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav style={{ background: "#1a1a1a", padding: "0 32px", display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: "14px", marginRight: "16px", letterSpacing: "-0.02em" }}>Life OS</span>
        {MODULES.map(m => (
          <button key={m.id} onClick={() => setActive(m.id)} style={{
            padding: "12px 16px", background: "transparent", border: "none", cursor: "pointer",
            color: active === m.id ? "#fff" : "#888", fontWeight: active === m.id ? 600 : 400,
            fontSize: "13px", borderBottom: active === m.id ? "2px solid #fff" : "2px solid transparent",
            transition: "all 0.1s",
          }}>{m.label}</button>
        ))}
      </nav>
      {active === "commitments" ? <CommitmentsModule /> : <TvShowsModule />}
    </div>
  );
}
