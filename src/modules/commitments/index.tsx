import { useState } from "react";
import type { Area, Tier, Commitment, Settings } from "./types";
import { AREAS, defaultForm } from "./types";
import { DEFAULT_SETTINGS } from "./constants";
import { calcPriority } from "./utils/priority";
import { s, COL_WIDTHS, COL_HEADERS, COL_WIDTHS_NO_AREA, COL_HEADERS_NO_AREA } from "./styles";
import { useCommitments } from "./hooks/useCommitments";
import { Header } from "./components/Header";
import { AddPanel } from "./components/AddPanel";
import { EditPanel } from "./components/EditPanel";
import { SettingsDrawer } from "./components/SettingsDrawer";
import { UrgentSection } from "./components/UrgentSection";
import { TodaysFocusPanel } from "./components/TodaysFocusPanel";
import { RecommendationsPanel } from "./components/RecommendationsPanel";
import { AreaSection } from "./components/AreaSection";
import { Footer } from "./components/Footer";

export default function CommitmentsModule() {
  const { commitments, loading, saving, error, setError, add, update, remove, toggleComplete, removeAllComplete } = useCommitments();

  const [areaFilter, setAreaFilter] = useState<Area | "All" | "Today's Focus" | "Recommendations">("Recommendations");
  const [tierFilter, setTierFilter] = useState<Tier | "All">("All");
  const [editing, setEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Commitment | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState(defaultForm());
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [todoCollapsed, setTodoCollapsed] = useState(false);

  const isTodayView = areaFilter === "Today's Focus";
  const isRecommendationsView = areaFilter === "Recommendations";
  const effectiveAreaFilter = (isTodayView || isRecommendationsView) ? "All" : areaFilter;

  const filtered = commitments
    .filter(c => effectiveAreaFilter === "All" || c.area === effectiveAreaFilter)
    .filter(c => tierFilter === "All" || c.tier === tierFilter);

  const urgentItems = filtered.filter(c => c.tier === "Urgent");
  const dailyItems = commitments.filter(c => c.tier === "Daily" && !c.completed);
  const weeklyItems = commitments.filter(c => c.tier === "Weekly" && !c.completed);
  const scoredTodoItems = (effectiveAreaFilter === "All" ? AREAS : [effectiveAreaFilter as Area]).flatMap(area => {
    const n = settings.topN[area];
    return commitments
      .filter(c => c.area === area && !c.completed && ["High Priority", "Normal"].includes(c.tier))
      .sort((a, b) => calcPriority(b, settings) - calcPriority(a, settings))
      .slice(0, n);
  });
  const todoItems = [...dailyItems, ...weeklyItems, ...scoredTodoItems];

  const areasToShow: Area[] = effectiveAreaFilter === "All" ? [...AREAS] : [effectiveAreaFilter as Area];
  const showArea = effectiveAreaFilter === "All";
  const widths = showArea ? COL_WIDTHS : COL_WIDTHS_NO_AREA;
  const headers = showArea ? COL_HEADERS : COL_HEADERS_NO_AREA;
  const hasComplete = commitments.some(c => c.completed && c.tier !== "Weekly");

  function getAreaItems(area: Area): Commitment[] {
    return filtered
      .filter(c => c.area === area && c.tier !== "Urgent")
      .sort((a, b) => calcPriority(b, settings) - calcPriority(a, settings));
  }

  function handleEdit(c: Commitment) {
    setEditing(c.id);
    setEditForm({ ...c });
  }

  function handleCancelEdit() {
    setEditing(null);
    setEditForm(null);
  }

  async function handleSaveEdit() {
    if (!editForm) return;
    const ok = await update(editForm);
    if (ok) { setEditing(null); setEditForm(null); }
  }

  async function handleAdd() {
    if (!newForm.name.trim()) return;
    const ok = await add(newForm);
    if (ok) { setShowAdd(false); setNewForm(defaultForm()); }
  }

  const showTodoPanel =
    isTodayView ||
    tierFilter === "All" ||
    tierFilter === "High Priority" ||
    tierFilter === "Normal" ||
    tierFilter === "Daily" ||
    tierFilter === "Weekly";

  return (
    <div style={s.app}>
      <Header
        activeCount={commitments.filter(c => !c.completed).length}
        areaFilter={areaFilter}
        tierFilter={tierFilter}
        hasComplete={hasComplete}
        onAreaChange={setAreaFilter}
        onTierChange={setTierFilter}
        onAddClick={() => setShowAdd(!showAdd)}
        onSettingsClick={() => setShowSettings(true)}
        onRemoveComplete={removeAllComplete}
      />

      {error && (
        <div style={{ background: "#fff0f0", color: "#c0392b", padding: "10px 32px", fontSize: "12px", borderBottom: "1px solid #f5c6c6" }}>
          ⚠ {error} <span style={{ cursor: "pointer", textDecoration: "underline", marginLeft: "8px" }} onClick={() => setError(null)}>dismiss</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "40vh", color: "#aaa" }}>Loading…</div>
      ) : (
        <div style={s.main}>
          {(tierFilter === "All" || tierFilter === "Urgent") && urgentItems.length > 0 && (
            <UrgentSection items={urgentItems} widths={widths} headers={headers} showArea={showArea}
              editingId={editing} settings={settings} onEdit={handleEdit} onDelete={remove} onToggle={toggleComplete} />
          )}

          {editForm && (
            <EditPanel form={editForm} saving={saving} showArea={showArea}
              onChange={setEditForm} onSave={handleSaveEdit} onCancel={handleCancelEdit} />
          )}

          {showAdd && (
            <AddPanel showArea={showArea} saving={saving} form={newForm}
              onChange={setNewForm} onAdd={handleAdd} onCancel={() => setShowAdd(false)} />
          )}

          {isRecommendationsView && (
            <RecommendationsPanel commitments={commitments} settings={settings}
              onToggleComplete={toggleComplete} onEdit={handleEdit} onDelete={remove} />
          )}

          {!isRecommendationsView && showTodoPanel && todoItems.length > 0 && (
            <TodaysFocusPanel items={todoItems} settings={settings} isTodayView={isTodayView}
              collapsed={todoCollapsed} onToggleCollapse={() => setTodoCollapsed(!todoCollapsed)}
              onToggleComplete={toggleComplete} onEdit={handleEdit} onDelete={remove} />
          )}

          {!isTodayView && !isRecommendationsView && areasToShow.map(area => {
            const items = getAreaItems(area);
            if (items.length === 0) return null;
            return (
              <AreaSection key={area} area={area} items={items} widths={widths} headers={headers}
                showArea={showArea} editingId={editing} settings={settings}
                onEdit={handleEdit} onDelete={remove} onToggle={toggleComplete} />
            );
          })}
        </div>
      )}

      {showSettings && (
        <SettingsDrawer settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)} />
      )}

      <Footer saving={saving} />
    </div>
  );
}
