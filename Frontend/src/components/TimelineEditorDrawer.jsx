import React, { useState } from 'react';
import { 
  DEFAULT_CEREMONIES, 
  CEREMONY_TEMPLATES, 
  TIMELINE_COLOR_PRESETS, 
  DEFAULT_TIMELINE_CONFIG,
  formatCeremonyDate,
  TIMELINE_CLIPARTS
} from '../data/timelineDefaults';
import TimelineClipartSelector from './TimelineClipartSelector';
import { 
  SvgPlus, SvgTrash, SvgEdit, SvgCopy, SvgCheck, 
  SvgCalendar, SvgMapPin, SvgEye, SvgSliders, SvgLayers, SvgSparkles 
} from './icons';

export default function TimelineEditorDrawer({ config = {}, onChangeField, triggerDialog }) {
  // Current ceremonies list or default
  const ceremonies = Array.isArray(config.ceremonies) && config.ceremonies.length > 0 
    ? config.ceremonies 
    : DEFAULT_CEREMONIES;

  // Active accordion panel inside timeline editor
  const [openPanel, setOpenPanel] = useState("list"); // 'visibility', 'list', 'details', 'layout', 'colors', 'shape', 'clipart', 'theme', 'advanced'
  const [selectedCeremonyId, setSelectedCeremonyId] = useState(ceremonies[0]?.id || "ceremony-haldi");
  const [clipartModalCeremonyId, setClipartModalCeremonyId] = useState(null);

  const togglePanel = (id) => {
    setOpenPanel(prev => prev === id ? null : id);
  };

  const selectedCeremony = ceremonies.find(c => c.id === selectedCeremonyId) || ceremonies[0];

  // Helper to update entire ceremonies array
  const updateCeremonies = (newList) => {
    onChangeField && onChangeField('ceremonies', newList);
  };

  // 1. Add Ceremony
  const handleAddCeremony = (template = null) => {
    const newId = `ceremony-${Date.now()}`;
    const base = template || CEREMONY_TEMPLATES[0];
    const newCeremony = {
      id: newId,
      title: base.title || "New Ceremony",
      category: base.category || "other",
      date: config.weddingDate ? config.weddingDate.slice(0, 10) : "",
      time: base.time || "11:00 AM",
      description: base.description || "",
      venueName: config.weddingVenue || "",
      venueAddress: config.weddingAddress || "",
      venueUrl: config.weddingMapUrl || "",
      clipartId: base.clipartId || "other-gift",
      visible: true,
      showClipart: true,
      order: ceremonies.length
    };
    const updated = [...ceremonies, newCeremony];
    updateCeremonies(updated);
    setSelectedCeremonyId(newId);
    setOpenPanel("details");
  };

  // 2. Duplicate Ceremony
  const handleDuplicateCeremony = (id) => {
    const target = ceremonies.find(c => c.id === id);
    if (!target) return;
    const duplicated = {
      ...target,
      id: `ceremony-${Date.now()}`,
      title: `${target.title} (Copy)`,
      order: ceremonies.length
    };
    const updated = [...ceremonies, duplicated];
    updateCeremonies(updated);
    setSelectedCeremonyId(duplicated.id);
  };

  // 3. Delete Ceremony
  const handleDeleteCeremony = (id) => {
    const target = ceremonies.find(c => c.id === id);
    if (!target) return;

    if (triggerDialog) {
      triggerDialog({
        type: 'confirm',
        title: 'Delete Ceremony?',
        message: `Are you sure you want to delete "${target.title}"? This cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        onConfirm: () => {
          const updated = ceremonies.filter(c => c.id !== id);
          updateCeremonies(updated);
          if (selectedCeremonyId === id) {
            setSelectedCeremonyId(updated[0]?.id || null);
          }
        }
      });
    } else {
      const updated = ceremonies.filter(c => c.id !== id);
      updateCeremonies(updated);
      if (selectedCeremonyId === id) {
        setSelectedCeremonyId(updated[0]?.id || null);
      }
    }
  };

  // 4. Move Up / Down
  const handleMove = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ceremonies.length) return;
    const newList = [...ceremonies];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    // Re-index orders
    const reordered = newList.map((item, idx) => ({ ...item, order: idx }));
    updateCeremonies(reordered);
    // Switch to manual order mode
    onChangeField && onChangeField('timelineSortMode', 'manual');
  };

  // 5. Update Single Ceremony Property
  const handleUpdateCeremonyField = (ceremonyId, field, val) => {
    const updated = ceremonies.map(c => {
      if (c.id === ceremonyId) {
        return { ...c, [field]: val };
      }
      return c;
    });
    updateCeremonies(updated);
  };

  // 6. Restore Defaults
  const handleRestoreDefaults = () => {
    if (triggerDialog) {
      triggerDialog({
        type: 'confirm',
        title: 'Restore Default Timeline?',
        message: 'This will reset all timeline ceremonies and visual styles back to the initial design.',
        confirmText: 'Reset Defaults',
        cancelText: 'Cancel',
        onConfirm: () => {
          Object.keys(DEFAULT_TIMELINE_CONFIG).forEach(key => {
            onChangeField(key, DEFAULT_TIMELINE_CONFIG[key]);
          });
        }
      });
    } else {
      Object.keys(DEFAULT_TIMELINE_CONFIG).forEach(key => {
        onChangeField(key, DEFAULT_TIMELINE_CONFIG[key]);
      });
    }
  };

  // 7. Apply Color Preset
  const handleApplyPreset = (preset) => {
    onChangeField('timelineHeadingColor', preset.heading);
    onChangeField('timelineSubtitleColor', preset.subtitle);
    onChangeField('timelineTitleColor', preset.title);
    onChangeField('timelineTextColor', preset.text);
    onChangeField('timelineDateColor', preset.date);
    onChangeField('timelineVenueColor', preset.venue);
    onChangeField('timelineLineColor', preset.line);
    onChangeField('timelineNodeColor', preset.node);
    onChangeField('timelineCardBg', preset.cardBg);
    onChangeField('timelineCardBorder', preset.cardBorder);
    onChangeField('timelineClipartBorder', preset.clipartBorder);
  };

  const selectedClipartTarget = ceremonies.find(c => c.id === clipartModalCeremonyId);

  return (
    <div className="space-y-4 text-xs font-sans text-slate-100">

      {/* Quick Master Switch Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center justify-between shadow-md">
        <div>
          <span className="font-bold text-amber-300 block text-xs">Wedding Ceremony Timeline</span>
          <span className="text-[10px] text-slate-400">Positioned immediately below Meet the Family</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.showTimelineSection !== false}
            onChange={(e) => onChangeField('showTimelineSection', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
        </label>
      </div>

      {/* 1. SECTION VISIBILITY PANEL */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow">
        <button
          type="button"
          onClick={() => togglePanel('visibility')}
          className="w-full p-3.5 flex items-center justify-between font-bold text-left hover:bg-slate-900/60 transition"
        >
          <span className="flex items-center space-x-2 text-amber-300">
            <span>👁️</span>
            <span>1. Section &amp; Element Visibility</span>
          </span>
          <span className="text-xs text-slate-400">{openPanel === 'visibility' ? '▲' : '▼'}</span>
        </button>

        {openPanel === 'visibility' && (
          <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/40 animate-fade-in">
            {[
              { label: "Show Central Golden Line", key: "showTimelineLine", defaultVal: true },
              { label: "Show Main Section Heading", key: "showTimelineHeading", defaultVal: true },
              { label: "Show Timeline Cursive Subtitle", key: "showTimelineSubtitle", defaultVal: true },
              { label: "Show Ceremony Event Cards", key: "showTimelineCards", defaultVal: true },
              { label: "Show Date & Weekday", key: "showTimelineDateTime", defaultVal: true },
              { label: "Show Ceremony Times (All)", key: "showTimelineTime", defaultVal: true },
              { label: "Show Venue & Maps", key: "showTimelineVenue", defaultVal: true },
              { label: "Show Short Descriptions", key: "showTimelineDescriptions", defaultVal: true },
              { label: "Show Circular Artwork (All Cliparts)", key: "showTimelineAllCliparts", defaultVal: true },
              { label: "Show Decorative Heart & Finials", key: "showTimelineOrnaments", defaultVal: true },
              { label: "Show Outer Decorative Corner Accents", key: "showTimelineOuterFrame", defaultVal: true }
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-1">
                <span className="text-slate-300 text-[11px]">{item.label}</span>
                <input
                  type="checkbox"
                  checked={config[item.key] !== undefined ? config[item.key] : item.defaultVal}
                  onChange={(e) => onChangeField(item.key, e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer w-4 h-4"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. CEREMONY LIST & MANAGEMENT PANEL */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow">
        <button
          type="button"
          onClick={() => togglePanel('list')}
          className="w-full p-3.5 flex items-center justify-between font-bold text-left hover:bg-slate-900/60 transition"
        >
          <span className="flex items-center space-x-2 text-amber-300">
            <span>📋</span>
            <span>2. Ceremony List &amp; Reordering ({ceremonies.length})</span>
          </span>
          <span className="text-xs text-slate-400">{openPanel === 'list' ? '▲' : '▼'}</span>
        </button>

        {openPanel === 'list' && (
          <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-900/40 animate-fade-in">
            {/* Sorting Mode */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-slate-200 block">Chronological Date Sort</span>
                <span className="text-[9px] text-slate-400">Order automatically by event date</span>
              </div>
              <button
                type="button"
                onClick={() => onChangeField('timelineSortMode', config.timelineSortMode === 'manual' ? 'chronological' : 'manual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  config.timelineSortMode !== 'manual'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {config.timelineSortMode !== 'manual' ? 'Auto Chrono ✓' : 'Manual Order'}
              </button>
            </div>

            {/* List of ceremonies */}
            <div className="space-y-2">
              {ceremonies.map((c, idx) => {
                const { dayOfWeek, formattedDate } = formatCeremonyDate(c.date);
                const isSelected = selectedCeremonyId === c.id;

                return (
                  <div 
                    key={c.id || idx}
                    onClick={() => {
                      setSelectedCeremonyId(c.id);
                      setOpenPanel("details");
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className="text-slate-500 font-mono text-[10px] w-4">{idx + 1}</span>
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-500/40 shrink-0 bg-slate-800 flex items-center justify-center p-0.5">
                        {c.customImageUrl ? (
                          <img src={c.customImageUrl} alt="" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: TIMELINE_CLIPARTS[c.clipartId]?.svg || "✨" }} 
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={c.title || ""}
                            onChange={(e) => handleUpdateCeremonyField(c.id, 'title', e.target.value)}
                            className="font-bold text-slate-100 text-xs bg-slate-950/80 border border-slate-700/80 hover:border-amber-400 focus:border-amber-400 rounded px-2 py-0.5 focus:outline-none w-full max-w-[190px] transition"
                            placeholder="Ceremony Name"
                            title="Click to rename this holy ceremony"
                          />
                        </div>
                        <p className="text-[10px] text-amber-300/80 truncate mt-0.5">
                          {c.date ? `${dayOfWeek || ''} ${formattedDate || ''}` : "Undated"}
                          {c.time && (c.showTime !== false ? ` • ${c.time}` : ' • (Time hidden)')}
                        </p>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleUpdateCeremonyField(c.id, 'showTime', c.showTime === false ? true : false)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer transition flex items-center space-x-0.5 ${
                          c.showTime !== false 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' 
                            : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700'
                        }`}
                        title={c.showTime !== false ? "Time is visible on invitation (Click to hide)" : "Time is hidden on invitation (Click to show)"}
                      >
                        <span>🕒</span>
                        <span>{c.showTime !== false ? 'ON' : 'OFF'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-[10px]"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === ceremonies.length - 1}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-[10px]"
                        title="Move Down"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateCeremony(c.id)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300"
                        title="Duplicate Ceremony"
                      >
                        <SvgCopy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCeremony(c.id)}
                        className="p-1 rounded bg-slate-800 hover:bg-rose-900/40 text-rose-400"
                        title="Delete Ceremony"
                      >
                        <SvgTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Ceremony Dropdown / Presets */}
            <div className="pt-2">
              <label className="text-[10px] uppercase font-bold text-amber-300 block mb-1.5">
                + Add Ceremony From Template
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CEREMONY_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.title}
                    type="button"
                    onClick={() => handleAddCeremony(tpl)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-200 hover:text-amber-300 text-[11px] font-semibold transition text-left truncate"
                  >
                    + {tpl.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Restore Default Order Button */}
            <div className="pt-3 border-t border-slate-800 flex justify-between">
              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="text-[10px] text-slate-400 hover:text-amber-300 underline"
              >
                Restore Default Ceremonies &amp; Order
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. CEREMONY DETAILS PANEL (Selected Ceremony) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow">
        <button
          type="button"
          onClick={() => togglePanel('details')}
          className="w-full p-3.5 flex items-center justify-between font-bold text-left hover:bg-slate-900/60 transition"
        >
          <span className="flex items-center space-x-2 text-amber-300">
            <span>✏️</span>
            <span>3. Edit Selected Ceremony ({selectedCeremony?.title || "None"})</span>
          </span>
          <span className="text-xs text-slate-400">{openPanel === 'details' ? '▲' : '▼'}</span>
        </button>

        {openPanel === 'details' && selectedCeremony && (
          <div className="p-4 border-t border-slate-800 space-y-3.5 bg-slate-900/40 animate-fade-in">
            {/* Clipart Selector Preview Row */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-amber-500/30">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-amber-400 p-0.5 bg-slate-800 flex items-center justify-center shadow">
                  {selectedCeremony.customImageUrl ? (
                    <img src={selectedCeremony.customImageUrl} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: TIMELINE_CLIPARTS[selectedCeremony.clipartId]?.svg || "✨" }} 
                    />
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-200 text-xs">Ceremony Artwork</p>
                  <p className="text-[10px] text-slate-400">
                    {TIMELINE_CLIPARTS[selectedCeremony.clipartId]?.name || "Custom Artwork"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClipartModalCeremonyId(selectedCeremony.id)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-bold text-xs transition"
              >
                Change Motif
              </button>
            </div>

            {/* Holy Ceremony Title & Quick Preset Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase font-bold text-amber-300 block">
                  ✨ Holy Ceremony Name / Title *
                </label>
                <span className="text-[9px] text-slate-400">Directly Editable</span>
              </div>
              <input
                type="text"
                value={selectedCeremony.title || ""}
                onChange={(e) => handleUpdateCeremonyField(selectedCeremony.id, 'title', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-xl text-slate-100 font-bold text-xs focus:border-amber-400 focus:outline-none shadow-inner"
                placeholder="e.g. Subh Haldi, Narayan Katha, Subh Vivaah"
              />
              {/* Quick Holy Ceremony suggestions pills */}
              <div className="flex flex-wrap gap-1 mt-2">
                {[
                  "Subh Haldi",
                  "Mehandi Ceremony",
                  "Narayan Katha",
                  "Subh Vivaah",
                  "Sacred Phere",
                  "Reception",
                  "Devpujan",
                  "Sangeet & Musical Night",
                  "Tilak / Roka",
                  "Baraat Agaman",
                  "Vidaai",
                  "Holy Matrimony",
                  "Nikah Ceremony",
                  "Anand Karaj"
                ].map(suggested => (
                  <button
                    key={suggested}
                    type="button"
                    onClick={() => handleUpdateCeremonyField(selectedCeremony.id, 'title', suggested)}
                    className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border transition ${
                      selectedCeremony.title === suggested
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-400/50 hover:text-amber-200'
                    }`}
                  >
                    {suggested}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={selectedCeremony.date || ""}
                  onChange={(e) => handleUpdateCeremonyField(selectedCeremony.id, 'date', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:border-amber-400 focus:outline-none"
                />
                {selectedCeremony.date && (
                  <span className="text-[10px] text-amber-300 font-semibold block mt-1">
                    📅 {formatCeremonyDate(selectedCeremony.date).dayOfWeek}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">
                    Start Time
                  </label>
                  <button
                    type="button"
                    onClick={() => handleUpdateCeremonyField(selectedCeremony.id, 'showTime', selectedCeremony.showTime === false ? true : false)}
                    className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold cursor-pointer transition select-none ${
                      selectedCeremony.showTime !== false
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                    }`}
                    title={selectedCeremony.showTime !== false ? "Time is visible on invitation. Click to hide." : "Time is hidden on invitation. Click to show."}
                  >
                    <span>🕒</span>
                    <span>{selectedCeremony.showTime !== false ? 'Time ON' : 'Time OFF'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={selectedCeremony.time || ""}
                  onChange={(e) => handleUpdateCeremonyField(selectedCeremony.id, 'time', e.target.value)}
                  disabled={selectedCeremony.showTime === false}
                  className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none transition ${
                    selectedCeremony.showTime !== false
                      ? 'bg-slate-900 border-slate-800 text-slate-100 focus:border-amber-400'
                      : 'bg-slate-950/70 border-slate-800/60 text-slate-500 cursor-not-allowed opacity-60'
                  }`}
                  placeholder={selectedCeremony.showTime !== false ? "e.g. 04:00 PM" : "Time hidden"}
                />
                {selectedCeremony.showTime === false && (
                  <span className="text-[9px] text-amber-400/70 italic block mt-1">
                    Hidden on invitation
                  </span>
                )}
              </div>
            </div>

            {/* Venue Name & Map Link */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Venue Name / Hall
              </label>
              <input
                type="text"
                value={selectedCeremony.venueName || ""}
                onChange={(e) => handleUpdateCeremonyField(selectedCeremony.id, 'venueName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:border-amber-400 focus:outline-none"
                placeholder="e.g. Royal Mandap Lawn"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Google Maps Link (Optional)
              </label>
              <input
                type="url"
                value={selectedCeremony.venueUrl || ""}
                onChange={(e) => handleUpdateCeremonyField(selectedCeremony.id, 'venueUrl', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:border-amber-400 focus:outline-none"
                placeholder="https://maps.google.com/?q=..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Short Description
              </label>
              <textarea
                rows={2}
                value={selectedCeremony.description || ""}
                onChange={(e) => handleUpdateCeremonyField(selectedCeremony.id, 'description', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:border-amber-400 focus:outline-none resize-none"
                placeholder="An evening of joyous dance and celebratory beats."
              />
            </div>

            {/* Toggles for this ceremony */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-300">Show Ceremony on Invitation</span>
              <input
                type="checkbox"
                checked={selectedCeremony.visible !== false}
                onChange={(e) => handleUpdateCeremonyField(selectedCeremony.id, 'visible', e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-300">Show Circular Motif for this Ceremony</span>
              <input
                type="checkbox"
                checked={selectedCeremony.showClipart !== false}
                onChange={(e) => handleUpdateCeremonyField(selectedCeremony.id, 'showClipart', e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer w-4 h-4"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. LAYOUT & ALIGNMENT */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow">
        <button
          type="button"
          onClick={() => togglePanel('layout')}
          className="w-full p-3.5 flex items-center justify-between font-bold text-left hover:bg-slate-900/60 transition"
        >
          <span className="flex items-center space-x-2 text-amber-300">
            <span>📐</span>
            <span>4. Layout &amp; Card Alignment</span>
          </span>
          <span className="text-xs text-slate-400">{openPanel === 'layout' ? '▲' : '▼'}</span>
        </button>

        {openPanel === 'layout' && (
          <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-900/40 animate-fade-in">
            {/* Desktop Alignment */}
            <div>
              <label className="text-[10px] uppercase font-bold text-amber-300 block mb-2">
                Desktop Timeline Alignment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "alternating", label: "Alternating" },
                  { id: "left", label: "All Left" },
                  { id: "right", label: "All Right" }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeField('timelineLayout', opt.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
                      (config.timelineLayout || 'alternating') === opt.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Device Layout Option */}
            <div>
              <label className="text-[10px] uppercase font-bold text-amber-300 block mb-2">
                Mobile &amp; Small Screen Layout
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "alternating", label: "Alternating 2-Col" },
                  { id: "stacked-card", label: "Stacked Cards" }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeField('timelineMobileLayout', opt.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
                      (config.timelineMobileLayout || 'alternating') === opt.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ceremony Title Size */}
            <div>
              <label className="text-[10px] uppercase font-bold text-amber-300 block mb-2">
                Ceremony Name Size (Relative to Icon)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "medium", label: "Medium" },
                  { id: "large", label: "Large (Icon Equal)" },
                  { id: "extra-large", label: "Extra Large" }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeField('timelineTitleSize', opt.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
                      (config.timelineTitleSize || 'large') === opt.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. COLORS & TYPOGRAPHY */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow">
        <button
          type="button"
          onClick={() => togglePanel('colors')}
          className="w-full p-3.5 flex items-center justify-between font-bold text-left hover:bg-slate-900/60 transition"
        >
          <span className="flex items-center space-x-2 text-amber-300">
            <span>🎨</span>
            <span>5. Colors &amp; Typography</span>
          </span>
          <span className="text-xs text-slate-400">{openPanel === 'colors' ? '▲' : '▼'}</span>
        </button>

        {openPanel === 'colors' && (
          <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-900/40 animate-fade-in">
            {/* Coordinated Presets */}
            <div>
              <label className="text-[10px] uppercase font-bold text-amber-300 block mb-2">
                Coordinated Color Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TIMELINE_COLOR_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400 text-left transition flex items-center space-x-2"
                  >
                    <div className="flex -space-x-1 shrink-0">
                      <span className="w-4 h-4 rounded-full border border-black/40" style={{ backgroundColor: preset.heading }} />
                      <span className="w-4 h-4 rounded-full border border-black/40" style={{ backgroundColor: preset.line }} />
                      <span className="w-4 h-4 rounded-full border border-black/40" style={{ backgroundColor: preset.cardBg }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-200 truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Color Pickers */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              {[
                { label: "Section Heading", key: "timelineHeadingColor", defaultVal: "#781428" },
                { label: "Cursive Subtitle", key: "timelineSubtitleColor", defaultVal: "#c28b2a" },
                { label: "Ceremony Titles", key: "timelineTitleColor", defaultVal: "#781428" },
                { label: "Dates & Times", key: "timelineDateColor", defaultVal: "#755d52" },
                { label: "Venues Text", key: "timelineVenueColor", defaultVal: "#755d52" },
                { label: "Connecting Line", key: "timelineLineColor", defaultVal: "#cda452" },
                { label: "Timeline Nodes", key: "timelineNodeColor", defaultVal: "#781428" },
                { label: "Card Background", key: "timelineCardBg", defaultVal: "#fffcf9" },
                { label: "Card Border", key: "timelineCardBorder", defaultVal: "rgba(205, 164, 82, 0.45)" }
              ].map(c => (
                <div key={c.key} className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-300">{c.label}</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={config[c.key] || c.defaultVal}
                      onChange={(e) => onChangeField(c.key, e.target.value)}
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-[10px] text-slate-400 w-16">
                      {config[c.key] || c.defaultVal}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Typography fonts */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Heading Font
                </label>
                <select
                  value={config.timelineHeadingFont || 'font-serif'}
                  onChange={(e) => onChangeField('timelineHeadingFont', e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs"
                >
                  <option value="font-serif">Playfair Display (Serif)</option>
                  <option value="font-cinzel">Cinzel (Regal Classical)</option>
                  <option value="font-cormorant">Cormorant Garamond</option>
                  <option value="font-cursive">Great Vibes (Calligraphy)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Subtitle Font
                </label>
                <select
                  value={config.timelineSubtitleFont || 'font-cursive'}
                  onChange={(e) => onChangeField('timelineSubtitleFont', e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs"
                >
                  <option value="font-cursive">Great Vibes (Calligraphy Script)</option>
                  <option value="font-alex">Alex Brush (Flowing Script)</option>
                  <option value="font-pinyon">Pinyon Script</option>
                  <option value="font-serif">Playfair Display (Serif)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. CARD SHAPE & SPACING */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow">
        <button
          type="button"
          onClick={() => togglePanel('shape')}
          className="w-full p-3.5 flex items-center justify-between font-bold text-left hover:bg-slate-900/60 transition"
        >
          <span className="flex items-center space-x-2 text-amber-300">
            <span>🏷️</span>
            <span>6. Card Shape &amp; Spacing</span>
          </span>
          <span className="text-xs text-slate-400">{openPanel === 'shape' ? '▲' : '▼'}</span>
        </button>

        {openPanel === 'shape' && (
          <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-900/40 animate-fade-in">
            {/* Shape selection */}
            <div>
              <label className="text-[10px] uppercase font-bold text-amber-300 block mb-2">
                Card Shape Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "pill", label: "Pill Shape (Reference)" },
                  { id: "rounded", label: "Soft Rounded" },
                  { id: "bordered", label: "Gold Outline" },
                  { id: "minimal", label: "Minimal Borderless" }
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onChangeField('timelineCardShape', s.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center ${
                      (config.timelineCardShape || 'pill') === s.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Radius */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Corner Radius</span>
                <span className="font-mono text-amber-400">{config.timelineCardCornerRadius ?? 28}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="44"
                value={config.timelineCardCornerRadius ?? 28}
                onChange={(e) => onChangeField('timelineCardCornerRadius', Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Clipart Size */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Circular Motif Size</span>
                <span className="font-mono text-amber-400">{config.timelineClipartSize ?? 46}px</span>
              </div>
              <input
                type="range"
                min="36"
                max="72"
                value={config.timelineClipartSize ?? 46}
                onChange={(e) => onChangeField('timelineClipartSize', Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Granular Border Line Controls */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="text-[10px] uppercase font-bold text-amber-300 block mb-1">
                Border &amp; Outline Controls
              </label>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-300 block">Border on Details Side</span>
                  <span className="text-[9px] text-slate-400">Outline around date, venue &amp; description</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showDetailsCardBorder !== false}
                  onChange={(e) => onChangeField('showDetailsCardBorder', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-300 block">Border on Ceremony Name</span>
                  <span className="text-[9px] text-slate-400">Keep off for minimal borderless text</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showCeremonyCardBorder === true}
                  onChange={(e) => onChangeField('showCeremonyCardBorder', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-300 block">Border on Circular Icon</span>
                  <span className="text-[9px] text-slate-400">Keep off for seamless icon medallion</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showIconBorder === true}
                  onChange={(e) => onChangeField('showIconBorder', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer w-4 h-4"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Clipart Popover Modal */}
      {clipartModalCeremonyId && (
        <TimelineClipartSelector
          isOpen={!!clipartModalCeremonyId}
          onClose={() => setClipartModalCeremonyId(null)}
          selectedClipartId={selectedClipartTarget?.clipartId}
          customImageUrl={selectedClipartTarget?.customImageUrl}
          onSelectClipart={({ clipartId, customImageUrl }) => {
            const updated = ceremonies.map(c => {
              if (c.id === clipartModalCeremonyId) {
                return { ...c, clipartId, customImageUrl: customImageUrl || "" };
              }
              return c;
            });
            updateCeremonies(updated);
          }}
        />
      )}
    </div>
  );
}
