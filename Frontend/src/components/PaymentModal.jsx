import React, { useState } from 'react';
import { SvgX, SvgCheck, SvgSparkles, SvgExternalLink, SvgCopy } from './icons';
import dbStore from '../data/store';

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  order, 
  invitation, 
  onPaymentSubmitted,
  showToast 
}) {
  if (!isOpen) return null;

  const targetObj = order || invitation || {};
  const config = targetObj.config || {};

  // Determine base price and discount
  const basePrice = targetObj.price || config.price || 999;
  const discountPercent = targetObj.discountPercent !== undefined ? targetObj.discountPercent : (config.discountPercent !== undefined ? config.discountPercent : 30);
  const discountedPrice = Math.round(basePrice * (1 - (discountPercent || 0) / 100));

  const [activeTab, setActiveTab] = useState('gpay'); // 'gpay' | 'phonepe'
  const [transactionRef, setTransactionRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const orderId = targetObj.id || targetObj.presetId || 'invite-demo';
  const targetTitle = targetObj.title || `${config.brideName || 'Bride'} & ${config.groomName || 'Groom'}'s Wedding`;

  const handleCopyUpi = (upiId) => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // Mark order / invitation as paid and set payment details in dbStore
      if (targetObj.id && targetObj.id !== 'demo') {
        dbStore.markOrderAsPaid(targetObj.id, {
          transactionRef: transactionRef.trim() || `TXN-${Date.now().toString().slice(-6)}`,
          paymentMethod: activeTab,
          amountPaid: discountedPrice
        });
      }

      setIsSubmitting(false);
      if (showToast) showToast(`Payment completed! Watermark has been automatically removed.`, 'success');
      if (onPaymentSubmitted) onPaymentSubmitted();
      if (onClose) onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in font-sans">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto p-5 sm:p-6 rounded-3xl border border-amber-500/40 bg-slate-950 text-slate-100 space-y-5 shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          title="Close Modal"
        >
          <SvgX className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="space-y-1 pr-6 text-center sm:text-left">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 flex items-center justify-center sm:justify-start space-x-1">
            <SvgSparkles className="w-3.5 h-3.5" />
            <span>Official UPI Payment QR</span>
          </span>
          <h2 className="font-cinzel text-xl font-bold text-slate-100 leading-snug">
            Unlock Full Invitation & Remove Watermark
          </h2>
          <p className="text-xs text-slate-200 font-medium">
            Scan using any UPI App (Google Pay / PhonePe). Watermark will be automatically removed once paid.
          </p>
        </div>

        {/* Pricing & Discount Card Section */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/35 flex items-center justify-between shadow-inner">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300">Total Invitation Price</p>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl font-black text-amber-100">₹{discountedPrice}</span>
              {discountPercent > 0 && (
                <span className="text-sm font-semibold text-slate-300 line-through">₹{basePrice}</span>
              )}
            </div>
            <p className="text-[10px] text-amber-200/90 font-semibold truncate max-w-[200px]">Design: {targetTitle}</p>
          </div>

          {discountPercent > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs uppercase tracking-wider text-center shadow">
              <span className="block text-[9px] text-emerald-400">Special Discount</span>
              <span>{discountPercent}% OFF</span>
            </div>
          )}
        </div>

        {/* Payment App Selector Tabs (Google Pay & PhonePe) */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('gpay')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                activeTab === 'gpay'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              <span>Google Pay</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('phonepe')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                activeTab === 'phonepe'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-md'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              <span>PhonePe</span>
            </button>
          </div>

          {/* QR Display Card */}
          <div className="p-4 rounded-2xl bg-white text-slate-900 space-y-3 shadow-xl text-center border border-amber-500/30">
            {activeTab === 'gpay' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2 text-xs font-bold text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Google Pay Accepted Here</span>
                </div>

                <div className="max-w-[240px] mx-auto p-2 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
                  <img 
                    src="/gpay_qr.jpg" 
                    alt="Google Pay QR Code" 
                    className="w-full h-auto rounded-lg object-contain"
                  />
                </div>

                <div className="pt-1 flex items-center justify-center space-x-2 text-xs font-semibold text-slate-700">
                  <span>UPI ID: <strong className="text-slate-900">gksvishalgupta@oksbi</strong></span>
                  <button
                    type="button"
                    onClick={() => handleCopyUpi("gksvishalgupta@oksbi")}
                    className="p-1 rounded hover:bg-slate-200 text-blue-600 transition"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <SvgCheck className="w-3.5 h-3.5 text-emerald-600" /> : <SvgCopy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">Payee: DSTORY 3D • Scan with GPay or any UPI app</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2 text-xs font-bold text-purple-900">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <span>PhonePe Accepted Here</span>
                </div>

                <div className="max-w-[240px] mx-auto p-2 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
                  <img 
                    src="/phonepe_qr.jpg" 
                    alt="PhonePe QR Code" 
                    className="w-full h-auto rounded-lg object-contain"
                  />
                </div>

                <div className="pt-1 text-xs font-bold text-slate-800">
                  Payee: VISHAL GUPTA
                </div>
                <p className="text-[10px] text-slate-500">Scan & Pay using PhonePe App or any UPI app</p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Reference & Complete Payment Form */}
        <form onSubmit={handleSubmitPayment} className="space-y-3 pt-1">
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 block mb-1">
              Transaction Ref / UTR No. (Optional)
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. 426801938501 or UPI Txn ID"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs focus:outline-none focus:border-amber-500 text-slate-100"
            />
          </div>

          <div className="pt-1 flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Processing Payment...</span>
              ) : (
                <>
                  <SvgCheck className="w-4 h-4 text-slate-950 font-bold" />
                  <span>I Have Paid ₹{discountedPrice} (Remove Watermark)</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
