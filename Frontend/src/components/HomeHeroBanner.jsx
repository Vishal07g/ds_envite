import React from 'react';
import { SvgSparkles, SvgBookOpen, SvgHeart, SvgVolume2, SvgEye, SvgCalendar, SvgCheck } from './icons';
import { INVITATION_CATEGORIES } from '../data/invitationCategoriesData';

export default function HomeHeroBanner({ 
  onDraftClick, 
  onExploreClick, 
  selectedCategory = "all", 
  onSelectCategory 
}) {
  return (
    <div className="w-full space-y-6">
      {/* ====================================================
          MAIN LUXURY HERO SHOWCASE CONTAINER
          ==================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E9DCCB] bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E8] to-[#FFF8EE] shadow-xl p-6 sm:p-10 lg:p-12 transition-all">
        
        {/* Ambient Decorative Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-400/8 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Delicate Corner Floral Filigree Watermarks */}
        <div className="absolute top-4 left-4 text-[#C49A4A]/20 pointer-events-none text-2xl select-none">
          ✤
        </div>
        <div className="absolute top-4 right-4 text-[#C49A4A]/20 pointer-events-none text-2xl select-none">
          ✤
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Inspiring Copy, Perks & CTAs */}
          <div className="w-full lg:w-7/12 text-left space-y-5">
            
            {/* Top Micro-Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-[11px] font-extrabold uppercase tracking-widest shadow-xs">
              <span className="text-amber-600 animate-pulse">✨</span>
              <span>Next-Gen Interactive Digital Invitations</span>
            </div>

            {/* Main Headline with Cinzel Typography & Warm Espresso Palette */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-cinzel font-black tracking-tight text-[#513321] leading-[1.18]">
              Craft Unforgettable Moments with{' '}
              <span className="bg-gradient-to-r from-[#AC853B] via-[#C49A4A] to-[#8C5D2C] bg-clip-text text-transparent">
                Interactive Luxury
              </span>
            </h1>

            {/* High-Contrast, Crystal Clear Subheading */}
            <p className="text-sm sm:text-base text-[#5C524B] font-medium leading-relaxed max-w-xl">
              Delight your guests with animated wax-sealed envelopes, interactive gold scratch reveals, curated background melodies, HD memories galleries, and instant WhatsApp RSVPs — all without downloading any apps.
            </p>

            {/* 4 Interactive Feature Cards (2x2 Grid) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1 max-w-lg">
              <div className="flex items-center space-x-3 p-2.5 sm:p-3 rounded-2xl bg-[#FFFEFB] border border-[#E9DCCB] shadow-xs hover:border-[#C49A4A]/60 transition-colors">
                <span className="w-9 h-9 rounded-xl bg-[#FBF3EA] border border-[#E9DCCB] flex items-center justify-center text-lg shrink-0 shadow-xs">
                  💌
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#513321] truncate">Wax-Seal Unboxing</p>
                  <p className="text-[10px] text-[#8C6D58] truncate">Realistic envelope ritual</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2.5 sm:p-3 rounded-2xl bg-[#FFFEFB] border border-[#E9DCCB] shadow-xs hover:border-[#C49A4A]/60 transition-colors">
                <span className="w-9 h-9 rounded-xl bg-[#FBF3EA] border border-[#E9DCCB] flex items-center justify-center text-lg shrink-0 shadow-xs">
                  🪙
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#513321] truncate">Gold Scratch Reveal</p>
                  <p className="text-[10px] text-[#8C6D58] truncate">Interactive surprise date</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2.5 sm:p-3 rounded-2xl bg-[#FFFEFB] border border-[#E9DCCB] shadow-xs hover:border-[#C49A4A]/60 transition-colors">
                <span className="w-9 h-9 rounded-xl bg-[#FBF3EA] border border-[#E9DCCB] flex items-center justify-center text-lg shrink-0 shadow-xs">
                  🎵
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#513321] truncate">Background Melodies</p>
                  <p className="text-[10px] text-[#8C6D58] truncate">Curated music vibes</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2.5 sm:p-3 rounded-2xl bg-[#FFFEFB] border border-[#E9DCCB] shadow-xs hover:border-[#C49A4A]/60 transition-colors">
                <span className="w-9 h-9 rounded-xl bg-[#FBF3EA] border border-[#E9DCCB] flex items-center justify-center text-lg shrink-0 shadow-xs">
                  📱
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#513321] truncate">Instant WhatsApp RSVP</p>
                  <p className="text-[10px] text-[#8C6D58] truncate">One-click guest tracker</p>
                </div>
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onDraftClick}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D6AD61] to-[#C49A4A] hover:from-[#C49A4A] hover:to-[#AC853B] text-[#382416] hover:text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 cursor-pointer active:scale-98"
              >
                <SvgSparkles className="w-4 h-4 text-white shrink-0" />
                <span>+ Draft Your Invitation</span>
              </button>

              <button
                type="button"
                onClick={onExploreClick}
                className="px-5 py-3 rounded-xl bg-[#FFFEFB] hover:bg-[#F7EFE5] text-[#513321] border border-[#E9DCCB] hover:border-[#C49A4A] font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center space-x-2 cursor-pointer active:scale-98"
              >
                <span>Browse Design Presets</span>
                <span className="text-sm">↓</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Realistic Luxury Invitation Card & Wax Seal Graphic */}
          <div className="w-full lg:w-5/12 flex items-center justify-center pt-4 lg:pt-0">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] perspective-1000">
              
              {/* Floating Live Badge Top */}
              <div className="absolute -top-3 -right-2 z-30 bg-[#FFFEFB]/95 backdrop-blur-md border border-[#E9DCCB] px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5 animate-bounce">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span className="text-[10px] font-bold text-[#513321] uppercase tracking-wider">
                  📱 100% Mobile Ready
                </span>
              </div>

              {/* Realistic Luxury Envelope Body */}
              <div className="relative rounded-2xl bg-gradient-to-b from-[#FAF1E6] via-[#F3E5D4] to-[#EBD5BF] border-2 border-[#D6AD61] shadow-2xl p-5 overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
                
                {/* Envelope Flap Triangular Accent */}
                <div 
                  className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#E7D0B7] to-transparent opacity-40 pointer-events-none"
                  style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                />

                {/* Golden Monogram Wax Seal Stamp Centered */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 w-14 h-14 rounded-full bg-gradient-to-tr from-[#9B2226] via-[#AE2012] to-[#BB3E03] border-2 border-[#FEEA8C] shadow-xl flex flex-col items-center justify-center text-white ring-4 ring-[#9B2226]/30">
                  <span className="text-[10px] font-cinzel font-black tracking-widest text-[#FFF1BD]">DS</span>
                  <span className="text-[8px] text-[#FFE89E] opacity-90 leading-none">✦</span>
                </div>

                {/* Emerging Invitation Card Inside Envelope */}
                <div className="relative mt-8 rounded-xl bg-[#FFFDF9] border border-[#E9DCCB] shadow-inner p-4 text-center space-y-3">
                  
                  {/* Card Filigree Top Header */}
                  <div className="flex items-center justify-center space-x-2 text-[#C49A4A]">
                    <span className="text-xs">✦</span>
                    <span className="text-[8.5px] uppercase font-bold tracking-widest text-[#8C6D58]">
                      A Sacred Matrimonial Union
                    </span>
                    <span className="text-xs">✦</span>
                  </div>

                  {/* Couple Names in Elegant Serif Calligraphy */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-cinzel font-bold text-[#513321] leading-tight">
                      Vivaan &amp; Aarohi
                    </h3>
                    <p className="text-[10px] text-[#8C6D58] font-medium mt-0.5">
                      Request the honor of your presence
                    </p>
                  </div>

                  {/* Golden Scratch & Reveal Interactive Simulation Badge */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#D6AD61] via-[#F3D590] to-[#C49A4A] p-2.5 shadow-md border border-[#C49A4A] text-center cursor-pointer group">
                    <div className="flex items-center justify-center space-x-1.5 text-[#382416] font-bold text-[11px] uppercase tracking-wider">
                      <span>✨</span>
                      <span>Scratch to Reveal Secret Date</span>
                      <span>✨</span>
                    </div>
                    <div className="text-[9px] text-[#5C3D1E] font-medium opacity-90 mt-0.5">
                      Saturday, December 19, 2026 • 11:30 AM
                    </div>
                  </div>

                  {/* Live Music & RSVP Mini Bar */}
                  <div className="flex items-center justify-between text-[9px] font-bold text-[#513321] pt-1 border-t border-[#E9DCCB]">
                    <span className="flex items-center space-x-1 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      <span>🎵 Royal Melody</span>
                    </span>
                    <span className="text-amber-800 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/25">
                      ⚡ RSVP Online
                    </span>
                  </div>
                </div>

                {/* Floating Bottom Left Security / Quality Capsule */}
                <div className="mt-3 flex items-center justify-center space-x-2 text-[9.5px] text-[#6C6B70] font-semibold">
                  <span>🔒 Watermark-Free HD Quality</span>
                  <span>•</span>
                  <span>⚡ Instant Link Share</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

          </div>
  );
}