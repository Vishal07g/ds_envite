import React, { useState } from 'react';
import { generateWeddingContent } from '../utils/aiGenerator';
import { SvgSparkles, SvgCopy, SvgCheck, SvgX, SvgSend, SvgHeart } from './icons';

export default function AiAssistantModal({ 
  isOpen, 
  onClose, 
  brideName = "Suman", 
  groomName = "Vishal", 
  religion = "secular",
  onApplyContent 
}) {
  const [activeTab, setActiveTab] = useState("poem"); // "poem" | "story" | "venue" | "whatsapp"
  const [style, setStyle] = useState("romantic");
  const [details, setDetails] = useState("");
  const [guestName, setGuestName] = useState("Dear Family & Friends");
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setCopied(false);
    try {
      const result = await generateWeddingContent({
        contentType: activeTab,
        brideName,
        groomName,
        style,
        religion,
        details,
        guestName
      });
      setGeneratedText(result);
    } catch (err) {
      console.error("Failed to generate content:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApply = (field) => {
    if (!generatedText || !onApplyContent) return;
    onApplyContent(field, generatedText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e1626] border border-amber-500/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-amber-500/10 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <SvgSparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-amber-100 flex items-center gap-2">
                AI Wedding Wording & Content Writer
              </h3>
              <p className="text-xs text-slate-400">Powered by Gemini AI Logic</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <SvgX className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-1.5 gap-1 text-xs font-semibold overflow-x-auto">
          {[
            { id: "poem", label: "📜 Sacred Poem / Quote" },
            { id: "story", label: "💖 Love Story Narrative" },
            { id: "venue", label: "📍 Venue & Dress Code" },
            { id: "whatsapp", label: "💬 WhatsApp Invite Msg" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setGeneratedText(""); }}
              className={`flex-1 py-2 px-3 rounded-lg transition whitespace-nowrap text-center ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-amber-300/90 mb-1 uppercase tracking-wider">
                Writing Tone / Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="romantic">💖 Deeply Romantic & Emotional</option>
                <option value="traditional">👑 Royal & Traditional</option>
                <option value="poetic">✨ Classic Poetic Verse</option>
                <option value="playful">🎉 Playful & Fun</option>
                <option value="royal">🏛 Dynasty & Imperial</option>
              </select>
            </div>

            {activeTab === "whatsapp" ? (
              <div>
                <label className="block text-xs font-semibold text-amber-300/90 mb-1 uppercase tracking-wider">
                  Guest Name Placeholder
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Uncle & Aunty / John"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-amber-300/90 mb-1 uppercase tracking-wider">
                  Couple Names
                </label>
                <div className="text-xs py-2 px-3 bg-slate-900/80 border border-slate-800 rounded-lg text-amber-200 font-cinzel">
                  {brideName} & {groomName}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-300/90 mb-1 uppercase tracking-wider">
              {activeTab === "story" ? "How You Met / Proposal Notes (Optional)" : "Special Instructions or Venue Details"}
            </label>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={
                activeTab === "story" 
                  ? "e.g. Met in college coffee shop, proposed during rain in Kyoto..." 
                  : activeTab === "venue"
                  ? "e.g. Black tie optional, sunset reception, valet available..."
                  : "e.g. Mention family blessings, traditional mandap..."
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Generating with Gemini AI...</span>
            ) : (
              <>
                <SvgSparkles className="w-4 h-4" />
                <span>Generate Wording</span>
              </>
            )}
          </button>

          {/* Generated Result Output */}
          {generatedText && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 relative space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-amber-300 font-semibold border-b border-slate-800 pb-2">
                <span>Generated Output Preview</span>
                <button 
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded transition text-[11px]"
                >
                  {copied ? <SvgCheck className="w-3.5 h-3.5 text-emerald-400" /> : <SvgCopy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-line font-serif italic bg-slate-950/60 p-3 rounded-lg border border-slate-800 max-h-48 overflow-y-auto">
                {generatedText}
              </div>

              {/* Action Buttons for applying content directly to invitation */}
              {onApplyContent && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {activeTab === "poem" && (
                    <>
                      <button
                        onClick={() => handleApply("introQuote")}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-lg text-xs font-semibold transition"
                      >
                        Apply to Intro Quote
                      </button>
                      <button
                        onClick={() => handleApply("customSacredVerse")}
                        className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 rounded-lg text-xs font-semibold transition"
                      >
                        Apply to Sacred Verse
                      </button>
                    </>
                  )}
                  {activeTab === "story" && (
                    <button
                      onClick={() => handleApply("storyParagraph")}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-lg text-xs font-semibold transition"
                    >
                      Apply to Love Story Section
                    </button>
                  )}
                  {activeTab === "whatsapp" && (
                    <button
                      onClick={() => handleApply("shareText")}
                      className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                    >
                      <SvgSend className="w-3.5 h-3.5" />
                      <span>Set Default Share Text</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
