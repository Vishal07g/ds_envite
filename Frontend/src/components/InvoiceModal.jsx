import React from 'react';
import { SvgX, SvgCheck, SvgSparkles, SvgExternalLink, SvgCopy, SvgHeart } from './icons';
import dbStore from '../data/store';

export default function InvoiceModal({ isOpen, onClose, order, invitation }) {
  if (!isOpen) return null;

  const targetObj = order || invitation || {};
  const config = targetObj.config || {};
  const details = targetObj.details || {};
  const brandSettings = dbStore.getBrandSettings();

  const customer = dbStore.getUserById(targetObj.customerId) || {};
  const preset = dbStore.getPresetById(targetObj.presetId);

  const basePrice = targetObj.price || config.price || 999;
  const discountPercent = targetObj.discountPercent !== undefined ? targetObj.discountPercent : (config.discountPercent !== undefined ? config.discountPercent : 0);
  const discountAmount = Math.round((basePrice * discountPercent) / 100);
  const finalPrice = Math.round(basePrice - discountAmount);

  const invoiceNo = `INV-${(targetObj.id || '2026').replace(/\D/g, '').slice(-6) || Date.now().toString().slice(-6)}`;
  const paymentDetails = targetObj.paymentDetails || {};
  const paidDate = paymentDetails.paidAt ? new Date(paymentDetails.paidAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in font-sans">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border border-amber-500/40 bg-slate-950 text-slate-100 space-y-6 shadow-2xl relative invoice-modal-container">
        
        {/* Close Button (Hidden on Print) */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer print:hidden"
          title="Close Invoice"
        >
          <SvgX className="w-5 h-5" />
        </button>

        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            {brandSettings?.logoUrl ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-500/40 bg-slate-900 shrink-0">
                <img src={brandSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/30">
                <SvgHeart className="w-5 h-5 text-amber-500" />
              </div>
            )}
            <div>
              <h2 className="font-cinzel text-lg font-bold text-amber-100 tracking-wider">
                {brandSettings?.brandName || "DS ENVITES"}
              </h2>
              <p className="text-[10px] text-amber-200/90 font-mono font-semibold">Official Payment Receipt &amp; Tax Invoice</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-widest inline-flex items-center space-x-1">
              <SvgCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>PAID &amp; VERIFIED</span>
            </span>
            <p className="text-xs font-mono font-bold text-amber-200 mt-1">{invoiceNo}</p>
            <p className="text-[10px] text-amber-200/90 font-mono font-semibold">{paidDate}</p>
          </div>
        </div>

        {/* Customer & Order Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-xs">
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-400 block mb-1">Billed To (Customer)</span>
            <p className="font-bold text-slate-100 text-sm">{customer.displayName || targetObj.userEmail || "Valued Customer"}</p>
            <p className="text-amber-100 font-mono text-[11px] font-medium">{customer.username || targetObj.userEmail || "customer@dsenvites.com"}</p>
            {details.contact && <p className="text-slate-200 text-[11px] font-medium mt-0.5">📞 {details.contact}</p>}
          </div>

          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-400 block mb-1">Invitation Reference</span>
            <p className="font-bold text-slate-100 text-sm">{targetObj.title || preset?.title || "Digital Wedding Invitation"}</p>
            <p className="text-amber-300 font-bold text-[11px]">💒 {details.brideName || config.brideName || "Bride"} &amp; {details.groomName || config.groomName || "Groom"}</p>
            <p className="text-slate-200 text-[11px] font-medium">Order ID: <span className="font-mono text-amber-200 font-bold">{targetObj.id || "ORD-LIVE"}</span></p>
          </div>
        </div>

        {/* Invoice Item Table */}
        <div className="border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-amber-300 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              <tr>
                <td className="p-3">
                  <p className="font-bold text-slate-100">Premium HD Digital Wedding Invitation (Watermark Removed)</p>
                  <p className="text-[10px] text-slate-200 font-medium mt-0.5">Includes full theme customization, live guest sharing link, RSVP tracker &amp; digital blessings wall.</p>
                </td>
                <td className="p-3 text-right font-mono font-bold text-amber-100">₹{basePrice}</td>
              </tr>
              {discountPercent > 0 && (
                <tr className="bg-emerald-500/5">
                  <td className="p-3 text-emerald-400 font-bold">
                    Special Discount ({discountPercent}% OFF)
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">-₹{discountAmount}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900/90 border-t border-slate-800">
                <td className="p-3 font-extrabold text-amber-300 uppercase tracking-wider text-xs">Total Amount Paid</td>
                <td className="p-3 text-right font-mono font-black text-amber-300 text-base">₹{finalPrice}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment Transaction Details */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/30 space-y-2 text-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">Payment Method &amp; Transaction Details</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-200 text-[11px]">
            <div>
              <span className="text-amber-300 block text-[9px] uppercase font-bold">Method</span>
              <span className="font-bold text-slate-100 uppercase">{paymentDetails.paymentMethod || "UPI (Google Pay / PhonePe)"}</span>
            </div>
            <div>
              <span className="text-amber-300 block text-[9px] uppercase font-bold">Payee</span>
              <span className="font-bold text-slate-100">DSTORY 3D / VISHAL GUPTA</span>
            </div>
            <div>
              <span className="text-amber-300 block text-[9px] uppercase font-bold">UTR / Txn Ref</span>
              <span className="font-bold font-mono text-amber-300">{paymentDetails.transactionRef || "TXN-VERIFIED-UPI"}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800 print:hidden">
          <p className="text-[10px] text-slate-200 italic font-medium">
            Watermark automatically removed. Thank you for choosing DS Envites!
          </p>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>🖨️ Print / Download Invoice PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
