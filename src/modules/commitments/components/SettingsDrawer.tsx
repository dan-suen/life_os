import type { Settings } from "../types";
import { AREAS, ENERGIES } from "../types";
import { s } from "../styles";

interface Props {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onClose: () => void;
}

export function SettingsDrawer({ settings, onChange, onClose }: Props) {
  return (
    <div style={s.settingsOverlay} onClick={onClose}>
      <div style={s.settingsDrawer} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <span style={{ fontSize: "16px", fontWeight: 700 }}>Settings</span>
          <button style={s.iconBtn} onClick={onClose}>✕</button>
        </div>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ ...s.label, fontSize: "13px", color: "#1a1a1a", marginBottom: "12px" }}>Current Energy Level</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {ENERGIES.map(e => (
              <button key={e} onClick={() => onChange({ ...settings, currentEnergy: e })}
                style={s.btn(settings.currentEnergy === e ? "#fff" : "#555", settings.currentEnergy === e ? "#2253c7" : "#f5f5f5", settings.currentEnergy === e ? "#2253c7" : "#e0e0e0")}>
                {e}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ ...s.label, fontSize: "13px", color: "#1a1a1a", marginBottom: "12px" }}>
            Priority Weights <span style={{ color: "#aaa", fontWeight: 400 }}>(must sum to 1)</span>
          </div>
          {(["impact", "effort", "urgency"] as const).map(key => (
            <div key={key} style={s.formGroup}>
              <label style={s.label}>{key}</label>
              <input type="number" step="0.05" min="0" max="1" style={{ ...s.input, width: "100px" }}
                value={settings.weights[key]}
                onChange={e => onChange({ ...settings, weights: { ...settings.weights, [key]: parseFloat(e.target.value) || 0 } })} />
            </div>
          ))}
        </div>
        <div>
          <div style={{ ...s.label, fontSize: "13px", color: "#1a1a1a", marginBottom: "12px" }}>Today's Focus — Items per Area</div>
          {AREAS.map(area => (
            <div key={area} style={s.formGroup}>
              <label style={s.label}>{area}</label>
              <input type="number" min="1" max="10" style={{ ...s.input, width: "80px" }}
                value={settings.topN[area]}
                onChange={e => onChange({ ...settings, topN: { ...settings.topN, [area]: parseInt(e.target.value) || 1 } })} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
