import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import dbStore from '../data/store';
import InvitationRenderer from '../components/InvitationRenderer';

export default function PrintInvitationView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    // 1. Try reading live in-memory config saved during export click
    let activeConfig = null;
    const sessionConfig = sessionStorage.getItem("invitation_print_config");
    if (sessionConfig) {
      try {
        activeConfig = JSON.parse(sessionConfig);
      } catch (e) {
        console.error("Failed to parse session print config", e);
      }
    }

    // 2. If not in session, load from database by ID
    if (!activeConfig) {
      if (id && id !== "demo") {
        const inv = dbStore.getInvitationById(id);
        if (inv) activeConfig = inv.config;
      }
    }

    // 3. Fallback to default invitation / presets
    if (!activeConfig) {
      const invs = dbStore.getInvitations();
      if (invs && invs.length > 0) activeConfig = invs[0].config;
      else {
        const presets = dbStore.getPresets();
        activeConfig = presets[0]?.config || {};
      }
    }

    setConfig(activeConfig);

    // Update document title for the saved PDF filename
    const bName = activeConfig?.brideName || activeConfig?.coverBrideText || "Wedding";
    const gName = activeConfig?.groomName || activeConfig?.coverGroomText || "Invitation";
    document.title = `${bName} & ${gName} - Wedding Invitation`;

    // Trigger browser print dialog after fonts and graphics have initialized
    const printTimer = setTimeout(() => {
      window.print();
    }, 1000);

    return () => clearTimeout(printTimer);
  }, [id]);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-amber-300 font-serif">
        <span className="text-sm tracking-wider">Preparing your luxury wedding invitation printable design...</span>
      </div>
    );
  }

  return (
    <div className="printable-invitation-container min-h-screen relative bg-transparent">
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .global-border-overlay {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 10 !important;
          }
          section {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Non-printing Floating Action Bar */}
      <div className="no-print fixed top-4 right-4 z-50 flex items-center gap-2.5 bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-500/40 shadow-2xl">
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
          title="Print as PDF"
        >
          <span>🖨️ Save as PDF / Print</span>
        </button>
        <button
          type="button"
          onClick={() => window.close()}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-white/10 transition cursor-pointer"
          title="Close Print Preview"
        >
          ✕ Close
        </button>
      </div>

      {/* Render the EXACT same invitation with isPrintMode */}
      <InvitationRenderer
        config={config}
        isPrintMode={true}
        showEnvelopeFirst={false}
      />
    </div>
  );
}
