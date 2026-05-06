interface Props {
  saving: boolean;
}

export function Footer({ saving }: Props) {
  return (
    <div style={{ padding: "12px 32px", borderTop: "1px solid #e5e5e5", fontSize: "11px", color: "#bbb", background: "#fff" }}>
      Double-click any row to edit · Check to complete · Settings to adjust focus and priority weights
      {saving && <span style={{ marginLeft: "12px", color: "#2253c7" }}>Saving…</span>}
    </div>
  );
}
