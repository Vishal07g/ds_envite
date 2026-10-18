import React, { useState } from 'react';
import { SvgX, SvgPlus, SvgTrash, SvgSend, SvgUsers, SvgCheck, SvgCopy, SvgSparkles } from './icons';

export default function GuestManagerModal({
  isOpen,
  onClose,
  guests = [],
  onUpdateGuests,
  inviteUrl = "",
  brideName = "Ananya",
  groomName = "Aarav"
}) {
  const [activeTab, setActiveTab] = useState("list"); // "list" | "import" | "tables" | "analytics"
  const [guestList, setGuestList] = useState(guests.length > 0 ? guests : [
    { id: "g1", name: "Uncle Rajesh & Family", category: "Family", table: "Table 1 (Royal Mandap)", status: "yes", count: 4, phone: "+1234567890" },
    { id: "g2", name: "Sophia & Daniel", category: "Friends", table: "Table 2 (Garden Lawn)", status: "yes", count: 2, phone: "+1987654321" },
    { id: "g3", name: "Marcus Vance", category: "VIP", table: "Table 1 (Royal Mandap)", status: "pending", count: 1, phone: "" }
  ]);

  // Form for adding single guest
  const [newGuest, setNewGuest] = useState({ name: "", category: "Family", table: "Table 1 (Royal Mandap)", count: 1, phone: "" });
  // Bulk import text area
  const [bulkText, setBulkText] = useState("");
  // Custom Table list
  const [tables, setTables] = useState(["Table 1 (Royal Mandap)", "Table 2 (Garden Lawn)", "Table 3 (Cocktail Lounge)", "Unassigned"]);
  const [newTableName, setNewTableName] = useState("");

  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  const saveGuests = (updated) => {
    setGuestList(updated);
    if (onUpdateGuests) onUpdateGuests(updated);
  };

  const handleAddGuest = (e) => {
    e.preventDefault();
    if (!newGuest.name.trim()) return;
    const item = {
      id: `g_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: newGuest.name.trim(),
      category: newGuest.category,
      table: newGuest.table,
      status: "pending",
      count: parseInt(newGuest.count, 10) || 1,
      phone: newGuest.phone.trim()
    };
    saveGuests([...guestList, item]);
    setNewGuest({ name: "", category: "Family", table: tables[0] || "Unassigned", count: 1, phone: "" });
  };

  const handleDeleteGuest = (id) => {
    saveGuests(guestList.filter(g => g.id !== id));
  };

  const handleBulkImport = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split("\n").map(l => l.trim()).filter(Boolean);
    const newItems = lines.map((line, idx) => {
      const parts = line.split(",");
      const name = parts[0]?.trim() || `Guest ${idx + 1}`;
      const count = parseInt(parts[1]?.trim(), 10) || 1;
      const category = parts[2]?.trim() || "Friends";
      return {
        id: `g_${Date.now()}_${idx}`,
        name,
        count,
        category,
        table: tables[0] || "Unassigned",
        status: "pending",
        phone: ""
      };
    });
    saveGuests([...guestList, ...newItems]);
    setBulkText("");
    setActiveTab("list");
  };

  const handleAddTable = () => {
    if (!newTableName.trim() || tables.includes(newTableName.trim())) return;
    setTables([...tables, newTableName.trim()]);
    setNewTableName("");
  };

  const generateWhatsAppLink = (guest) => {
    const fullInviteLink = `${inviteUrl || window.location.href}?guest=${encodeURIComponent(guest.name)}`;
    const msg = `✨ Warmest Wedding Invitation ✨\n\nDear ${guest.name},\n\nWith great joy, ${brideName} & ${groomName} invite you to our wedding celebration! 💍\n\nView your personal invitation & RSVP online:\n${fullInviteLink}\n\nWe look forward to seeing you! ❤️`;
    const encoded = encodeURIComponent(msg);
    if (guest.phone) {
      const cleaned = guest.phone.replace(/[^0-9+]/g, "");
      return `https://wa.me/${cleaned}?text=${encoded}`;
    }
    return `https://api.whatsapp.com/send?text=${encoded}`;
  };

  const copyGuestLink = (guest) => {
    const link = `${inviteUrl || window.location.href}?guest=${encodeURIComponent(guest.name)}`;
    navigator.clipboard.writeText(link);
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Analytics stats
  const totalInvited = guestList.reduce((acc, g) => acc + (g.count || 1), 0);
  const totalConfirmed = guestList.filter(g => g.status === "yes").reduce((acc, g) => acc + (g.count || 1), 0);
  const totalRegretted = guestList.filter(g => g.status === "no").reduce((acc, g) => acc + (g.count || 1), 0);
  const totalPending = totalInvited - totalConfirmed - totalRegretted;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e1626] border border-amber-500/30 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl shadow-amber-500/10 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <SvgUsers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-amber-100 flex items-center gap-2">
                Guest List & RSVP Manager
              </h3>
              <p className="text-xs text-slate-400">Manage invitations, table seating, and direct WhatsApp links</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <SvgX className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-1.5 gap-1 text-xs font-semibold overflow-x-auto">
          {[
            { id: "list", label: `👥 Guest List (${guestList.length})` },
            { id: "import", label: "📥 Bulk Import (CSV)" },
            { id: "tables", label: "🍽 Table Seating Planner" },
            { id: "analytics", label: "📊 RSVP Analytics" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg transition whitespace-nowrap text-center ${
                activeTab === tab.id 
                  ? 'bg-amber-500 text-slate-950 font-bold shadow' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-200">
          {activeTab === "list" && (
            <div className="space-y-5">
              {/* Add Single Guest Form */}
              <form onSubmit={handleAddGuest} className="p-3.5 bg-slate-900/90 border border-amber-500/25 rounded-xl grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-amber-400 mb-1">Guest / Family Name</label>
                  <input
                    type="text"
                    value={newGuest.name}
                    onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                    placeholder="e.g. Eleanor Sterling & Family"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-amber-400 mb-1">Category</label>
                  <select
                    value={newGuest.category}
                    onChange={(e) => setNewGuest({ ...newGuest, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Family">Family</option>
                    <option value="Friends">Friends</option>
                    <option value="VIP">VIP</option>
                    <option value="Colleagues">Colleagues</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-amber-400 mb-1">Passes / Heads</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newGuest.count}
                    onChange={(e) => setNewGuest({ ...newGuest, count: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg uppercase tracking-wider text-[11px] transition flex items-center justify-center space-x-1"
                >
                  <SvgPlus className="w-4 h-4" />
                  <span>Add Guest</span>
                </button>
              </form>

              {/* Guest Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/50">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      <th className="p-3">Guest Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Table Seating</th>
                      <th className="p-3">RSVP Status</th>
                      <th className="p-3 text-center">Heads</th>
                      <th className="p-3 text-right">Actions / WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {guestList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                          No guests added yet. Add guests above or use bulk import!
                        </td>
                      </tr>
                    ) : (
                      guestList.map(g => (
                        <tr key={g.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-semibold text-slate-200">{g.name}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              g.category === 'VIP' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                              g.category === 'Family' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}>
                              {g.category}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300 text-[11px]">
                            <select
                              value={g.table || "Unassigned"}
                              onChange={(e) => {
                                const updated = guestList.map(item => item.id === g.id ? { ...item, table: e.target.value } : item);
                                saveGuests(updated);
                              }}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200"
                            >
                              {tables.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            <select
                              value={g.status || "pending"}
                              onChange={(e) => {
                                const updated = guestList.map(item => item.id === g.id ? { ...item, status: e.target.value } : item);
                                saveGuests(updated);
                              }}
                              className={`rounded px-2 py-1 text-[10px] font-bold border uppercase tracking-wider ${
                                g.status === 'yes' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' :
                                g.status === 'no' ? 'bg-rose-950/60 text-rose-300 border-rose-500/40' :
                                'bg-amber-950/60 text-amber-300 border-amber-500/40'
                              }`}
                            >
                              <option value="yes">✓ Confirmed</option>
                              <option value="no">✕ Regretted</option>
                              <option value="pending">⏳ Pending</option>
                            </select>
                          </td>
                          <td className="p-3 text-center font-bold text-amber-200">{g.count}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <a
                                href={generateWhatsAppLink(g)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded transition"
                                title="Share via WhatsApp"
                              >
                                <SvgSend className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => copyGuestLink(g)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
                                title="Copy Personal Invite Link"
                              >
                                {copiedId === g.id ? <SvgCheck className="w-3.5 h-3.5 text-emerald-400" /> : <SvgCopy className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleDeleteGuest(g.id)}
                                className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded transition"
                                title="Delete Guest"
                              >
                                <SvgTrash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "import" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs">Batch Guest List Importer</h4>
                <p className="text-slate-400 text-xs">
                  Paste guest names below (one per line). Format: <code className="text-amber-200">Name, PassesCount, Category</code>
                </p>
                <textarea
                  rows={8}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`Sophia & Daniel, 2, Friends\nUncle Rajesh & Family, 4, Family\nJulian Vance, 1, VIP`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleBulkImport}
                disabled={!bulkText.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow transition disabled:opacity-50"
              >
                Import Guests into List
              </button>
            </div>
          )}

          {activeTab === "tables" && (
            <div className="space-y-5">
              {/* Add Custom Table */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="e.g. Table 4 (High School Friends)"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
                <button
                  onClick={handleAddTable}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider"
                >
                  + Add Table
                </button>
              </div>

              {/* Table Seating Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tables.map(tbl => {
                  const assignedGuests = guestList.filter(g => g.table === tbl);
                  const tableHeadsCount = assignedGuests.reduce((acc, g) => acc + (g.count || 1), 0);
                  return (
                    <div key={tbl} className="p-4 bg-slate-900/90 border border-amber-500/20 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h4 className="font-bold text-amber-200 text-xs font-cinzel">{tbl}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                          {tableHeadsCount} Guests Assigned
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {assignedGuests.length === 0 ? (
                          <p className="text-[11px] text-slate-500 italic">No guests seated here yet.</p>
                        ) : (
                          assignedGuests.map(g => (
                            <div key={g.id} className="flex justify-between items-center bg-slate-950/60 p-2 rounded border border-slate-800 text-[11px]">
                              <span className="text-slate-200 font-medium">{g.name}</span>
                              <span className="text-slate-400 text-[10px]">{g.count} head(s)</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-center">
                  <div className="text-2xl font-bold text-white font-cinzel">{totalInvited}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">Total Invited</div>
                </div>
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center">
                  <div className="text-2xl font-bold text-emerald-400 font-cinzel">{totalConfirmed}</div>
                  <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold mt-1">Confirmed Attending</div>
                </div>
                <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl text-center">
                  <div className="text-2xl font-bold text-rose-400 font-cinzel">{totalRegretted}</div>
                  <div className="text-[10px] text-rose-300 uppercase tracking-wider font-semibold mt-1">Regretted / Declined</div>
                </div>
                <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-xl text-center">
                  <div className="text-2xl font-bold text-amber-400 font-cinzel">{totalPending}</div>
                  <div className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold mt-1">Pending Response</div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                <h4 className="font-bold text-amber-300 text-xs font-cinzel uppercase tracking-wider">Attendance Percentage Bar</h4>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                  <div 
                    style={{ width: `${totalInvited > 0 ? (totalConfirmed / totalInvited) * 100 : 0}%` }} 
                    className="bg-emerald-500 h-full transition-all duration-500" 
                    title="Confirmed"
                  />
                  <div 
                    style={{ width: `${totalInvited > 0 ? (totalRegretted / totalInvited) * 100 : 0}%` }} 
                    className="bg-rose-500 h-full transition-all duration-500" 
                    title="Regretted"
                  />
                  <div 
                    style={{ width: `${totalInvited > 0 ? (totalPending / totalInvited) * 100 : 0}%` }} 
                    className="bg-amber-500/50 h-full transition-all duration-500" 
                    title="Pending"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="text-emerald-400">✓ {totalInvited > 0 ? Math.round((totalConfirmed / totalInvited) * 100) : 0}% Confirmed</span>
                  <span className="text-rose-400">✕ {totalInvited > 0 ? Math.round((totalRegretted / totalInvited) * 100) : 0}% Declined</span>
                  <span className="text-amber-400">⏳ {totalInvited > 0 ? Math.round((totalPending / totalInvited) * 100) : 0}% Pending</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
