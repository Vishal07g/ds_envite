import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  INVITATION_CATEGORIES, 
  getInitialSampleData, 
  mapInitialDataToConfig 
} from '../data/invitationCategoriesData';
import dbStore, { DEFAULT_CONFIG } from '../data/store';

export default function GuidedInvitationModal({ isOpen, onClose, onCreated, initialCategoryId = null }) {
  const navigate = useNavigate();
  const [step, setStep] = useState("select"); // "select" | "form"
  const [selectedCategory, setSelectedCategory] = useState("wedding");
  const [formData, setFormData] = useState({});
  const [activeWeddingTab, setActiveWeddingTab] = useState("couple"); // "couple" | "wedding" | "timeline" | "family" | "preferences"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");

  // Initialize sample data and step when modal opens or initialCategoryId changes
  useEffect(() => {
    if (isOpen) {
      if (initialCategoryId && initialCategoryId !== "all") {
        setSelectedCategory(initialCategoryId);
        setFormData(getInitialSampleData(initialCategoryId));
        setStep("form");
      } else {
        setStep("select");
        setSelectedCategory("wedding");
        setFormData(getInitialSampleData("wedding"));
      }
    }
  }, [isOpen, initialCategoryId]);

  // Update sample data when category changes inside modal
  useEffect(() => {
    if (selectedCategory && (!initialCategoryId || initialCategoryId === "all")) {
      setFormData(getInitialSampleData(selectedCategory));
    }
  }, [selectedCategory]);

  if (!isOpen) return null;

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setFormData(getInitialSampleData(catId));
    setStep("form");
    setActiveWeddingTab("couple");
  };

  const handleResetSampleData = () => {
    setFormData(getInitialSampleData(selectedCategory));
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Timeline functions manipulation (for Wedding)
  const handleAddWeddingFunction = () => {
    const newFn = {
      id: `func-${Date.now()}`,
      name: "New Celebration Function",
      date: formData.weddingDate || "",
      startTime: "18:00",
      endTime: "21:30",
      venueName: formData.venueName || "Celebration Hall",
      venueAddress: formData.venueAddress || "",
      city: formData.city || "Jaipur",
      googleMapsUrl: "",
      description: "Join us for this special celebration."
    };
    setFormData(prev => ({
      ...prev,
      functions: [...(prev.functions || []), newFn]
    }));
  };

  const handleRemoveWeddingFunction = (idx) => {
    setFormData(prev => ({
      ...prev,
      functions: (prev.functions || []).filter((_, i) => i !== idx)
    }));
  };

  const handleFunctionFieldChange = (idx, field, value) => {
    setFormData(prev => {
      const updated = [...(prev.functions || [])];
      if (updated[idx]) {
        updated[idx] = { ...updated[idx], [field]: value };
      }
      return { ...prev, functions: updated };
    });
  };

  // Submit and create invitation draft
  const handleCreateInvitation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Generate full configuration safely mapped from initial details
      const fullConfig = mapInitialDataToConfig(selectedCategory, formData, DEFAULT_CONFIG);

      // 2. Determine title
      let title = "";
      if (selectedCategory === "wedding") {
        const bride = formData.brideDisplayName || formData.brideFullName || "Aarohi";
        const groom = formData.groomDisplayName || formData.groomFullName || "Vivaan";
        title = `${bride} & ${groom}'s Wedding`;
      } else {
        const name = formData.birthdayPersonName || formData.babyName || formData.motherName || formData.coupleNames || formData.familyName || formData.companyName || "Special Event";
        const catName = INVITATION_CATEGORIES.find(c => c.id === selectedCategory)?.name || "Invitation";
        title = `${name} - ${catName}`;
      }

      // 3. Create invitation draft in store (triggers automatic Google Drive folder creation)
      const newInv = dbStore.createInvitation(
        null,
        title,
        fullConfig,
        false,
        "draft"
      );

      setIsSubmitting(false);
      onClose();

      if (onCreated) {
        onCreated(newInv);
      } else {
        navigate(`/admin/editor/${newInv.id}`);
      }
    } catch (err) {
      console.error("Failed to create invitation draft:", err);
      setIsSubmitting(false);
      alert("Could not create invitation draft: " + (err.message || "Unknown error"));
    }
  };

  const filteredCategories = INVITATION_CATEGORIES.filter(c => 
    c.name.toLowerCase().includes(searchCategory.toLowerCase()) ||
    c.subtitle.toLowerCase().includes(searchCategory.toLowerCase()) ||
    c.description.toLowerCase().includes(searchCategory.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-[#FDFBF7] border border-[#E9DCCB] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        style={{ color: '#513321' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-5 py-4 border-b border-[#E9DCCB] bg-[#F7EFE5] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            {step === "form" && (
              <button
                type="button"
                onClick={() => setStep("select")}
                className="p-1.5 rounded-lg hover:bg-amber-500/15 text-[#513321] transition cursor-pointer text-xs font-bold flex items-center space-x-1"
                title="Back to Categories"
              >
                <span>←</span>
                <span className="hidden sm:inline">Categories</span>
              </button>
            )}
            <div className="flex items-center space-x-2">
              <span className="text-xl">
                {step === "select" ? "✨" : (INVITATION_CATEGORIES.find(c => c.id === selectedCategory)?.icon || "💌")}
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide font-cinzel text-[#513321]">
                  {step === "select" 
                    ? "Choose Invitation Category" 
                    : (selectedCategory === "wedding" ? "Let's Create Your Wedding Invitation" : `Let's Create Your ${INVITATION_CATEGORIES.find(c => c.id === selectedCategory)?.name}`)}
                </h2>
                <p className="text-[10px] text-[#8C6D3B] font-medium hidden sm:block">
                  {step === "select" 
                    ? "Select an invitation category to launch the guided creator with realistic sample details." 
                    : "Enter your initial details to personalize your invitation. You can edit everything later in the editor."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {step === "form" && (
              <button
                type="button"
                onClick={handleResetSampleData}
                className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-[#513321] rounded-lg text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer"
                title="Reset with realistic fictional sample details"
              >
                <span>🎲</span>
                <span className="hidden sm:inline">Reset to Sample Details</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#EFE5D8] hover:bg-amber-200/80 text-[#513321] flex items-center justify-center font-bold text-sm transition cursor-pointer"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* STEP 1: CATEGORY SELECTION */}
          {step === "select" && (
            <div className="space-y-4">
              {/* Search Category */}
              <div className="relative">
                <input
                  type="text"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  placeholder="🔍 Search categories (Wedding, Birthday, Baby Shower, Housewarming, Anniversary...)"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E9DCCB] rounded-xl text-xs text-[#513321] placeholder-[#A67C52] focus:outline-none focus:border-amber-500 shadow-2xs"
                />
              </div>

              {/* Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredCategories.map((cat) => {
                  const isWedding = cat.id === "wedding";
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md hover:scale-[1.01] ${
                        isWedding 
                          ? 'bg-gradient-to-br from-amber-50/80 via-white to-amber-100/50 border-amber-300 ring-1 ring-amber-300/40' 
                          : 'bg-white hover:bg-amber-50/40 border-[#E9DCCB]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${cat.tagColor}`}>
                            {cat.tag}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-extrabold text-[#513321] tracking-wide mb-0.5">
                          {cat.name}
                        </h3>
                        <p className="text-[10px] text-[#A67C52] font-semibold mb-2">
                          {cat.subtitle}
                        </p>
                        <p className="text-[10.5px] text-[#71543E] leading-relaxed line-clamp-3">
                          {cat.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#EFE5D8] flex items-center justify-between">
                        <span className="text-[9.5px] font-bold text-amber-800 flex items-center space-x-1">
                          <span>📁</span>
                          <span>Auto Drive Folder</span>
                        </span>
                        <span className="text-[10px] font-extrabold text-amber-700 group-hover:text-amber-900 flex items-center space-x-1">
                          <span>Draft</span>
                          <span>→</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: CATEGORY GUIDED FORM */}
          {step === "form" && (
            <form onSubmit={handleCreateInvitation} className="space-y-5">
              {/* Realistic Sample Notice Banner */}
              <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-base">✨</span>
                  <div>
                    <span className="font-extrabold text-amber-900 block text-[11px]">
                      Realistic Sample Information Pre-filled
                    </span>
                    <span className="text-[9.5px] text-amber-800 font-medium">
                      You can edit or replace any field below, or click "Create Invitation" to proceed immediately.
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-200/60 text-amber-900 font-bold text-[9px] border border-amber-300/60 shrink-0">
                  Demo Draft Mode
                </span>
              </div>

              {/* WEDDING SPECIFIC COMPREHENSIVE INITIAL DETAILS FORM */}
              {selectedCategory === "wedding" ? (
                <div className="space-y-4">
                  {/* Wedding Sub-Navigation Tabs */}
                  <div className="flex items-center space-x-1 p-1 bg-[#F7EFE5] rounded-xl border border-[#E9DCCB] overflow-x-auto scrollbar-none">
                    {[
                      { id: "couple", label: "Bride & Groom", icon: "💍" },
                      { id: "wedding", label: "Wedding Details", icon: "🏛️" },
                      { id: "timeline", label: `Celebration Functions (${(formData.functions || []).length})`, icon: "📅" },
                      { id: "family", label: "Family & Verses", icon: "🪷" },
                      { id: "preferences", label: "Preferences & Toggles", icon: "⚙️" }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveWeddingTab(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                          activeWeddingTab === tab.id
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-[#71543E] hover:bg-amber-100/60'
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Section A: Bride & Groom Details */}
                  {activeWeddingTab === "couple" && (
                    <div className="space-y-4 bg-white p-4 rounded-xl border border-[#E9DCCB]">
                      <div className="border-b border-[#EFE5D8] pb-2">
                        <h4 className="text-xs font-extrabold text-[#513321] uppercase tracking-wide">
                          Bride &amp; Groom Personal Details
                        </h4>
                        <p className="text-[9.5px] text-[#A67C52]">
                          Enter bride and groom names, display names, and family details.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Bride Column */}
                        <div className="p-3.5 bg-rose-50/40 rounded-xl border border-rose-200/60 space-y-3">
                          <span className="text-[11px] font-extrabold text-rose-900 uppercase flex items-center space-x-1.5">
                            <span>👰</span>
                            <span>Bride Information</span>
                          </span>

                          <div>
                            <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Bride's Full Name *</label>
                            <input
                              type="text"
                              value={formData.brideFullName || ""}
                              onChange={(e) => handleFieldChange("brideFullName", e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                              placeholder="e.g. Aarohi Sharma"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Preferred Display Name (First Name)</label>
                            <input
                              type="text"
                              value={formData.brideDisplayName || ""}
                              onChange={(e) => handleFieldChange("brideDisplayName", e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                              placeholder="e.g. Aarohi"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Bride's Parents' Names</label>
                            <input
                              type="text"
                              value={formData.brideParents || ""}
                              onChange={(e) => handleFieldChange("brideParents", e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                              placeholder="e.g. Rajesh & Sunita Sharma"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Bride's Family Name / Hometown</label>
                            <input
                              type="text"
                              value={formData.brideLocation || ""}
                              onChange={(e) => handleFieldChange("brideLocation", e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                              placeholder="e.g. Jaipur, Rajasthan"
                            />
                          </div>
                        </div>

                        {/* Groom Column */}
                        <div className="p-3.5 bg-sky-50/40 rounded-xl border border-sky-200/60 space-y-3">
                          <span className="text-[11px] font-extrabold text-sky-900 uppercase flex items-center space-x-1.5">
                            <span>🤵</span>
                            <span>Groom Information</span>
                          </span>

                          <div>
                            <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Groom's Full Name *</label>
                            <input
                              type="text"
                              value={formData.groomFullName || ""}
                              onChange={(e) => handleFieldChange("groomFullName", e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                              placeholder="e.g. Vivaan Mehta"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Preferred Display Name (First Name)</label>
                            <input
                              type="text"
                              value={formData.groomDisplayName || ""}
                              onChange={(e) => handleFieldChange("groomDisplayName", e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                              placeholder="e.g. Vivaan"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Groom's Parents' Names</label>
                            <input
                              type="text"
                              value={formData.groomParents || ""}
                              onChange={(e) => handleFieldChange("groomParents", e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                              placeholder="e.g. Amit & Neha Mehta"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Groom's Family Name / Hometown</label>
                            <input
                              type="text"
                              value={formData.groomLocation || ""}
                              onChange={(e) => handleFieldChange("groomLocation", e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                              placeholder="e.g. Mumbai, Maharashtra"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section B: Wedding Details */}
                  {activeWeddingTab === "wedding" && (
                    <div className="space-y-4 bg-white p-4 rounded-xl border border-[#E9DCCB]">
                      <div className="border-b border-[#EFE5D8] pb-2">
                        <h4 className="text-xs font-extrabold text-[#513321] uppercase tracking-wide">
                          Main Wedding Ceremony &amp; Venue Details
                        </h4>
                        <p className="text-[9.5px] text-[#A67C52]">
                          Configure date, timings, venue location, and romantic invitation message.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Wedding Date *</label>
                          <input
                            type="date"
                            value={formData.weddingDate || ""}
                            onChange={(e) => handleFieldChange("weddingDate", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Ceremony Start Time *</label>
                          <input
                            type="time"
                            value={formData.weddingStartTime || "19:00"}
                            onChange={(e) => handleFieldChange("weddingStartTime", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">End Time (Optional)</label>
                          <input
                            type="time"
                            value={formData.weddingEndTime || "23:30"}
                            onChange={(e) => handleFieldChange("weddingEndTime", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Venue Name *</label>
                          <input
                            type="text"
                            value={formData.venueName || ""}
                            onChange={(e) => handleFieldChange("venueName", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                            placeholder="e.g. Royal Wedding Palace"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">City &amp; State</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={formData.city || ""}
                              onChange={(e) => handleFieldChange("city", e.target.value)}
                              className="px-2.5 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                              placeholder="e.g. Jaipur"
                            />
                            <input
                              type="text"
                              value={formData.state || ""}
                              onChange={(e) => handleFieldChange("state", e.target.value)}
                              className="px-2.5 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                              placeholder="e.g. Rajasthan"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Complete Venue Address</label>
                        <input
                          type="text"
                          value={formData.venueAddress || ""}
                          onChange={(e) => handleFieldChange("venueAddress", e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                          placeholder="e.g. Palace Road, Near Jal Mahal, Jaipur, Rajasthan 302002"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Google Maps Location Link</label>
                        <input
                          type="url"
                          value={formData.googleMapsUrl || ""}
                          onChange={(e) => handleFieldChange("googleMapsUrl", e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-mono focus:border-amber-500 focus:outline-none"
                          placeholder="https://maps.google.com/?q=..."
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Wedding Invitation Message</label>
                        <textarea
                          rows={2}
                          value={formData.invitationMessage || ""}
                          onChange={(e) => handleFieldChange("invitationMessage", e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs focus:border-amber-500 focus:outline-none resize-none"
                          placeholder="Warm wedding message to guests..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Section C: Wedding Functions & Timeline */}
                  {activeWeddingTab === "timeline" && (
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-[#E9DCCB]">
                      <div className="flex items-center justify-between border-b border-[#EFE5D8] pb-2">
                        <div>
                          <h4 className="text-xs font-extrabold text-[#513321] uppercase tracking-wide">
                            Multi-Day Wedding Celebrations &amp; Functions Timeline
                          </h4>
                          <p className="text-[9.5px] text-[#A67C52]">
                            Add functions (Mehendi, Haldi, Sangeet, Wedding Ceremony, Reception). Each supports its own date, venue &amp; timings.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddWeddingFunction}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-[10px] font-extrabold flex items-center space-x-1 shadow-2xs transition cursor-pointer"
                        >
                          <span>+</span>
                          <span>Add Function</span>
                        </button>
                      </div>

                      <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                        {(formData.functions || []).map((fn, idx) => (
                          <div key={fn.id || idx} className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E9DCCB] space-y-2 relative group hover:border-amber-300 transition">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold flex items-center justify-center font-mono">
                                  {idx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={fn.name}
                                  onChange={(e) => handleFunctionFieldChange(idx, "name", e.target.value)}
                                  className="text-xs font-extrabold text-[#513321] bg-transparent border-b border-dashed border-[#A67C52] focus:outline-none focus:border-amber-600 px-1 py-0.5"
                                  placeholder="Function Name (e.g. Sangeet)"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveWeddingFunction(idx)}
                                className="text-rose-500 hover:text-rose-700 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-rose-50 cursor-pointer"
                                title="Remove Function"
                              >
                                ✕
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              <div>
                                <label className="text-[8px] font-bold text-[#8C6D3B] uppercase block">Date</label>
                                <input
                                  type="date"
                                  value={fn.date}
                                  onChange={(e) => handleFunctionFieldChange(idx, "date", e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-[#E9DCCB] rounded text-[11px]"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] font-bold text-[#8C6D3B] uppercase block">Start Time</label>
                                <input
                                  type="time"
                                  value={fn.startTime}
                                  onChange={(e) => handleFunctionFieldChange(idx, "startTime", e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-[#E9DCCB] rounded text-[11px]"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] font-bold text-[#8C6D3B] uppercase block">Venue</label>
                                <input
                                  type="text"
                                  value={fn.venueName}
                                  onChange={(e) => handleFunctionFieldChange(idx, "venueName", e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-[#E9DCCB] rounded text-[11px]"
                                  placeholder="Venue Name"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section D: Family & Verses */}
                  {activeWeddingTab === "family" && (
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-[#E9DCCB]">
                      <div className="border-b border-[#EFE5D8] pb-2">
                        <h4 className="text-xs font-extrabold text-[#513321] uppercase tracking-wide">
                          Family Host Details &amp; Sacred Verses
                        </h4>
                        <p className="text-[9.5px] text-[#A67C52]">
                          Add family invitation headings, mantras, and dress code guidance.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Host / Family Name</label>
                          <input
                            type="text"
                            value={formData.hostFamilyName || ""}
                            onChange={(e) => handleFieldChange("hostFamilyName", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                            placeholder="e.g. The Sharma & Mehta Families"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Dress Code Guidance</label>
                          <input
                            type="text"
                            value={formData.dressCode || ""}
                            onChange={(e) => handleFieldChange("dressCode", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                            placeholder="e.g. Traditional Indian / Formal Festive"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Sacred Religious Verse / Mantra</label>
                        <input
                          type="text"
                          value={formData.religiousVerse || ""}
                          onChange={(e) => handleFieldChange("religiousVerse", e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                          placeholder="e.g. Mangalam Bhagwan Vishnu, Mangalam Garudadhwaja..."
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Blessings &amp; Welcome Message</label>
                        <textarea
                          rows={2}
                          value={formData.blessingsMessage || ""}
                          onChange={(e) => handleFieldChange("blessingsMessage", e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs focus:border-amber-500 focus:outline-none resize-none"
                          placeholder="Blessings from elders..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Section E: Preferences & Toggles */}
                  {activeWeddingTab === "preferences" && (
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-[#E9DCCB]">
                      <div className="border-b border-[#EFE5D8] pb-2">
                        <h4 className="text-xs font-extrabold text-[#513321] uppercase tracking-wide">
                          Initial Feature Toggles &amp; Scratch Card
                        </h4>
                        <p className="text-[9.5px] text-[#A67C52]">
                          Choose which initial features to enable. Full control remains accessible in the editor.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {[
                          { field: "enableScratchCard", label: "Scratch Reveal Card", icon: "🪙" },
                          { field: "enableCountdown", label: "Live Countdown", icon: "⏳" },
                          { field: "enableRsvp", label: "Guest RSVP Form", icon: "💌" },
                          { field: "enableGallery", label: "Photo Gallery", icon: "🖼️" },
                          { field: "enableMaps", label: "Google Maps Navigation", icon: "📍" }
                        ].map(item => (
                          <label key={item.field} className="flex items-center space-x-2 p-2.5 rounded-lg border border-[#EFE5D8] bg-[#FDFBF7] cursor-pointer hover:bg-amber-50/50 transition">
                            <input
                              type="checkbox"
                              checked={formData[item.field] !== false}
                              onChange={(e) => handleFieldChange(item.field, e.target.checked)}
                              className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                            />
                            <span className="text-[10px] font-extrabold text-[#513321] flex items-center space-x-1">
                              <span>{item.icon}</span>
                              <span>{item.label}</span>
                            </span>
                          </label>
                        ))}
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">
                          Scratch Card Mystery Foil Message
                        </label>
                        <input
                          type="text"
                          value={formData.scratchMessage || ""}
                          onChange={(e) => handleFieldChange("scratchMessage", e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                          placeholder="e.g. ✦ WIPE TO REVEAL SECRET WEDDING DATE & TIMINGS ✦"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* OTHER 8 CATEGORIES: DYNAMIC COMPACT INITIAL DETAILS FORM */
                <div className="space-y-4 bg-white p-4 rounded-xl border border-[#E9DCCB]">
                  <div className="border-b border-[#EFE5D8] pb-2 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-[#513321] uppercase tracking-wide">
                        {INVITATION_CATEGORIES.find(c => c.id === selectedCategory)?.name} Initial Details
                      </h4>
                      <p className="text-[9.5px] text-[#A67C52]">
                        Enter essential details for this celebration.
                      </p>
                    </div>
                    <span className="text-xl">
                      {INVITATION_CATEGORIES.find(c => c.id === selectedCategory)?.icon}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Primary Hero / Honoree Field */}
                    {selectedCategory === "birthday" && (
                      <>
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Birthday Person's Name *</label>
                          <input
                            type="text"
                            value={formData.birthdayPersonName || ""}
                            onChange={(e) => handleFieldChange("birthdayPersonName", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Age Milestone *</label>
                          <input
                            type="number"
                            value={formData.age || 25}
                            onChange={(e) => handleFieldChange("age", parseInt(e.target.value) || 25)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                      </>
                    )}

                    {selectedCategory === "first_birthday" && (
                      <>
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Baby's Name *</label>
                          <input
                            type="text"
                            value={formData.babyName || ""}
                            onChange={(e) => handleFieldChange("babyName", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Parents' Names</label>
                          <input
                            type="text"
                            value={formData.parentsNames || ""}
                            onChange={(e) => handleFieldChange("parentsNames", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </>
                    )}

                    {selectedCategory === "baby_shower" && (
                      <>
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Mother's Name *</label>
                          <input
                            type="text"
                            value={formData.motherName || ""}
                            onChange={(e) => handleFieldChange("motherName", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Partner's Name</label>
                          <input
                            type="text"
                            value={formData.partnerName || ""}
                            onChange={(e) => handleFieldChange("partnerName", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </>
                    )}

                    {selectedCategory === "naming_ceremony" && (
                      <>
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Baby's Name *</label>
                          <input
                            type="text"
                            value={formData.babyName || ""}
                            onChange={(e) => handleFieldChange("babyName", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Parents' Names</label>
                          <input
                            type="text"
                            value={formData.parentsNames || ""}
                            onChange={(e) => handleFieldChange("parentsNames", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </>
                    )}

                    {selectedCategory === "housewarming" && (
                      <>
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Family Name *</label>
                          <input
                            type="text"
                            value={formData.familyName || ""}
                            onChange={(e) => handleFieldChange("familyName", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">House Name (Optional)</label>
                          <input
                            type="text"
                            value={formData.houseName || ""}
                            onChange={(e) => handleFieldChange("houseName", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </>
                    )}

                    {selectedCategory === "anniversary" && (
                      <>
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Couple Names *</label>
                          <input
                            type="text"
                            value={formData.coupleNames || ""}
                            onChange={(e) => handleFieldChange("coupleNames", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Anniversary Milestone</label>
                          <input
                            type="text"
                            value={formData.anniversaryNumber || "10th"}
                            onChange={(e) => handleFieldChange("anniversaryNumber", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                            placeholder="e.g. 10th, 25th, 50th"
                          />
                        </div>
                      </>
                    )}

                    {selectedCategory === "religious_ceremony" && (
                      <>
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Ceremony Name *</label>
                          <input
                            type="text"
                            value={formData.ceremonyName || ""}
                            onChange={(e) => handleFieldChange("ceremonyName", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Host / Family Name</label>
                          <input
                            type="text"
                            value={formData.hostFamilyName || ""}
                            onChange={(e) => handleFieldChange("hostFamilyName", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </>
                    )}

                    {selectedCategory === "corporate_event" && (
                      <>
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Company / Organization *</label>
                          <input
                            type="text"
                            value={formData.companyName || ""}
                            onChange={(e) => handleFieldChange("companyName", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Event Title *</label>
                          <input
                            type="text"
                            value={formData.eventTitle || ""}
                            onChange={(e) => handleFieldChange("eventTitle", e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                      </>
                    )}

                    {/* Common Date & Time */}
                    <div>
                      <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Event Date *</label>
                      <input
                        type="date"
                        value={formData.eventDate || ""}
                        onChange={(e) => handleFieldChange("eventDate", e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Event Time *</label>
                      <input
                        type="time"
                        value={formData.eventTime || "18:00"}
                        onChange={(e) => handleFieldChange("eventTime", e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Common Venue & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Venue Name *</label>
                      <input
                        type="text"
                        value={formData.venue || ""}
                        onChange={(e) => handleFieldChange("venue", e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                        placeholder="Venue Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">Complete Address</label>
                      <input
                        type="text"
                        value={formData.address || formData.newHomeAddress || ""}
                        onChange={(e) => handleFieldChange(selectedCategory === "housewarming" ? "newHomeAddress" : "address", e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                        placeholder="Full Address"
                      />
                    </div>
                  </div>

                  {/* Scratch Card Secret Message */}
                  <div>
                    <label className="text-[9px] font-bold text-[#513321] uppercase block mb-1">
                      🪙 Scratch Card Reveal Secret Message
                    </label>
                    <input
                      type="text"
                      value={formData.revealedMessage || ""}
                      onChange={(e) => handleFieldChange("revealedMessage", e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#E9DCCB] rounded-lg text-xs font-semibold focus:border-amber-500 focus:outline-none"
                      placeholder="Message revealed when user rubs scratch foil..."
                    />
                  </div>

                  {/* Feature Toggles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#EFE5D8]">
                    {[
                      { field: "enableScratchCard", label: "Scratch Card", icon: "🪙" },
                      { field: "enableCountdown", label: "Countdown", icon: "⏳" },
                      { field: "enableRsvp", label: "RSVP", icon: "💌" },
                      { field: "enableGallery", label: "Gallery", icon: "🖼️" }
                    ].map(item => (
                      <label key={item.field} className="flex items-center space-x-1.5 p-2 rounded-lg border border-[#EFE5D8] bg-[#FDFBF7] cursor-pointer hover:bg-amber-50/50 transition">
                        <input
                          type="checkbox"
                          checked={formData[item.field] !== false}
                          onChange={(e) => handleFieldChange(item.field, e.target.checked)}
                          className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span className="text-[9.5px] font-extrabold text-[#513321] flex items-center space-x-1">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Actions Bar */}
              <div className="pt-3 border-t border-[#E9DCCB] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("select")}
                  className="px-4 py-2 rounded-xl border border-[#E9DCCB] text-[#513321] hover:bg-amber-100/60 font-bold text-xs transition cursor-pointer"
                >
                  ← Back to Categories
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-amber-500/20 active:scale-98 transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? "Syncing Drive..." : "✨"}</span>
                    <span>
                      {isSubmitting 
                        ? "Creating Draft..." 
                        : (selectedCategory === "wedding" ? "Create Wedding Invitation" : "Create Invitation Draft")}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

