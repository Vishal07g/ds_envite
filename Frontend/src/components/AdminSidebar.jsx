import React, { useState, useEffect, useRef } from 'react';
import { hexToRgb, rgbToHex, compressImage, parseColor, rgbaToCss } from '../utils/helpers';
import dbStore, { CURATED_MUSIC_PRESETS, CURATED_CLIPARTS } from '../data/store';
import CustomDialog from './CustomDialog';
import TimelineEditorDrawer from './TimelineEditorDrawer';
import { 
  SvgX, SvgHeart, SvgSettings, SvgSparkles, SvgCalendar, 
  SvgMapPin, SvgUsers, SvgMessageSquare, SvgSliders, 
  SvgBookOpen, SvgAward, SvgLayers, SvgCheck, SvgEye,
  SvgVolume2, SvgVolumeX
} from './icons';

const RELIGIONS = {
  secular: {
    name: "Classic / Love Symbol",
    symbol: "❤",
    verse: "“And now these three remain: faith, hope and love. But the greatest of these is love.”"
  },
  hindu: {
    name: "Hindu (Ganesha / Om)",
    symbol: "🕉 Sri Ganeshay Namah",
    verse: "“Vakratunda Mahakaya Suryakoti Samaprabha, Nirvighnam Kuru Me Deva Sarvakaryeshu Sarvada.”"
  },
  christian: {
    name: "Christian (Holy Cross)",
    symbol: "✝",
    verse: "“Love is patient, love is kind. It does not envy, it does not boast, it is not proud.” - 1 Corinthians 13:4"
  },
  islamic: {
    name: "Islamic (Bismillah / Crescent)",
    symbol: "☪ Bismillah-ir-Rahman-ir-Rahim",
    verse: "“And We created you in pairs.” - Noble Quran [78:8]"
  },
  sikh: {
    name: "Sikhism (Khanda)",
    symbol: "☬ Ek Onkar",
    verse: "“They are not said to be husband and wife, who merely sit together. Rather they are one soul in two bodies.”"
  },
  jewish: {
    name: "Jewish (Star of David)",
    symbol: "✡",
    verse: "“I am my beloved’s and my beloved is mine.” - Song of Solomon 6:3"
  },
  buddhist: {
    name: "Buddhist (Sacred Lotus)",
    symbol: "☸",
    verse: "“In the sky, there is no distinction of east and west; people create distinctions out of their own minds and then believe them to be true.”"
  }
};

const FONTS = [
  { id: "font-serif", label: "Elegant Serif (Playfair)" },
  { id: "font-cormorant", label: "Luxury Serif (Cormorant Garamond)" },
  { id: "font-cinzel", label: "Classic Serif (Cinzel)" },
  { id: "font-cinzel-dec", label: "Decorative Serif (Cinzel Dec)" },
  { id: "font-italiana", label: "Minimalist Luxury (Italiana)" },
  { id: "font-cursive", label: "Cursive (Great Vibes)" },
  { id: "font-alex", label: "Calligraphy (Alex Brush)" },
  { id: "font-pinyon", label: "Royal Script (Pinyon)" },
  { id: "font-playball", label: "Festive Script (Playball)" },
  { id: "font-sans", label: "Modern Sans (Inter)" },
  { id: "font-yatra", label: "Yatra One (Devanagari)" },
  { id: "font-rozha", label: "Rozha One (Devanagari)" },
  { id: "font-teko", label: "Teko (Devanagari)" },
  { id: "font-messiri", label: "El Messiri" },
  { id: "font-reem", label: "Reem Kufi" },
  { id: "font-aref", label: "Aref Ruqaa" },
  { id: "font-marcellus", label: "Marcellus" }
];

const CustomFontSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [originalValue, setOriginalValue] = useState(value);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        // Restore original value when clicking outside
        if (value !== originalValue) {
          onChange(originalValue);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, originalValue, onChange]);

  const handleOpen = () => {
    setOriginalValue(value);
    setIsOpen(true);
  };

  const handleSelect = (val) => {
    setOriginalValue(val);
    onChange(val);
    setIsOpen(false);
  };

  const handleHover = (val) => {
    onChange(val);
  };

  const handleMouseLeaveOptions = () => {
    onChange(originalValue);
  };

  const selectedOption = options.find(o => o.id === value);
  const label = selectedOption ? selectedOption.label : "Default";

  return (
    <div 
      ref={dropdownRef} 
      className={`relative w-full transition-all custom-select-wrapper ${isOpen ? 'z-[99999] isolate' : 'z-10'}`}
    >
      <button
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        className="w-full px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-left flex justify-between items-center cursor-pointer font-sans shadow-sm transition-colors custom-select-trigger"
        style={{
          backgroundColor: '#FFFFFF',
          color: '#513321',
          border: '1px solid #E9DCCB'
        }}
      >
        <span className={`truncate ${value || ""}`} style={{ color: '#513321' }}>{label}</span>
        <span className="text-[8px] font-bold ml-1" style={{ color: '#C49A4A' }}>▼</span>
      </button>

      {isOpen && (
        <div 
          className="absolute z-[999999] left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl shadow-xl custom-scrollbar custom-select-dropdown-animate"
          style={{
            backgroundColor: '#FFFEFB',
            border: '1.5px solid #E9DCCB',
            boxShadow: '0 8px 24px rgba(104, 71, 45, 0.12)'
          }}
          onMouseLeave={handleMouseLeaveOptions}
        >
          <div
            onClick={() => handleSelect("")}
            onMouseEnter={() => handleHover("")}
            className="px-3 py-2 text-[10.5px] font-semibold transition-colors cursor-pointer font-sans custom-select-item"
            style={{
              color: value === "" ? '#8D414D' : '#513321',
              backgroundColor: value === "" ? '#F9E8E5' : 'transparent',
              fontWeight: value === "" ? 800 : 600
            }}
          >
            Default
          </div>
          {options.map(f => {
            const isSelected = value === f.id;
            return (
              <div
                key={f.id}
                onClick={() => handleSelect(f.id)}
                onMouseEnter={() => handleHover(f.id)}
                className={`px-3 py-2 text-[10.5px] font-semibold transition-colors cursor-pointer ${f.id} custom-select-item`}
                style={{
                  color: isSelected ? '#8D414D' : '#513321',
                  backgroundColor: isSelected ? '#F9E8E5' : 'transparent',
                  fontWeight: isSelected ? 800 : 600
                }}
              >
                {f.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CustomSelect = ({ value, onChange, options, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      return { value: String(opt.value ?? opt.id ?? ''), label: String(opt.label ?? opt.name ?? '') };
    }
    return { value: String(opt), label: String(opt) };
  });

  const selectedOption = normalizedOptions.find(o => o.value === String(value));
  const displayLabel = selectedOption ? selectedOption.label : String(value || "Select...");

  return (
    <div 
      ref={dropdownRef} 
      className={`relative w-full font-sans transition-all custom-select-wrapper ${isOpen ? 'z-[99999] isolate' : 'z-10'}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-left flex justify-between items-center cursor-pointer transition-all custom-select-trigger ${className}`}
        style={{
          backgroundColor: '#FFFFFF',
          color: '#513321',
          border: '1px solid #E9DCCB'
        }}
      >
        <span className="truncate" style={{ color: '#513321' }}>{displayLabel}</span>
        <span className="text-[8px] font-bold ml-1" style={{ color: '#C49A4A' }}>▼</span>
      </button>

      {isOpen && (
        <div 
          className="absolute z-[999999] left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl shadow-xl custom-scrollbar custom-select-dropdown-animate"
          style={{
            backgroundColor: '#FFFEFB',
            border: '1.5px solid #E9DCCB',
            boxShadow: '0 8px 24px rgba(104, 71, 45, 0.12)'
          }}
        >
          {normalizedOptions.map(opt => {
            const isSelected = String(value) === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className="px-3 py-2 text-[10.5px] font-semibold transition-colors cursor-pointer select-none custom-select-item"
                style={{
                  color: isSelected ? '#8D414D' : '#513321',
                  backgroundColor: isSelected ? '#F9E8E5' : 'transparent',
                  fontWeight: isSelected ? 800 : 600
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function AdminSidebar({ 
  config, 
  onChangeField, 
  onAiImageGen, 
  isGeneratingImg, 
  onClose,
  customers = [],
  assignedCustomerId,
  onAssignCustomer,
  isPaid,
  onChangePaymentStatus,
  status,
  onChangeStatus,
  isAdmin = true,
  onSave
}) {
  const [activeTab, setActiveTab] = useState("cover");
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [isTabDropdownOpen, setIsTabDropdownOpen] = useState(false);
  const [activeElementField, setActiveElementField] = useState(null);
  const dropdownRef = React.useRef(null);
  const testAudioRef = React.useRef(null);
  const [testAudioPlaying, setTestAudioPlaying] = useState(false);
  const testStartingAudioRef = React.useRef(null);
  const [testStartingAudioPlaying, setTestStartingAudioPlaying] = useState(false);
  const [bgPresets, setBgPresets] = useState(() => dbStore.getBgPresets());
  const [envelopePresets, setEnvelopePresets] = useState(() => dbStore.getEnvelopePresets());
  const [envelopeTextures, setEnvelopeTextures] = useState(() => dbStore.getEnvelopeTextures());
  const [musicPresets, setMusicPresets] = useState(() => dbStore.getMusicPresets());
  const [showAddMusicModal, setShowAddMusicModal] = useState(false);
  const [newMusicForm, setNewMusicForm] = useState({ title: '', artist: '', category: 'Wedding Classic', url: '' });
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("google_ai_apikey") || "");
  const [dialog, setDialog] = useState({ show: false, type: 'alert', message: '', onConfirm: null, onCancel: null });

  const triggerDialog = (options) => {
    setDialog({
      show: true,
      type: options.type || 'alert',
      title: options.title || 'System Message',
      message: options.message || '',
      inputValue: options.defaultValue || '',
      inputPlaceholder: options.placeholder || 'Type here...',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      onConfirm: (val) => {
        setDialog(prev => ({ ...prev, show: false }));
        options.onConfirm && options.onConfirm(val);
      },
      onCancel: () => {
        setDialog(prev => ({ ...prev, show: false }));
        options.onCancel && options.onCancel();
      }
    });
  };

  useEffect(() => {
    let timer = null;
    const handleScrollToSection = (e) => {
      if (isScrollLocked) return;
      const tabId = e.detail;
      if (tabId && tabId !== activeTab) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          setActiveTab(tabId);
        }, 160);
      }
    };
    window.addEventListener('invitationScrollToSection', handleScrollToSection);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('invitationScrollToSection', handleScrollToSection);
    };
  }, [activeTab, isScrollLocked]);

  useEffect(() => {
    const handleSync = () => {
      setBgPresets(dbStore.getBgPresets());
      setEnvelopePresets(dbStore.getEnvelopePresets());
      setEnvelopeTextures(dbStore.getEnvelopeTextures());
      setMusicPresets(dbStore.getMusicPresets());
    };
    window.addEventListener("db_synced", handleSync);
    return () => window.removeEventListener("db_synced", handleSync);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsTabDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    window.dispatchEvent(new CustomEvent('adminSelectTab', { detail: tabId }));
  };


  const renderShadowControlBlock = (sectionName, prefix, defaultColor = "rgba(0,0,0,0.3)") => {
    const isEnabled = config[`${prefix}ShadowEnabled`] !== false;
    const blurVal = config[`${prefix}ShadowBlur`] !== undefined ? config[`${prefix}ShadowBlur`] : 20;
    const yVal = config[`${prefix}ShadowY`] !== undefined ? config[`${prefix}ShadowY`] : 8;
    const spreadVal = config[`${prefix}ShadowSpread`] !== undefined ? config[`${prefix}ShadowSpread`] : -4;

    return (
      <div className="p-3.5 bg-[#FFFEFB] rounded-xl border border-[#E9DCCB] space-y-3 mt-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-extrabold text-[#513321] block uppercase tracking-wider">{sectionName} Card Shadow</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={isEnabled}
              onChange={(e) => onChangeField(`${prefix}ShadowEnabled`, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-[#E6DED5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#FFFFFF] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#FFFFFF] after:border-[#E9DCCB] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#D6AD61]"></div>
          </label>
        </div>

        {isEnabled && (
          <div className="space-y-3 pt-2.5 border-t border-[#EEE4D9]">
            {renderRgbaControlSelfParsed("Shadow Color & Opacity", `${prefix}ShadowColor`, defaultColor)}
            
            <div className="grid grid-cols-3 gap-2.5 bg-[#F7EFE5] p-2.5 rounded-xl border border-[#E9DCCB]">
              <div>
                <label className="text-[9px] font-extrabold uppercase text-[#513321] block mb-0.5">Blur (px)</label>
                <input 
                  type="range" min="0" max="60" step="1"
                  value={blurVal}
                  onChange={(e) => onChangeField(`${prefix}ShadowBlur`, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#E6DED5] rounded-lg appearance-none cursor-pointer accent-[#D6AD61]"
                />
                <div className="text-right text-[9px] text-[#513321] font-mono font-bold mt-0.5">
                  {blurVal}px
                </div>
              </div>
              
              <div>
                <label className="text-[9px] font-extrabold uppercase text-[#513321] block mb-0.5">Offset Y</label>
                <input 
                  type="range" min="-10" max="30" step="1"
                  value={yVal}
                  onChange={(e) => onChangeField(`${prefix}ShadowY`, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#E6DED5] rounded-lg appearance-none cursor-pointer accent-[#D6AD61]"
                />
                <div className="text-right text-[9px] text-[#513321] font-mono font-bold mt-0.5">
                  {yVal}px
                </div>
              </div>

              <div>
                <label className="text-[9px] font-extrabold uppercase text-[#513321] block mb-0.5">Spread</label>
                <input 
                  type="range" min="-15" max="15" step="1"
                  value={spreadVal}
                  onChange={(e) => onChangeField(`${prefix}ShadowSpread`, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#E6DED5] rounded-lg appearance-none cursor-pointer accent-[#D6AD61]"
                />
                <div className="text-right text-[9px] text-[#513321] font-mono font-bold mt-0.5">
                  {spreadVal}px
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const applyThemePreset = (presetId) => {
    switch (presetId) {
      case 'floral_pink':
        onChangeField('heroImage', '/bg_floral_pink.jpg');
        onChangeField('primaryColor', '#fdfbf7'); // Warm cream
        onChangeField('accentGold', '#b89254'); // Muted gold
        onChangeField('lightBgColor', '#faf6f0'); // Warm paper
        // Cover taglines and names
        onChangeField('coverTopTaglineColor', '#8a2b3f'); // Deep rose/burgundy
        onChangeField('coverSubheadingColor', '#4a4a4a'); // Charcoal grey
        onChangeField('coverBrideColor', '#8a2b3f'); // Deep rose
        onChangeField('coverAmpersandColor', '#b89254'); // Gold
        onChangeField('coverGroomColor', '#8a2b3f'); // Deep rose
        onChangeField('coverQuoteColor', '#4a4a4a'); // Charcoal
        onChangeField('coverBottomTaglineColor', '#8a2b3f'); // Deep rose
        onChangeField('coverBottomTaglineBg', 'rgba(253, 251, 247, 0.7)');
        // Fonts
        onChangeField('coverBrideFont', 'font-serif');
        onChangeField('coverGroomFont', 'font-serif');
        onChangeField('coverAmpersandFont', 'font-cursive');
        // Custom Inner/Outer borders
        onChangeField('coverBorderColor', '#b89254');
        onChangeField('coverInnerBorderColor', 'rgba(184, 146, 84, 0.15)');
        // Buttons
        onChangeField('glassBtnBg', 'rgba(138, 43, 63, 0.08)');
        onChangeField('glassBtnBorder', 'rgba(184, 146, 84, 0.4)');
        onChangeField('glassBtnText', '#8a2b3f');
        onChangeField('glassBtnShadow', 'rgba(184, 146, 84, 0.15)');
        break;
        
      case 'floral_dark':
        onChangeField('heroImage', '/bg_floral_dark.jpg');
        onChangeField('primaryColor', '#0b1329'); // Luxurious deep navy blue
        onChangeField('accentGold', '#e5b858'); // Bright luxury gold
        onChangeField('lightBgColor', '#fcf8f2');
        // Cover taglines and names
        onChangeField('coverTopTaglineColor', '#e5b858');
        onChangeField('coverSubheadingColor', '#ffffff');
        onChangeField('coverBrideColor', '#ffffff');
        onChangeField('coverAmpersandColor', '#e5b858');
        onChangeField('coverGroomColor', '#ffffff');
        onChangeField('coverQuoteColor', '#e2e8f0');
        onChangeField('coverBottomTaglineColor', '#e5b858');
        onChangeField('coverBottomTaglineBg', 'rgba(11, 19, 41, 0.75)');
        // Fonts
        onChangeField('coverBrideFont', 'font-cinzel');
        onChangeField('coverGroomFont', 'font-cinzel');
        onChangeField('coverAmpersandFont', 'font-cursive');
        // Custom Inner/Outer borders
        onChangeField('coverBorderColor', '#e5b858');
        onChangeField('coverInnerBorderColor', 'rgba(229, 184, 88, 0.2)');
        // Buttons
        onChangeField('glassBtnBg', 'rgba(255, 255, 255, 0.1)');
        onChangeField('glassBtnBorder', 'rgba(229, 184, 88, 0.45)');
        onChangeField('glassBtnText', '#ffffff');
        onChangeField('glassBtnShadow', 'rgba(229, 184, 88, 0.4)');
        break;
        
      case 'lace_green':
        onChangeField('heroImage', '/bg_lace_green.jpg');
        onChangeField('primaryColor', '#edf5f1'); // Minty soft background
        onChangeField('accentGold', '#d47685'); // Satin rose pink
        onChangeField('lightBgColor', '#fafcfb');
        // Cover taglines and names
        onChangeField('coverTopTaglineColor', '#3c6e5c'); // Sage green
        onChangeField('coverSubheadingColor', '#555555');
        onChangeField('coverBrideColor', '#d47685'); // Satin rose pink
        onChangeField('coverAmpersandColor', '#3c6e5c'); // Sage green
        onChangeField('coverGroomColor', '#d47685'); // Satin rose pink
        onChangeField('coverQuoteColor', '#555555');
        onChangeField('coverBottomTaglineColor', '#3c6e5c');
        onChangeField('coverBottomTaglineBg', 'rgba(237, 245, 241, 0.7)');
        // Fonts
        onChangeField('coverBrideFont', 'font-cursive');
        onChangeField('coverGroomFont', 'font-cursive');
        onChangeField('coverAmpersandFont', 'font-serif');
        // Custom Inner/Outer borders
        onChangeField('coverBorderColor', '#d47685');
        onChangeField('coverInnerBorderColor', 'rgba(212, 118, 133, 0.15)');
        // Buttons
        onChangeField('glassBtnBg', 'rgba(212, 118, 133, 0.08)');
        onChangeField('glassBtnBorder', 'rgba(212, 118, 133, 0.35)');
        onChangeField('glassBtnText', '#d47685');
        onChangeField('glassBtnShadow', 'rgba(212, 118, 133, 0.15)');
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    const handleSelectElement = (e) => {
      const detail = e.detail;
      let targetTab = null;
      let targetField = null;
      
      if (typeof detail === 'string') {
        if (detail === 'cover' || detail === 'religion') targetTab = 'cover';
        else if (detail === 'hero' || detail === 'story') targetTab = 'media';
        else if (detail === 'couple' || detail === 'details') targetTab = 'couple';
        else if (detail === 'envelope') targetTab = 'envelope';
        else if (detail === 'colors') targetTab = 'colors';
        else if (detail === 'layout') targetTab = 'layout';
      } else if (detail && typeof detail === 'object') {
        let fieldKey = detail.field;
        if (detail.tabId === 'couple') {
          targetTab = 'couple';
          if (fieldKey === 'brideName') fieldKey = 'storyBrideName';
          if (fieldKey === 'brideFamily') fieldKey = 'storyBrideFamily';
          if (fieldKey === 'groomName') fieldKey = 'storyGroomName';
          if (fieldKey === 'groomFamily') fieldKey = 'storyGroomFamily';
          if (fieldKey === 'storyParagraph') fieldKey = 'storyParagraph';
        } else {
          if (fieldKey === 'brideName') fieldKey = 'coverBrideText';
          if (fieldKey === 'groomName') fieldKey = 'coverGroomText';
          if (fieldKey === 'introQuote') fieldKey = 'coverQuoteText';
          targetTab = (detail.tabId === 'religion' || fieldKey?.startsWith('cover') || fieldKey?.startsWith('customSacred')) ? 'cover' : detail.tabId;
        }
        targetField = fieldKey;
      }
      
      if (targetTab) {
        handleTabClick(targetTab);
        if (targetField) {
          setActiveElementField(targetField);
          // Wait briefly for tab transition / DOM updates
          setTimeout(() => {
            const element = document.querySelector(`[id="element-tool-${targetField}"], [name="${targetField}"], #${targetField}, [id*="${targetField}"]`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              
              // Apply dynamic highlight outline
              const originalStyle = element.style.outline;
              element.style.outline = '3px solid rgba(245, 158, 11, 0.9)';
              element.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.6)';
              element.style.transition = 'all 0.3s ease';
              element.focus?.();
              
              setTimeout(() => {
                element.style.outline = originalStyle;
                element.style.boxShadow = '';
              }, 2200);
            }
          }, 150);
        }
      }
    };
    window.addEventListener('adminSelectElement', handleSelectElement);
    return () => window.removeEventListener('adminSelectElement', handleSelectElement);
  }, []);

  const handleApiKeyChange = (val) => {
    setApiKey(val);
    localStorage.setItem("google_ai_apikey", val);
  };
  const handleReligionChange = (key) => {
    const rel = RELIGIONS[key];
    if (rel) {
      onChangeField("religionKey", key);
      onChangeField("customSacredVerse", rel.verse);
      onChangeField("customSacredSymbol", rel.symbol);
    }
  };

  const handleFileChange = async (field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const rawDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      onChangeField(field, rawDataUrl);
    } catch (err) {
      console.error("Error reading file:", err);
    }
  };

  const handleMultipleFilesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    let filesUploadedCount = 0;
    for (let idx = 1; idx <= 10; idx++) {
      if (filesUploadedCount >= files.length) break;
      if (!config[`galleryImage${idx}`]) {
        const file = files[filesUploadedCount];
        try {
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          onChangeField(`galleryImage${idx}`, dataUrl);
          if (!config[`galleryCaption${idx}`]) {
            onChangeField(`galleryCaption${idx}`, file.name.replace(/\.[^/.]+$/, ""));
          }
          if (!config[`galleryFrameShape${idx}`]) {
            onChangeField(`galleryFrameShape${idx}`, "portrait");
          }
          if (!config[`galleryFrameBorder${idx}`]) {
            onChangeField(`galleryFrameBorder${idx}`, "double-gilded");
          }
        } catch (err) {
          console.error("Error reading file:", err);
        }
        filesUploadedCount++;
      }
    }
    e.target.value = "";
  };

  const primaryParsed = parseColor(config.primaryColor || "#0b1329");
  const primaryHex = rgbToHex(primaryParsed.r, primaryParsed.g, primaryParsed.b);

  const accentParsed = parseColor(config.accentGold || "#f59e0b");
  const accentHex = rgbToHex(accentParsed.r, accentParsed.g, accentParsed.b);

  const lightBgParsed = parseColor(config.lightBgColor || "#fcf8f2");
  const lightBgHex = rgbToHex(lightBgParsed.r, lightBgParsed.g, lightBgParsed.b);

  const glassTextParsed = parseColor(config.glassBtnText || "#ffffff");
  const glassTextHex = rgbToHex(glassTextParsed.r, glassTextParsed.g, glassTextParsed.b);

  const envelopeBgParsed = parseColor(config.envelopeBgColor || config.primaryColor || "#0b1329");
  const envelopeBgHex = rgbToHex(envelopeBgParsed.r, envelopeBgParsed.g, envelopeBgParsed.b);

  const envelopeSealParsed = parseColor(config.envelopeSealColor || "#991b1b");
  const envelopeSealHex = rgbToHex(envelopeSealParsed.r, envelopeSealParsed.g, envelopeSealParsed.b);

  const bgParsed = parseColor(config.glassBtnBg || "rgba(255, 255, 255, 0.12)");
  const borderParsed = parseColor(config.glassBtnBorder || "rgba(245, 158, 11, 0.35)");
  const shadowParsed = parseColor(config.glassBtnShadow || "rgba(245, 158, 11, 0.5)");

  const bgHex = rgbToHex(bgParsed.r, bgParsed.g, bgParsed.b);
  const borderHex = rgbToHex(borderParsed.r, borderParsed.g, borderParsed.b);
  const shadowHex = rgbToHex(shadowParsed.r, shadowParsed.g, shadowParsed.b);


  // Cover Design Parsed Colors
  const coverBorderParsed = parseColor(config.coverBorderColor || config.accentGold || "#f59e0b");
  const coverInnerBorderParsed = parseColor(config.coverInnerBorderColor || "rgba(255, 255, 255, 0.15)");
  const coverBgOverlayStartParsed = parseColor(config.coverBgOverlayStart || "rgba(0, 0, 0, 0.45)");
  const coverBgOverlayEndParsed = parseColor(config.coverBgOverlayEnd || "rgba(0, 0, 0, 0.70)");
  const coverBottomTaglineBgParsed = parseColor(config.coverBottomTaglineBg || "rgba(0, 0, 0, 0.4)");

  const coverBorderHex = rgbToHex(coverBorderParsed.r, coverBorderParsed.g, coverBorderParsed.b);
  const coverInnerBorderHex = rgbToHex(coverInnerBorderParsed.r, coverInnerBorderParsed.g, coverInnerBorderParsed.b);
  const coverBgOverlayStartHex = rgbToHex(coverBgOverlayStartParsed.r, coverBgOverlayStartParsed.g, coverBgOverlayStartParsed.b);
  const coverBgOverlayEndHex = rgbToHex(coverBgOverlayEndParsed.r, coverBgOverlayEndParsed.g, coverBgOverlayEndParsed.b);
  const coverBottomTaglineBgHex = rgbToHex(coverBottomTaglineBgParsed.r, coverBottomTaglineBgParsed.g, coverBottomTaglineBgParsed.b);

  const coverTopTaglineColorParsed = parseColor(config.coverTopTaglineColor || config.accentGold || "#f59e0b");
  const coverTopTaglineColorHex = rgbToHex(coverTopTaglineColorParsed.r, coverTopTaglineColorParsed.g, coverTopTaglineColorParsed.b);

  const coverSubheadingColorParsed = parseColor(config.coverSubheadingColor || "#ffffff");
  const coverSubheadingColorHex = rgbToHex(coverSubheadingColorParsed.r, coverSubheadingColorParsed.g, coverSubheadingColorParsed.b);

  const coverBrideColorParsed = parseColor(config.coverBrideColor || "#ffffff");
  const coverBrideColorHex = rgbToHex(coverBrideColorParsed.r, coverBrideColorParsed.g, coverBrideColorParsed.b);

  const coverAmpersandColorParsed = parseColor(config.coverAmpersandColor || config.accentGold || "#f59e0b");
  const coverAmpersandColorHex = rgbToHex(coverAmpersandColorParsed.r, coverAmpersandColorParsed.g, coverAmpersandColorParsed.b);

  const coverGroomColorParsed = parseColor(config.coverGroomColor || "#ffffff");
  const coverGroomColorHex = rgbToHex(coverGroomColorParsed.r, coverGroomColorParsed.g, coverGroomColorParsed.b);

  const coverQuoteColorParsed = parseColor(config.coverQuoteColor || "#ffffff");
  const coverQuoteColorHex = rgbToHex(coverQuoteColorParsed.r, coverQuoteColorParsed.g, coverQuoteColorParsed.b);

  const coverBottomTaglineColorParsed = parseColor(config.coverBottomTaglineColor || config.accentGold || "#f59e0b");
  const coverBottomTaglineColorHex = rgbToHex(coverBottomTaglineColorParsed.r, coverBottomTaglineColorParsed.g, coverBottomTaglineColorParsed.b);

  const revealColorParsed = parseColor(config.revealColor || config.accentGold || "#f59e0b");
  const revealColorHex = rgbToHex(revealColorParsed.r, revealColorParsed.g, revealColorParsed.b);

  const handleRgbaColorChange = (field, defaultVal, channel, val) => {
    const parsed = parseColor(config[field] || defaultVal);
    if (channel === 'alpha') {
      parsed.a = parseFloat(val);
    } else if (channel === 'hex') {
      const rgb = hexToRgb(val);
      parsed.r = rgb.r;
      parsed.g = rgb.g;
      parsed.b = rgb.b;
    } else {
      parsed[channel] = parseInt(val) || 0;
    }
    onChangeField(field, rgbaToCss(parsed.r, parsed.g, parsed.b, parsed.a));
  };

  const handleRgbColorChangeDirect = (field, defaultVal, newR, newG, newB) => {
    const parsed = parseColor(config[field] || defaultVal);
    parsed.r = newR;
    parsed.g = newG;
    parsed.b = newB;
    onChangeField(field, rgbaToCss(parsed.r, parsed.g, parsed.b, parsed.a));
  };

  const handleGlassBgChange = (channel, val) => handleRgbaColorChange("glassBtnBg", "rgba(255, 255, 255, 0.12)", channel, val);
  const handleGlassBorderChange = (channel, val) => handleRgbaColorChange("glassBtnBorder", "rgba(245, 158, 11, 0.35)", channel, val);
  const handleGlassShadowChange = (channel, val) => handleRgbaColorChange("glassBtnShadow", "rgba(245, 158, 11, 0.5)", channel, val);

  // RGB to HSV conversion helper
  const rgbToHsv = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
  };

  // HSV to RGB conversion helper
  const hsvToRgb = (h, s, v) => {
    h /= 360; s /= 100; v /= 100;
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  };

  const renderRgbaControl = (label, field, defaultVal, parsedColor, hexVal) => {
    const hsv = rgbToHsv(parsedColor.r, parsedColor.g, parsedColor.b);
    const pureColor = hsvToRgb(hsv.h, 100, 100);
    const valueGradient = `linear-gradient(to right, #000000, rgb(${pureColor.r}, ${pureColor.g}, ${pureColor.b}))`;

    const quickSwatches = [
      { name: "Gold", hex: "#f59e0b" },
      { name: "Warm Gold", hex: "#b89254" },
      { name: "Burgundy", hex: "#8a2b3f" },
      { name: "Emerald", hex: "#065f46" },
      { name: "Sapphire", hex: "#1e40af" },
      { name: "Rose", hex: "#e11d48" },
      { name: "Navy", hex: "#0b1329" },
      { name: "Cream", hex: "#fdfbf7" },
      { name: "White", hex: "#ffffff" }
    ];

    return (
      <div 
        id={field ? `field-control-${field}` : undefined}
        className="space-y-2.5 p-3.5 bg-[#FFFFFF] rounded-xl border border-[#E9DCCB] transition-all duration-300 shadow-sm"
      >
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-extrabold text-[#513321] block uppercase tracking-wide">{label}</span>
          <div className="flex items-center space-x-2">
            {/* Direct Native Color Picker Input */}
            <input 
              type="color" 
              value={hexVal || "#f59e0b"}
              onChange={(e) => {
                const rgb = hexToRgb(e.target.value);
                handleRgbColorChangeDirect(field, defaultVal, rgb.r, rgb.g, rgb.b);
              }}
              onInput={(e) => {
                const rgb = hexToRgb(e.target.value);
                handleRgbColorChangeDirect(field, defaultVal, rgb.r, rgb.g, rgb.b);
              }}
              className="w-6 h-6 rounded-lg cursor-pointer border border-[#E9DCCB] bg-transparent shrink-0 shadow-sm"
              title="Click to open full color wheel"
            />
            <span className="text-[9px] text-[#513321] font-mono font-bold bg-[#F8EFE4] px-2 py-0.5 rounded border border-[#E9DCCB]">
              rgba({parsedColor.r}, {parsedColor.g}, {parsedColor.b}, {parsedColor.a})
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Color Indicator Swatch Box with Click-to-Pick Overlay */}
          <div 
            className="w-10 self-stretch min-h-[84px] rounded-xl border border-[#E9DCCB] shrink-0 shadow-sm relative overflow-hidden group cursor-pointer"
            style={{ 
              backgroundColor: rgbaToCss(parsedColor.r, parsedColor.g, parsedColor.b, parsedColor.a),
              backgroundImage: 'linear-gradient(45deg, #E6DED5 25%, transparent 25%), linear-gradient(-45deg, #E6DED5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E6DED5 75%), linear-gradient(-45deg, transparent 75%, #E6DED5 75%)',
              backgroundSize: '6px 6px',
              backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px'
            }}
            title="Click box to pick color"
          >
            <div className="w-full h-full" style={{ backgroundColor: rgbaToCss(parsedColor.r, parsedColor.g, parsedColor.b, parsedColor.a) }} />
            <input 
              type="color" 
              value={hexVal || "#f59e0b"}
              onChange={(e) => {
                const rgb = hexToRgb(e.target.value);
                handleRgbColorChangeDirect(field, defaultVal, rgb.r, rgb.g, rgb.b);
              }}
              onInput={(e) => {
                const rgb = hexToRgb(e.target.value);
                handleRgbColorChangeDirect(field, defaultVal, rgb.r, rgb.g, rgb.b);
              }}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              title="Click to pick color"
            />
          </div>

          {/* Sliders Area - Stacked 3 Clean Horizontal Sliders */}
          <div className="flex-1 space-y-2 min-w-0">
            {/* Hue Slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] text-[#513321] font-bold uppercase tracking-wider">
                <span>Color Hue</span>
                <span className="font-mono text-[#C49A4A] font-extrabold">{hsv.h}°</span>
              </div>
              <input 
                type="range" min="0" max="360"
                value={hsv.h}
                onChange={(e) => {
                  const h = parseInt(e.target.value);
                  const s = hsv.s < 8 ? 85 : hsv.s;
                  const v = hsv.v < 8 ? 85 : hsv.v;
                  const rgb = hsvToRgb(h, s, v);
                  handleRgbColorChangeDirect(field, defaultVal, rgb.r, rgb.g, rgb.b);
                }}
                onInput={(e) => {
                  const h = parseInt(e.target.value);
                  const s = hsv.s < 8 ? 85 : hsv.s;
                  const v = hsv.v < 8 ? 85 : hsv.v;
                  const rgb = hsvToRgb(h, s, v);
                  handleRgbColorChangeDirect(field, defaultVal, rgb.r, rgb.g, rgb.b);
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer color-slider-horizontal"
                style={{
                  background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                  padding: 0
                }}
              />
            </div>

            {/* Brightness Slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] text-[#513321] font-bold uppercase tracking-wider">
                <span>Brightness</span>
                <span className="font-mono text-[#C49A4A] font-extrabold">{hsv.v}%</span>
              </div>
              <input 
                type="range" min="0" max="100"
                value={hsv.v}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  const s = hsv.s < 8 ? 85 : hsv.s;
                  const rgb = hsvToRgb(hsv.h, s, v);
                  handleRgbColorChangeDirect(field, defaultVal, rgb.r, rgb.g, rgb.b);
                }}
                onInput={(e) => {
                  const v = parseInt(e.target.value);
                  const s = hsv.s < 8 ? 85 : hsv.s;
                  const rgb = hsvToRgb(hsv.h, s, v);
                  handleRgbColorChangeDirect(field, defaultVal, rgb.r, rgb.g, rgb.b);
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer color-slider-horizontal"
                style={{
                  background: valueGradient,
                  padding: 0
                }}
              />
            </div>

            {/* Opacity Slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] text-[#513321] font-bold uppercase tracking-wider">
                <span>Opacity</span>
                <span className="font-mono text-[#C49A4A] font-extrabold">{Math.round(parsedColor.a * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01"
                value={parsedColor.a}
                onChange={(e) => handleRgbaColorChange(field, defaultVal, 'alpha', parseFloat(e.target.value))}
                onInput={(e) => handleRgbaColorChange(field, defaultVal, 'alpha', parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer color-slider-horizontal"
                style={{
                  background: `linear-gradient(to right, rgba(${parsedColor.r},${parsedColor.g},${parsedColor.b},0), rgba(${parsedColor.r},${parsedColor.g},${parsedColor.b},1))`,
                  padding: 0
                }}
              />
            </div>
          </div>
        </div>

        {/* Quick Instant Color Swatches */}
        <div className="pt-2 border-t border-[#EEE4D9] flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[8.5px] uppercase tracking-wider font-extrabold text-[#513321] shrink-0">
            Quick Swatches:
          </span>
          <div className="flex items-center space-x-1.5 shrink-0">
            {quickSwatches.map((swatch, sIdx) => {
              const rgb = hexToRgb(swatch.hex);
              return (
                <button
                  key={sIdx}
                  type="button"
                  data-swatch="true"
                  onClick={() => handleRgbColorChangeDirect(field, defaultVal, rgb.r, rgb.g, rgb.b)}
                  className="color-swatch-btn w-4 h-4 rounded-full border border-[#E9DCCB] cursor-pointer shadow-sm shrink-0"
                  style={{ backgroundColor: swatch.hex }}
                  title={`${swatch.name} (${swatch.hex})`}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderRgbaControlSelfParsed = (label, field, defaultVal) => {
    const val = config[field] || defaultVal;
    const parsed = parseColor(val);
    const hex = rgbToHex(parsed.r, parsed.g, parsed.b);
    return renderRgbaControl(label, field, defaultVal, parsed, hex);
  };

  const renderPositionSlider = (label, field, min = -120, max = 120) => {
    const value = config[`${field}YOffset`] !== undefined ? parseInt(config[`${field}YOffset`]) : 0;
    return (
      <div className="space-y-1 py-1">
        <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-amber-300 font-bold mb-0.5">
          <span>{label} Offset Y</span>
          <span className="font-mono text-slate-100 font-bold">{value}px</span>
        </div>
        <div className="flex items-center space-x-2">
          <input 
            type="range" min={min} max={max} step="1"
            value={value}
            onChange={(e) => onChangeField(`${field}YOffset`, parseInt(e.target.value))}
            className="flex-1 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <button
            type="button"
            onClick={() => onChangeField(`${field}YOffset`, 0)}
            className="px-2 py-0.5 bg-slate-900 border border-slate-800 hover:bg-amber-900/30 hover:border-amber-500/50 hover:text-amber-400 rounded-lg text-[8px] text-slate-200 font-mono transition cursor-pointer font-bold"
            title="Reset"
          >
            Reset
          </button>
        </div>
      </div>
    );
  };

  const renderImageToolControl = (label, imageKey) => {
    const imgUrl = config[imageKey];
    const scaleKey = `${imageKey}Scale`;
    const xOffsetKey = `${imageKey}XOffset`;
    const yOffsetKey = `${imageKey}YOffset`;
    const overlayStartKey = `${imageKey}OverlayStart`;
    const overlayEndKey = `${imageKey}OverlayEnd`;
    const opacityKey = `${imageKey}Opacity`;

    return (
      <div className="p-3 bg-slate-900/80 rounded-xl border border-amber-500/20 space-y-3 shadow-md">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">{label}</span>
          {imgUrl && (
            <button
              type="button"
              onClick={() => {
                onChangeField(imageKey, "");
                onChangeField(scaleKey, 100);
                onChangeField(xOffsetKey, 50);
                onChangeField(yOffsetKey, 50);
                onChangeField(opacityKey, 1);
              }}
              className="px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/40 text-rose-300 hover:text-rose-100 rounded text-[9px] font-extrabold uppercase transition cursor-pointer flex items-center space-x-1 shadow-sm"
            >
              <span>Delete Image</span>
            </button>
          )}
        </div>

        {/* Image Upload Button */}
        <div>
          <label className="text-[9px] uppercase text-amber-300 font-extrabold block mb-1 tracking-wider">
            {imgUrl ? "Replace HD Image" : "Upload HD Image"}
          </label>
          <input 
            type="file" 
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                try {
                  const hdCompressed = await compressImage(file, 2048, 2048, 0.95);
                  onChangeField(imageKey, hdCompressed);
                } catch (err) {
                  console.error("Error reading HD image:", err);
                }
              }
            }}
            className="w-full text-xs text-slate-100 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer shadow-sm"
          />
        </div>

        {/* Image Thumbnail Preview & Settings Controls */}
        {imgUrl && (
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <div className="flex items-center space-x-3 bg-slate-950/80 p-2 rounded-lg border border-white/10">
              <img src={imgUrl} alt={label} className="w-12 h-12 object-cover rounded-lg border border-amber-500/30" />
              <div className="flex-1 min-w-0">
                <span className="text-[9px] text-slate-100 font-bold block truncate">HD Image Loaded</span>
                <span className="text-[8px] text-emerald-400 font-mono font-bold">Pixel-Perfect Resolution</span>
              </div>
            </div>

            {/* Scale Slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[8.5px] uppercase tracking-wider text-slate-200 font-bold">
                <span>Background Scale</span>
                <span className="font-mono text-amber-400 font-extrabold">{config[scaleKey] || 100}%</span>
              </div>
              <input 
                type="range" min="50" max="250" step="5"
                value={config[scaleKey] || 100}
                onChange={(e) => onChangeField(scaleKey, parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* X & Y Move Offset Sliders */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <div className="flex justify-between text-[8.5px] uppercase tracking-wider text-slate-200 font-bold">
                  <span>Move X (Left-Right)</span>
                  <span className="font-mono text-amber-400 font-extrabold">{config[xOffsetKey] ?? 50}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="1"
                  value={config[xOffsetKey] ?? 50}
                  onChange={(e) => onChangeField(xOffsetKey, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div className="space-y-0.5">
                <div className="flex justify-between text-[8.5px] uppercase tracking-wider text-slate-200 font-bold">
                  <span>Move Y (Up-Down)</span>
                  <span className="font-mono text-amber-400 font-extrabold">{config[yOffsetKey] ?? 50}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="1"
                  value={config[yOffsetKey] ?? 50}
                  onChange={(e) => onChangeField(yOffsetKey, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Color Overlay Shade Controls */}
            {renderRgbaControlSelfParsed("Overlay Tint Start", overlayStartKey, "rgba(5, 7, 13, 0.5)")}
            {renderRgbaControlSelfParsed("Overlay Tint End", overlayEndKey, "rgba(5, 7, 13, 0.85)")}

            {/* Overlay Opacity */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[8.5px] uppercase tracking-wider text-slate-200 font-bold">
                <span>Image Opacity</span>
                <span className="font-mono text-amber-400 font-extrabold">
                  {config[opacityKey] !== undefined ? `${Math.round(config[opacityKey] * 100)}%` : '100%'}
                </span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.05"
                value={config[opacityKey] !== undefined ? config[opacityKey] : 1}
                onChange={(e) => onChangeField(opacityKey, parseFloat(e.target.value))}
                onInput={(e) => onChangeField(opacityKey, parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer color-slider-horizontal"
                style={{
                  background: 'linear-gradient(to right, rgba(214,173,97,0.1), rgba(214,173,97,1))',
                  padding: 0
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCategorizedElementTool = (arg1, arg2, arg3, arg4, arg5, arg6, arg7) => {
    let key, label, icon, defaultVal, isDate, dateType, toggleKey;
    if (typeof arg1 === "object" && arg1 !== null && !Array.isArray(arg1)) {
      ({
        key,
        label,
        icon,
        defaultVal,
        isDate = false,
        dateType = "date",
        toggleKey
      } = arg1);
    } else {
      label = arg1;
      key = arg2;
      defaultVal = arg3;
      icon = arg4;
      isDate = arg5 || false;
      dateType = arg6 || "date";
      toggleKey = arg7;
    }

    // Auto-derive toggleKey if not explicitly provided
    if (!toggleKey) {
      if (key === "customSacredSymbol" || key === "customSacredVerse") toggleKey = key === "customSacredSymbol" ? "showSacredSymbol" : "showSacredVerse";
      else if (key === "coverTopTaglineText") toggleKey = "showCoverTopTagline";
      else if (key === "coverSubheadingText") toggleKey = "showCoverSubheading";
      else if (key === "coverBrideText" || key === "coverGroomText" || key === "coverAmpersandText") toggleKey = "showCoverCoupleNames";
      else if (key === "coverQuoteText") toggleKey = "showCoverQuote";
      else if (key === "coverBottomTaglineText") toggleKey = "showCoverBottomTagline";
      else if (key === "coverRevealBtnText") toggleKey = "showCoverRevealBtn";
      else if (key === "scratchTitle") toggleKey = "showScratchCard";
      else if (key === "scratchSecretMessage") toggleKey = "showScratchCard";
      else if (key === "storyBrideTitle" || key === "storyBrideName" || key === "storyBrideParentLabel" || key === "storyBrideFamily") toggleKey = "showBrideDetails";
      else if (key === "storyGroomTitle" || key === "storyGroomName" || key === "storyGroomParentLabel" || key === "storyGroomFamily") toggleKey = "showGroomDetails";
      else if (key === "storySubtitle" || key === "storyTitle") toggleKey = "showCoupleTitles";
      else if (key === "storyPathTitle" || key === "storyParagraph") toggleKey = "showStoryParagraph";
    }

    const isOpen = activeElementField === key;
    const isEnabled = toggleKey ? config[toggleKey] !== false : true;
    
    return (
      <div 
        key={key}
        id={`element-tool-${key}`}
        className={`rounded-xl border transition-all duration-300 overflow-hidden ${
          !isEnabled
            ? 'bg-slate-950/70 border-slate-800/80 opacity-75'
            : isOpen 
              ? 'bg-slate-900/95 border-amber-500/60 shadow-lg shadow-amber-500/20' 
              : 'bg-slate-900/60 border-white/10 hover:border-amber-500/40'
        }`}
      >
        {/* Accordion Header */}
        <button
          type="button"
          onClick={() => setActiveElementField(isOpen ? null : key)}
          className="w-full px-3 py-2.5 flex items-center justify-between cursor-pointer text-left select-none transition-colors element-tool-header"
          style={{
            backgroundColor: '#0b1329',
            backgroundImage: 'linear-gradient(90deg, #0b1329 0%, #152244 50%, #0b1329 100%)',
            color: '#f8fafc',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div className="flex items-center space-x-2 min-w-0 pr-2">
            {icon || <SvgSparkles className="w-4 h-4 text-amber-400 shrink-0" />}
            <span 
              className="text-[11px] font-extrabold uppercase tracking-wider truncate"
              style={{
                color: isEnabled ? '#f8fafc' : '#94a3b8',
                textShadow: isEnabled ? '0 1px 2px rgba(0, 0, 0, 0.8)' : 'none'
              }}
            >
              {label}
            </span>
            {!isEnabled && (
              <span 
                className="text-[8px] px-1.5 py-0.2 rounded font-mono"
                style={{
                  backgroundColor: '#1e293b',
                  color: '#94a3b8',
                  border: '1px solid #334155'
                }}
              >
                OFF
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2 shrink-0">
            {toggleKey && (
              <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                <span 
                  className="text-[8px] font-extrabold uppercase"
                  style={{ color: isEnabled ? '#fbbf24' : '#64748b' }}
                >
                  {isEnabled ? 'ON' : 'OFF'}
                </span>
                <SmallToggle
                  size="xs"
                  checked={isEnabled}
                  onChange={(val) => onChangeField(toggleKey, val)}
                  title={`Toggle ${label} ${isEnabled ? 'OFF' : 'ON'}`}
                />
              </div>
            )}
            <div 
              className="w-4 h-4 rounded-full border border-white/30 shadow-md shrink-0" 
              style={{ backgroundColor: config[`${key}Color`] || config.accentGold || '#f59e0b' }} 
            />
            <svg 
              className={`w-4 h-4 text-amber-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-300' : ''}`}
              fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Smooth Accordion Body (24fps Hardware Accelerated) */}
        {isOpen && (
          <div className="p-3 border-t border-amber-500/20 space-y-3.5 animate-accordion-down bg-slate-950/80">
            {/* 1. Editable Text Input */}
            <div>
              <label className="text-[9.5px] uppercase tracking-wider font-extrabold text-amber-300 block mb-1">
                {isDate ? "Select Date & Time" : "Text Content"}
              </label>
              {!isDate ? (
                <input
                  type="text"
                  name={key}
                  value={
                    (key === "storyBrideName" ? (config.brideName || defaultVal) :
                     key === "storyBrideFamily" ? (config.brideFamily || defaultVal) :
                     key === "storyGroomName" ? (config.groomName || defaultVal) :
                     key === "storyGroomFamily" ? (config.groomFamily || defaultVal) :
                     key === "storySubtitle" ? (config.storySubtitle || defaultVal) :
                     key === "storyTitle" ? (config.storyTitle || defaultVal) :
                     key === "storyBrideTitle" ? (config.storyBrideTitle || defaultVal) :
                     key === "storyGroomTitle" ? (config.storyGroomTitle || defaultVal) :
                     key === "storyBrideParentLabel" ? (config.storyBrideParentLabel || defaultVal) :
                     key === "storyGroomParentLabel" ? (config.storyGroomParentLabel || defaultVal) :
                     key === "storyPathTitle" ? (config.storyPathTitle || defaultVal) :
                     key === "coverBrideText" ? (config.brideName || defaultVal) :
                     key === "coverGroomText" ? (config.groomName || defaultVal) :
                     key === "coverQuoteText" ? (config.introQuote || defaultVal) :
                     config[key] !== undefined ? config[key] : "")
                  }
                  placeholder={defaultVal}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChangeField(key, val);
                    if (key === "storyBrideName") onChangeField("brideName", val);
                    if (key === "storyBrideFamily") onChangeField("brideFamily", val);
                    if (key === "storyGroomName") onChangeField("groomName", val);
                    if (key === "storyGroomFamily") onChangeField("groomFamily", val);
                    if (key === "coverBrideText") onChangeField("brideName", val);
                    if (key === "coverGroomText") onChangeField("groomName", val);
                    if (key === "coverQuoteText") onChangeField("introQuote", val);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-500 shadow-inner"
                />
              ) : (
                <input
                  type={dateType === 'datetime-local' ? 'datetime-local' : 'date'}
                  name={key}
                  value={config[key] || ""}
                  onChange={(e) => onChangeField(key, e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono font-semibold"
                />
              )}
            </div>

            {/* 2. Typography Settings (Font, Size, Alignment) */}
            <div className="space-y-1.5">
              <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-slate-200 block">Typography &amp; Size</span>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="text-[9px] uppercase text-amber-300 font-extrabold block mb-1 tracking-wider">Font Family</label>
                  <CustomFontSelect
                    value={config[`${key}Font`] || ""}
                    onChange={(val) => onChangeField(`${key}Font`, val)}
                    options={FONTS}
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase text-amber-300 font-extrabold block mb-1 tracking-wider">Font Size</label>
                  <CustomSelect
                    value={config[`${key}Size`] || ""}
                    onChange={(val) => onChangeField(`${key}Size`, val)}
                    options={[
                      { value: "", label: "Default" },
                      { value: "text-[8px]", label: "8px" },
                      { value: "text-[9px]", label: "9px" },
                      { value: "text-[10px]", label: "10px" },
                      { value: "text-xs", label: "12px" },
                      { value: "text-sm", label: "14px" },
                      { value: "text-base", label: "16px" },
                      { value: "text-lg", label: "18px" },
                      { value: "text-xl", label: "20px" },
                      { value: "text-2xl", label: "24px" },
                      { value: "text-3xl", label: "30px" },
                      { value: "text-4xl", label: "36px" }
                    ]}
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase text-amber-300 font-extrabold block mb-1 tracking-wider">Alignment</label>
                  <CustomSelect
                    value={config[`${key}Align`] || "center"}
                    onChange={(val) => onChangeField(`${key}Align`, val)}
                    options={[
                      { value: "left", label: "Left" },
                      { value: "center", label: "Center" },
                      { value: "right", label: "Right" }
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* 3. Color, Opacity & Brightness / Glow */}
            <div className="space-y-2.5 border-t border-white/10 pt-2.5">
              {renderRgbaControlSelfParsed(`${label} Color`, `${key}Color`, config.accentGold || "#f59e0b")}

              <div className="space-y-0.5">
                <div className="flex justify-between text-[8.5px] uppercase tracking-wider text-slate-200 font-bold">
                  <span>Opacity</span>
                  <span className="font-mono text-amber-400 font-extrabold">
                    {config[`${key}Opacity`] !== undefined ? `${Math.round(config[`${key}Opacity`] * 100)}%` : '100%'}
                  </span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.05"
                  value={config[`${key}Opacity`] !== undefined ? config[`${key}Opacity`] : 1}
                  onChange={(e) => onChangeField(`${key}Opacity`, parseFloat(e.target.value))}
                  onInput={(e) => onChangeField(`${key}Opacity`, parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer color-slider-horizontal"
                  style={{
                    background: 'linear-gradient(to right, rgba(214,173,97,0.1), rgba(214,173,97,1))',
                    padding: 0
                  }}
                />
              </div>

              <div className="space-y-0.5">
                <div className="flex justify-between text-[8.5px] uppercase tracking-wider text-slate-200 font-bold">
                  <span>Glow / Brightness</span>
                  <span className="font-mono text-amber-400 font-extrabold">
                    {config[`${key}Glow`] !== undefined ? `${config[`${key}Glow`]}%` : '100%'}
                  </span>
                </div>
                <input 
                  type="range" min="20" max="200" step="5"
                  value={config[`${key}Glow`] !== undefined ? config[`${key}Glow`] : 100}
                  onChange={(e) => onChangeField(`${key}Glow`, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* 4. Position & Vertical Offset (Y) */}
            <div className="space-y-1 border-t border-white/10 pt-2.5">
              <div className="flex justify-between text-[8.5px] uppercase tracking-wider text-slate-200 font-bold">
                <span className="text-amber-300 font-extrabold">Vertical Position (Y Offset)</span>
                <span className="font-mono text-slate-100 font-bold">{config[`${key}YOffset`] || 0}px</span>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="range" min="-100" max="100" step="1"
                  value={config[`${key}YOffset`] || 0}
                  onChange={(e) => onChangeField(`${key}YOffset`, parseInt(e.target.value) || 0)}
                  className="flex-1 h-1.5 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                />
                <button 
                  type="button"
                  onClick={() => onChangeField(`${key}YOffset`, 0)}
                  className="px-2 py-0.5 bg-slate-900 border border-slate-700 hover:bg-amber-900/40 hover:text-white rounded text-[8px] text-slate-200 font-mono font-bold transition cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SmallToggle = ({ checked = true, onChange, title, size = "sm" }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      title={title || (checked ? "Turn OFF" : "Turn ON")}
      className={`group relative inline-flex items-center shrink-0 cursor-pointer rounded-full transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-[#C49A4A]/50 ${
        size === "xs" ? "w-6 h-3.5" : "w-8 h-4.5"
      } ${
        checked
          ? "bg-[#D6AD61] shadow-sm"
          : "bg-[#E6DED5] border border-[#E9DCCB]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block rounded-full bg-[#FFFFFF] shadow-sm transform transition-transform duration-200 ${
          size === "xs"
            ? (checked ? "translate-x-3 w-2.5 h-2.5" : "translate-x-0.5 w-2.5 h-2.5")
            : (checked ? "translate-x-4 w-3.5 h-3.5" : "translate-x-0.5 w-3.5 h-3.5")
        }`}
      />
    </button>
  );

  const renderPartCard = ({
    title,
    subtitle,
    toggleKey,
    children,
    badge = null,
    icon = null,
    className = ""
  }) => {
    const isEnabled = config[toggleKey] !== false;
    return (
      <div
        className={`p-3.5 rounded-xl border transition-all duration-200 shadow-sm ${
          isEnabled
            ? "bg-[#FFFEFB] border-[#E9DCCB]"
            : "bg-[#F7EFE5]/70 border-[#E9DCCB]/60 opacity-80"
        } ${className}`}
      >
        <div className={`flex items-center justify-between gap-2 ${isEnabled ? "border-b border-[#EEE4D9] pb-2.5 mb-3" : ""}`}>
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="text-[#C49A4A] text-xs shrink-0">{icon}</span>}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span 
                  className="text-[11px] font-extrabold uppercase tracking-wider truncate render-part-card-title text-[#513321]"
                >
                  {title}
                </span>
                {badge && (
                  <span 
                    className="text-[8px] px-1.5 py-0.2 rounded-full font-bold bg-[#F9E8E5] text-[#8D414D] border border-[#E9DCCB]"
                  >
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <span className="text-[9px] block truncate text-[#6C6B70]">
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span 
              className={`text-[9px] font-extrabold uppercase tracking-wider ${isEnabled ? "text-[#C49A4A]" : "text-[#999198]"}`}
            >
              {isEnabled ? "ON" : "OFF"}
            </span>
            <SmallToggle
              checked={isEnabled}
              onChange={(val) => onChangeField(toggleKey, val)}
              title={`Toggle ${title} ${isEnabled ? "OFF" : "ON"}`}
            />
          </div>
        </div>

        {isEnabled ? (
          children
        ) : (
          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
            <span className="text-[9px] italic text-slate-500">Part turned OFF • Hidden on invitation</span>
            <button
              type="button"
              onClick={() => onChangeField(toggleKey, true)}
              className="text-amber-400 hover:text-amber-300 text-[9px] font-bold underline cursor-pointer"
            >
              Turn ON
            </button>
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: "envelope", name: "Envelope Design", icon: <SvgBookOpen className="w-4 h-4" />, toggleKey: "showEnvelope" },
    { id: "cover", name: "Cover Design", icon: <SvgHeart className="w-4 h-4" />, toggleKey: "showCoverSection" },
    { id: "music", name: "Background Music", icon: <SvgVolume2 className="w-4 h-4" />, toggleKey: "showMusic" },
    { id: "scratch", name: "Scratch & Reveal", icon: <SvgEye className="w-4 h-4" />, toggleKey: "showScratchSection" },
    { id: "couple", name: "Couple & Family", icon: <SvgUsers className="w-4 h-4" />, toggleKey: "showCoupleSection" },
    { id: "timeline", name: "Wedding Timeline", icon: <SvgCalendar className="w-4 h-4" />, toggleKey: "showTimelineSection" },
    { id: "venue", name: "Event Venues", icon: <SvgMapPin className="w-4 h-4" />, toggleKey: "showVenueSection" },
    { id: "gallery", name: "Our Gallery", icon: <SvgLayers className="w-4 h-4" />, toggleKey: "showGallery" },
    { id: "rsvp", name: "RSVP & Wishes", icon: <SvgMessageSquare className="w-4 h-4" />, toggleKey: "showRsvpSection" },
    ...(isAdmin ? [{ id: "settings", name: "SaaS & Presets", icon: <SvgSettings className="w-4 h-4" /> }] : [])
  ];

  const activeTabObj = tabs.find(t => t.id === activeTab) || tabs[0];

  // Calculate luminance to decide text color (light vs dark)
  const luminance = (0.299 * primaryParsed.r + 0.587 * primaryParsed.g + 0.114 * primaryParsed.b) / 255;
  const isLight = luminance > 0.5;

  const toolBg = `rgba(${primaryParsed.r}, ${primaryParsed.g}, ${primaryParsed.b}, 0.88)`;
  const offsetFactor = isLight ? -15 : 15;
  const clamp = (val) => Math.min(255, Math.max(0, val));
  
  const toolHeaderBg = `rgba(${clamp(primaryParsed.r + offsetFactor)}, ${clamp(primaryParsed.g + offsetFactor)}, ${clamp(primaryParsed.b + offsetFactor)}, 0.5)`;
  const toolTabBg = `rgba(${clamp(primaryParsed.r + offsetFactor * 1.5)}, ${clamp(primaryParsed.g + offsetFactor * 1.5)}, ${clamp(primaryParsed.b + offsetFactor * 1.5)}, 0.35)`;
  
  const toolTextColor = isLight ? '#0f172a' : '#f8fafc';
  const toolSubtextColor = isLight ? '#334155' : '#cbd5e1';
  const toolBorderColor = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.14)';

  const styleVariables = {
    '--tool-bg': toolBg,
    '--tool-header-bg': toolHeaderBg,
    '--tool-tab-bg': toolTabBg,
    '--tool-text': toolTextColor,
    '--tool-subtext': toolSubtextColor,
    '--tool-border': toolBorderColor,
    '--tool-accent': '#fbbf24'
  };

  return (
    <div 
      id="admin-sidebar-root"
      style={styleVariables}
      className="admin-sidebar w-full h-full backdrop-blur-xl flex flex-col border-r border-white/10 shadow-2xl relative text-slate-100"
    >
      <style>{`
        /* Sidebar Scrollbar */
        .custom-sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(46, 143, 255, 0.3);
          border-radius: 99px;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(46, 143, 255, 0.5);
        }



        /* Section Cards luxury styling */
        .p-3.bg-slate-900\\/60.rounded,
        .p-2\\.5.bg-slate-900\\/40.rounded,
        .bg-slate-900.p-3.rounded {
          background-color: var(--bg-card, #FFFEFB) !important;
          border: 1px solid var(--border-normal, #E9DCCB) !important;
          border-radius: 16px !important;
          box-shadow: 0 4px 15px rgba(104, 71, 45, 0.05) !important;
          transition: border-color 0.3s ease !important;
        }
        .p-3.bg-slate-900\\/60.rounded:hover,
        .p-2\\.5.bg-slate-900\\/40.rounded:hover {
          border-color: var(--border-active, #C49A4A) !important;
        }

        /* Buttons luxury styling */
        .bg-slate-800,
        .bg-slate-900.border {
          background-color: var(--bg-panel, #F7EFE5) !important;
          border: 1px solid var(--border-normal, #E9DCCB) !important;
          color: var(--text-heading, #513321) !important;
          border-radius: 10px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          box-shadow: 0 2px 4px rgba(104, 71, 45, 0.04) !important;
        }
        .bg-slate-800:hover,
        .bg-slate-900.border:hover {
          background-color: #F9E8E5 !important;
          border-color: var(--border-active, #C49A4A) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 8px rgba(104, 71, 45, 0.08) !important;
        }
        .bg-slate-800:active,
        .bg-slate-900.border:active {
          transform: translateY(0px) !important;
        }

        /* Scrollable sidebar body custom wrapper */
        .flex-1.overflow-y-auto {
          scrollbar-width: thin;
          scrollbar-color: rgba(214, 173, 97, 0.4) #F7EFE5;
        }

        .admin-panel-title {
          color: var(--text-heading, #513321) !important;
          font-weight: 800 !important;
          letter-spacing: 0.08em !important;
        }
      `}</style>
      {/* Header */}
      <div className="p-4 border-b border-[#E9DCCB] flex items-center justify-between bg-[#F7EFE5]">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shadow-xs">
            <SvgSettings className="w-4 h-4 text-blue-600 animate-spin-slow" />
          </div>
          <span 
            className="admin-panel-title font-extrabold tracking-wider font-sans text-sm uppercase"
            style={{ color: '#b45309' }}
          >
            CUSTOMIZATION CONTROL
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onChangeField("syncColorThemeWithEnvelope", !config.syncColorThemeWithEnvelope)}
            className={`admin-top-btn cursor-pointer ${
              config.syncColorThemeWithEnvelope ? 'selected' : ''
            }`}
            title={config.syncColorThemeWithEnvelope ? "Active: Syncing theme colors from envelope. Click to use background design colors." : "Active: Using background design colors. Click to sync theme colors with envelope."}
          >
            {config.syncColorThemeWithEnvelope ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            )}
          </button>
          <button
            onClick={() => setIsScrollLocked(prev => !prev)}
            className={`admin-top-btn cursor-pointer ${
              isScrollLocked ? 'selected' : ''
            }`}
            title={isScrollLocked ? "Scroll Spy Tab Switching is LOCKED (Click to Unlock)" : "Scroll Spy Tab Switching is ACTIVE (Click to Lock)"}
          >
            {isScrollLocked ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
              </svg>
            )}
          </button>
          {onClose && (
            <button onClick={onClose} className="admin-top-btn close-btn cursor-pointer">
              <SvgX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tab Dropdown Selector */}
      <div 
        className={`relative border-b border-slate-850 bg-slate-900/60 py-2 px-3 transition-all ${
          isTabDropdownOpen ? 'z-[999999] isolate' : 'z-20'
        }`} 
        ref={dropdownRef}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTabDropdownOpen(prev => !prev)}
            className="sidebar-tab-dropdown flex-1 cursor-pointer"
            type="button"
          >
            <span className="flex items-center gap-2 truncate">
              {activeTabObj.icon}
              <span className="truncate">{activeTabObj.name}</span>
            </span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isTabDropdownOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {activeTabObj.toggleKey && (
            <div
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-950/80 border border-slate-700/60 shrink-0"
              title={`Toggle Entire ${activeTabObj.name} Section ON/OFF`}
            >
              <span className={`text-[8.5px] font-extrabold uppercase ${config[activeTabObj.toggleKey] !== false ? 'text-amber-400' : 'text-slate-500'}`}>
                {config[activeTabObj.toggleKey] !== false ? 'ON' : 'OFF'}
              </span>
              <SmallToggle
                size="xs"
                checked={config[activeTabObj.toggleKey] !== false}
                onChange={(val) => onChangeField(activeTabObj.toggleKey, val)}
              />
            </div>
          )}
        </div>

        {isTabDropdownOpen && (
          <div className="sidebar-tab-dropdown-menu">
            {tabs.map(tab => {
              const isTabOn = tab.toggleKey ? config[tab.toggleKey] !== false : true;
              const isSelected = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    handleTabClick(tab.id);
                    setIsTabDropdownOpen(false);
                  }}
                  className={`sidebar-tab-dropdown-row ${isSelected ? 'active' : ''} flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer select-none`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className={`shrink-0 ${isSelected ? 'text-amber-600' : 'text-slate-600'}`}>
                      {tab.icon}
                    </span>
                    <span className="text-xs truncate text-slate-900 font-bold">{tab.name}</span>
                  </div>
                  {tab.toggleKey && (
                    <div 
                      className="flex items-center gap-1.5 ml-2 shrink-0" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className={`text-[8.5px] font-extrabold uppercase ${isTabOn ? 'text-amber-700' : 'text-slate-400'}`}>
                        {isTabOn ? 'ON' : 'OFF'}
                      </span>
                      <SmallToggle
                        size="xs"
                        checked={isTabOn}
                        onChange={(val) => onChangeField(tab.toggleKey, val)}
                        title={`Turn ${tab.name} section ${isTabOn ? 'OFF' : 'ON'}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {/* Active Section Master Banner */}
        {activeTabObj.toggleKey && (
          <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-all shadow-sm ${
            config[activeTabObj.toggleKey] !== false
              ? 'bg-amber-500/10 border-amber-500/40'
              : 'bg-rose-500/10 border-rose-500/40'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${config[activeTabObj.toggleKey] !== false ? 'bg-emerald-500 ring-2 ring-emerald-500/30 animate-pulse' : 'bg-rose-500 ring-2 ring-rose-500/30'}`} />
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider block text-slate-900 truncate">
                  {activeTabObj.name} Section: {config[activeTabObj.toggleKey] !== false ? 'Active & Visible' : 'Disabled (Hidden)'}
                </span>
                <span className="text-[9px] font-medium text-slate-600 block truncate">
                  {config[activeTabObj.toggleKey] !== false ? 'Displayed on invitation for guests' : 'Completely hidden on live invitation'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[9px] font-extrabold uppercase tracking-wider ${config[activeTabObj.toggleKey] !== false ? 'text-amber-800' : 'text-slate-600'}`}>
                {config[activeTabObj.toggleKey] !== false ? 'SECTION ON' : 'SECTION OFF'}
              </span>
              <SmallToggle
                checked={config[activeTabObj.toggleKey] !== false}
                onChange={(val) => onChangeField(activeTabObj.toggleKey, val)}
              />
            </div>
          </div>
        )}
        {/* BACKGROUND MUSIC TAB */}
        {activeTab === "music" && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                <SvgVolume2 className="w-4 h-4 text-amber-400" />
                <span>Background Music &amp; Audio</span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Choose, upload, or manage background music. Songs play automatically in an endless loop for anyone opening the shareable invitation link.
              </p>
            </div>

            {/* Global Music Library Management (Admin Control) */}
            {renderPartCard({
              title: `Global Audio Library (${musicPresets.length} Tracks)`,
              toggleKey: "showMusicLibrary",
              children: (
                <div className="p-3 bg-slate-900/80 rounded-xl border border-amber-500/30 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-300 block uppercase tracking-wide">
                    Global Audio Library ({musicPresets.length} Tracks)
                  </span>
                  <span className="text-[9px] text-slate-400 block">
                    Curated tracks available to all customers
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddMusicModal(!showAddMusicModal)}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/50 text-amber-300 rounded text-[10px] font-bold uppercase transition flex items-center space-x-1 cursor-pointer"
                >
                  <span>{showAddMusicModal ? "✕ Close" : "➕ Add Track"}</span>
                </button>
              </div>

              {/* Add New Global Track Form */}
              {showAddMusicModal && (
                <div className="p-2.5 bg-slate-950 rounded-lg border border-amber-500/40 space-y-2 animate-fade-in">
                  <span className="text-[9px] font-bold uppercase text-amber-300 block">Add Track to Global Library</span>
                  <input
                    type="text"
                    value={newMusicForm.title}
                    onChange={(e) => setNewMusicForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Track Title (e.g. Shehnai Wedding Bells)"
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-100"
                  />
                  <input
                    type="text"
                    value={newMusicForm.artist}
                    onChange={(e) => setNewMusicForm(prev => ({ ...prev, artist: e.target.value }))}
                    placeholder="Artist / Genre (e.g. Royal Ensemble)"
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-100"
                  />
                  <input
                    type="text"
                    value={newMusicForm.url}
                    onChange={(e) => setNewMusicForm(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="Direct MP3 Audio URL"
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-100"
                  />
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Or Upload Audio File</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={async (e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        const dataUrl = await new Promise((res, rej) => {
                          const r = new FileReader();
                          r.onload = () => res(r.result);
                          r.onerror = rej;
                          r.readAsDataURL(file);
                        });
                        setNewMusicForm(prev => ({
                          ...prev,
                          url: dataUrl,
                          title: prev.title || file.name.replace(/\.[^/.]+$/, "")
                        }));
                      }}
                      className="w-full text-[10px] text-slate-300 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[9px] file:bg-amber-500 file:text-slate-950 cursor-pointer"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMusicForm.title || !newMusicForm.url) {
                        triggerDialog({ title: "Validation Error", message: "Please provide both Track Title and Audio Source (URL or File).", type: "alert" });
                        return;
                      }
                      dbStore.createMusicPreset(newMusicForm.title, newMusicForm.url, newMusicForm.artist || "Royalty Free", newMusicForm.category);
                      setMusicPresets(dbStore.getMusicPresets());
                      setNewMusicForm({ title: '', artist: '', category: 'Wedding Classic', url: '' });
                      setShowAddMusicModal(false);
                      triggerDialog({ title: "Track Added", message: `🎵 "${newMusicForm.title}" has been added to the global music library!`, type: "alert" });
                    }}
                    className="w-full py-1.5 bg-amber-500 text-slate-950 rounded text-[10px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    💾 Save Track to Global Library
                  </button>
                </div>
              )}

              {/* Music List */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {musicPresets.map((track) => {
                  const isSelected = config.musicUrl === track.url;
                  return (
                    <div
                      key={track.id}
                      className={`p-2 rounded-lg border flex items-center justify-between text-left transition ${
                        isSelected 
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold' 
                          : 'bg-slate-950/60 border-slate-800 text-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onChangeField("musicUrl", track.url);
                          onChangeField("musicTitle", track.title);
                          if (track.artist) onChangeField("musicArtist", track.artist);
                        }}
                        className="flex items-center space-x-2 min-w-0 flex-1 cursor-pointer text-left"
                      >
                        <span className="text-amber-400 text-xs shrink-0">🎵</span>
                        <div className="flex flex-col min-w-0 pr-1">
                          <span className="text-[11px] truncate font-sans">{track.title}</span>
                          <span className="text-[9px] text-slate-400 truncate">{track.artist || track.category || "Royalty Free"}</span>
                        </div>
                      </button>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        {isSelected ? (
                          <span className="text-[8px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-full font-extrabold uppercase">
                            Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onChangeField("musicUrl", track.url);
                              onChangeField("musicTitle", track.title);
                              if (track.artist) onChangeField("musicArtist", track.artist);
                            }}
                            className="text-[8px] text-slate-400 hover:text-amber-300 border border-slate-700 hover:border-amber-400 px-1.5 py-0.5 rounded font-bold uppercase transition cursor-pointer"
                          >
                            Select
                          </button>
                        )}
                        {track.isCustom && (
                          <button
                            type="button"
                            onClick={() => {
                              dbStore.deleteMusicPreset(track.id);
                              setMusicPresets(dbStore.getMusicPresets());
                            }}
                            className="text-[9px] text-rose-400 hover:text-rose-200 p-0.5 rounded transition cursor-pointer"
                            title="Delete custom track"
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                  </div>
                </div>
              )
            })}

            {/* Playback Settings & Toggles */}
            {renderPartCard({
              title: "Playback Settings & Autoplay",
              toggleKey: "autoPlayMusic",
              children: (
                <div className="p-3 bg-slate-900/80 rounded-xl border border-amber-500/30 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-300 block uppercase tracking-wide">
                        Autoplay on Envelope Open
                      </span>
                      <span className="text-[9px] text-slate-400 block">
                        Play song automatically when recipient opens envelope
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.autoPlayMusic !== false}
                        onChange={(e) => onChangeField("autoPlayMusic", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
                    <div>
                      <span className="text-[10px] font-bold text-amber-300 block uppercase tracking-wide">
                        Loop Music Continuously
                      </span>
                      <span className="text-[9px] text-slate-400 block">
                        Repeat song endlessly while recipient views invitation
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.loopMusic !== false}
                        onChange={(e) => onChangeField("loopMusic", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
                    <div>
                      <span className="text-[10px] font-bold text-amber-300 block uppercase tracking-wide">
                        Show Floating Music Player Icon
                      </span>
                      <span className="text-[9px] text-slate-400 block">
                        Display draggable floating music badge on recipient screen
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.showMusicWidget !== false}
                        onChange={(e) => onChangeField("showMusicWidget", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {/* Volume Slider Control */}
                  <div className="pt-2 border-t border-amber-500/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-300 block uppercase tracking-wide">
                        Default Playback Volume
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                        {Math.round((config.musicVolume !== undefined ? config.musicVolume : 0.8) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={config.musicVolume !== undefined ? config.musicVolume : 0.8}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onChangeField("musicVolume", val);
                        if (testAudioRef.current) testAudioRef.current.volume = val;
                      }}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg border border-slate-800"
                    />
                  </div>
                </div>
              )
            })}

            {/* SONG 1: STARTING / INTRO SONG */}
            {renderPartCard({
              title: "Song 1: Starting / Intro Song",
              subtitle: "Plays on landing & envelope before opening",
              toggleKey: "startingMusicEnabled",
              icon: "🎵",
              badge: config.startingMusicUrl ? "Active Track" : "No Audio",
              children: (
                <div className="p-3 bg-slate-900/80 rounded-xl border border-amber-500/30 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-300 block uppercase tracking-wider">
                      Starting Song Audio File (MP3 / WAV / M4A)
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      config.startingMusicUrl ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {config.startingMusicUrl ? "Loaded" : "Empty"}
                    </span>
                  </div>

                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-1">Select Starting Audio from Device</label>
                    <input 
                      type="file" 
                      accept="audio/*"
                      onChange={async (e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        try {
                          const dataUrl = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                          });
                          const customName = file.name.replace(/\.[^/.]+$/, "");
                          onChangeField("startingMusicUrl", dataUrl);
                          onChangeField("startingMusicTitle", customName);
                          onChangeField("startingMusicArtist", "Custom Intro");
                        } catch (err) {
                          console.error("Failed to read starting audio file:", err);
                        }
                      }}
                      className="w-full text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer shadow-sm"
                    />
                  </div>

                  <div className="pt-2 border-t border-amber-500/20 space-y-2">
                    <span className="text-[9.5px] uppercase font-bold text-amber-300 block">Starting Song Details &amp; Direct URL</span>
                    <div className="space-y-1.5">
                      <label className="text-[8px] uppercase text-slate-400 block">Starting Song Title</label>
                      <input 
                        type="text" 
                        value={config.startingMusicTitle || ""}
                        onChange={(e) => onChangeField("startingMusicTitle", e.target.value)}
                        placeholder="e.g. Traditional Shehnai Welcome / Ganesha Stuti"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-[10px] text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                      <label className="text-[8px] uppercase text-slate-400 block">Artist / Subtitle</label>
                      <input 
                        type="text" 
                        value={config.startingMusicArtist || ""}
                        onChange={(e) => onChangeField("startingMusicArtist", e.target.value)}
                        placeholder="e.g. Intro Welcome Track"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-[10px] text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                      <label className="text-[8px] uppercase text-slate-400 block">Direct MP3 Audio URL</label>
                      <input 
                        type="text" 
                        value={config.startingMusicUrl || ""}
                        onChange={(e) => {
                          onChangeField("startingMusicUrl", e.target.value);
                          if (testStartingAudioPlaying && testStartingAudioRef.current) {
                            testStartingAudioRef.current.pause();
                            setTestStartingAudioPlaying(false);
                          }
                        }}
                        placeholder="https://example.com/intro-song.mp3"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-[10px] text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Instant Live Test Play Button */}
                    {config.startingMusicUrl && (
                      <div className="pt-2 flex flex-col space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!testStartingAudioRef.current) return;
                            if (testStartingAudioPlaying) {
                              testStartingAudioRef.current.pause();
                              setTestStartingAudioPlaying(false);
                            } else {
                              testStartingAudioRef.current.volume = config.musicVolume !== undefined ? config.musicVolume : 0.8;
                              testStartingAudioRef.current.play().then(() => {
                                setTestStartingAudioPlaying(true);
                              }).catch(err => {
                                console.warn("Direct play failed:", err);
                                triggerDialog({
                                  title: "Audio Playback Notice",
                                  message: "Could not stream starting audio directly from this link. Make sure the URL points directly to an audio file (.mp3, .wav) or upload a file from your device.",
                                  type: "alert"
                                });
                              });
                            }
                          }}
                          className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/50 text-amber-300 font-bold text-[11px] flex items-center justify-center space-x-2 transition cursor-pointer shadow"
                        >
                          <span>{testStartingAudioPlaying ? "⏸ Pause Starting Audio Preview" : "▶ Listen Live / Test Starting Song"}</span>
                        </button>
                        <audio 
                          ref={testStartingAudioRef} 
                          src={config.startingMusicUrl} 
                          onEnded={() => setTestStartingAudioPlaying(false)}
                          onError={() => setTestStartingAudioPlaying(false)}
                        />
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[9px] text-emerald-400 font-bold flex items-center space-x-1">
                            <span>✓ Starting Song Linked</span>
                          </span>
                          <button 
                            type="button"
                            onClick={() => {
                              onChangeField("startingMusicUrl", "");
                              onChangeField("startingMusicTitle", "");
                              onChangeField("startingMusicArtist", "");
                              if (testStartingAudioRef.current) testStartingAudioRef.current.pause();
                              setTestStartingAudioPlaying(false);
                            }}
                            className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/40 text-rose-300 hover:text-rose-100 rounded text-[9px] font-extrabold uppercase transition cursor-pointer"
                          >
                            Remove Song 1
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* SONG 2: MAIN INVITATION SONG */}
            {renderPartCard({
              title: "Song 2: Main Invitation Song",
              subtitle: "Plays throughout invitation after envelope opens",
              toggleKey: "mainMusicEnabled",
              icon: "🎶",
              badge: config.musicUrl ? "Active Track" : "No Audio",
              children: (
                <div className="p-3 bg-slate-900/80 rounded-xl border border-amber-500/30 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-300 block uppercase tracking-wider">
                      Main Song Audio File (MP3 / WAV / M4A)
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      config.musicUrl ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {config.musicUrl ? "Loaded" : "Empty"}
                    </span>
                  </div>

                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-1">Select Main Audio from Device</label>
                    <input 
                      type="file" 
                      accept="audio/*"
                      onChange={async (e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        try {
                          const dataUrl = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                          });
                          const customName = file.name.replace(/\.[^/.]+$/, "");
                          onChangeField("musicUrl", dataUrl);
                          onChangeField("musicTitle", customName);
                          onChangeField("musicArtist", "Custom Upload");
                        } catch (err) {
                          console.error("Failed to read audio file:", err);
                        }
                      }}
                      className="w-full text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer shadow-sm"
                    />
                  </div>

                  <div className="pt-2 border-t border-amber-500/20 space-y-2">
                    <span className="text-[9.5px] uppercase font-bold text-amber-300 block">Main Song Details &amp; Direct URL</span>
                    <div className="space-y-1.5">
                      <label className="text-[8px] uppercase text-slate-400 block">Main Song Title</label>
                      <input 
                        type="text" 
                        value={config.musicTitle || ""}
                        onChange={(e) => onChangeField("musicTitle", e.target.value)}
                        placeholder="e.g. Vakratunda Mahakaya / Wedding Melody"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-[10px] text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                      <label className="text-[8px] uppercase text-slate-400 block">Artist / Subtitle</label>
                      <input 
                        type="text" 
                        value={config.musicArtist || ""}
                        onChange={(e) => onChangeField("musicArtist", e.target.value)}
                        placeholder="e.g. Traditional Flute / Orchestral"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-[10px] text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                      <label className="text-[8px] uppercase text-slate-400 block">Direct MP3 Audio URL</label>
                      <input 
                        type="text" 
                        value={config.musicUrl || ""}
                        onChange={(e) => {
                          onChangeField("musicUrl", e.target.value);
                          if (testAudioPlaying && testAudioRef.current) {
                            testAudioRef.current.pause();
                            setTestAudioPlaying(false);
                          }
                        }}
                        placeholder="https://example.com/main-song.mp3"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-[10px] text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Instant Live Test Play Button */}
                    {config.musicUrl && (
                      <div className="pt-2 flex flex-col space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!testAudioRef.current) return;
                            if (testAudioPlaying) {
                              testAudioRef.current.pause();
                              setTestAudioPlaying(false);
                            } else {
                              testAudioRef.current.volume = config.musicVolume !== undefined ? config.musicVolume : 0.8;
                              testAudioRef.current.play().then(() => {
                                setTestAudioPlaying(true);
                              }).catch(err => {
                                console.warn("Direct play failed:", err);
                                triggerDialog({
                                  title: "Audio Playback Notice",
                                  message: "Could not stream audio directly from this link. Make sure the URL points directly to an audio file (.mp3, .wav) or select one of our curated tracks.",
                                  type: "alert"
                                });
                              });
                            }
                          }}
                          className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/50 text-amber-300 font-bold text-[11px] flex items-center justify-center space-x-2 transition cursor-pointer shadow"
                        >
                          <span>{testAudioPlaying ? "⏸ Pause Main Audio Preview" : "▶ Listen Live / Test Main Song"}</span>
                        </button>
                        <audio 
                          ref={testAudioRef} 
                          src={config.musicUrl} 
                          onEnded={() => setTestAudioPlaying(false)}
                          onError={() => setTestAudioPlaying(false)}
                        />
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[9px] text-emerald-400 font-bold flex items-center space-x-1">
                            <span>✓ Main Song Linked</span>
                          </span>
                          <button 
                            type="button"
                            onClick={() => {
                              onChangeField("musicUrl", "");
                              onChangeField("musicTitle", "");
                              onChangeField("musicArtist", "");
                              if (testAudioRef.current) testAudioRef.current.pause();
                              setTestAudioPlaying(false);
                            }}
                            className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/40 text-rose-300 hover:text-rose-100 rounded text-[9px] font-extrabold uppercase transition cursor-pointer"
                          >
                            Remove Song 2
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Explicit Save Both Songs to Invitation & Database */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-amber-500/40 space-y-2 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  if (onSave) {
                    onSave();
                  }
                  triggerDialog({
                    title: "Songs Saved Successfully!",
                    message: `🎵 Both songs are now permanently saved with this invitation in the database!\n\n• Song 1 (Starting): ${config.startingMusicEnabled !== false && config.startingMusicUrl ? (config.startingMusicTitle || 'Active') : 'Disabled / None'}\n• Song 2 (Main): ${config.mainMusicEnabled !== false && config.musicUrl ? (config.musicTitle || 'Active') : 'Disabled / None'}\n\nGuests will hear the starting song upon arrival, transitioning into the main song when the envelope opens!`,
                    type: "alert"
                  });
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <SvgCheck className="w-4 h-4 text-slate-950 font-bold" />
                <span>💾 Save Songs to Invitation &amp; Database</span>
              </button>
              <p className="text-[9px] text-center text-slate-400">
                Independent ON/OFF toggles allow using either song, both songs, or none.
              </p>
            </div>
      </div>
    )}

        {/* COUPLE & FAMILY TAB */}
        {activeTab === "couple" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Couple &amp; Family Details</h3>

            {/* FAMILIES SECTION HEADERS */}
            {renderPartCard({
              title: "Families Section Titles",
              toggleKey: "showCoupleTitles",
              children: (
                <div className="space-y-3">
                  {renderCategorizedElementTool("Section Subtitle", "storySubtitle", config.storySubtitle || "MEET THE FAMILIES")}
                  {renderCategorizedElementTool("Section Main Title", "storyTitle", config.storyTitle || "Vows of Two Dynasties")}
                </div>
              )
            })}

            {/* BRIDE DETAILS SECTION */}
            {renderPartCard({
              title: "1. Bride Typography & Details",
              toggleKey: "showBrideDetails",
              children: (
                <div className="space-y-3">
                  {renderCategorizedElementTool("Bride Card Title", "storyBrideTitle", config.storyBrideTitle || "The Beautiful Bride")}
                  {renderCategorizedElementTool("Bride Name Text", "storyBrideName", config.brideName || "Suman")}
                  {renderCategorizedElementTool("Bride Parent Label", "storyBrideParentLabel", config.storyBrideParentLabel || "Daughter of")}
                  {renderCategorizedElementTool("Bride Family Text", "storyBrideFamily", config.brideFamily || "Daughter of Mr. & Mrs. Rajesh Sharma")}
                </div>
              )
            })}

            {/* GROOM DETAILS SECTION */}
            {renderPartCard({
              title: "2. Groom Typography & Details",
              toggleKey: "showGroomDetails",
              children: (
                <div className="space-y-3">
                  {renderCategorizedElementTool("Groom Card Title", "storyGroomTitle", config.storyGroomTitle || "The Noble Groom")}
                  {renderCategorizedElementTool("Groom Name Text", "storyGroomName", config.groomName || "Vishal")}
                  {renderCategorizedElementTool("Groom Parent Label", "storyGroomParentLabel", config.storyGroomParentLabel || "Son of")}
                  {renderCategorizedElementTool("Groom Family Text", "storyGroomFamily", config.groomFamily || "Son of Mr. & Mrs. Vijay Patel")}
                </div>
              )
            })}

            {/* STORY DETAILS SECTION */}
            {renderPartCard({
              title: "3. Narrative & Story Portrait",
              toggleKey: "showStoryParagraph",
              children: (
                <div className="space-y-4">
                  {renderCategorizedElementTool("Story Path Title", "storyPathTitle", config.storyPathTitle || "Our Path of Serendipity")}
                  {renderCategorizedElementTool("Story Narrative Paragraph", "storyParagraph", config.storyParagraph || "From a chance encounter under rain-slicked maple leaves to cozy late-night kitchen dances...")}

                  {renderPartCard({
                    title: "Couple Story Portrait Photo",
                    toggleKey: "showStoryImage",
                    children: (
                      <div className="space-y-2">
                        <div>
                          <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Image URL</label>
                          <input 
                            type="text" 
                            value={config.storyImage || ""} 
                            onChange={(e) => onChangeField("storyImage", e.target.value)}
                            className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px] mb-1"
                          />
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileChange("storyImage", e)}
                            className="w-full text-xs text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                          />
                          {config.storyImage && (
                            <div className="mt-2 flex items-center space-x-2 bg-slate-950/80 p-2 rounded-lg border border-amber-500/30">
                              <img src={config.storyImage} alt="Story Preview" className="h-7 object-contain rounded" />
                              <span className="text-[9px] text-slate-100 font-bold truncate flex-1">Story Photo Active</span>
                              <button 
                                type="button"
                                onClick={() => onChangeField("storyImage", "")}
                                className="px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/40 text-rose-300 hover:text-rose-100 rounded text-[9px] font-extrabold uppercase transition"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1 text-[9px]">
                          <div>
                            <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Shape</label>
                            <CustomSelect
                              value={config.storyFrameShape || "portrait"}
                              onChange={(val) => onChangeField("storyFrameShape", val)}
                              options={[
                                { value: "oval", label: "Oval" },
                                { value: "portrait", label: "Portrait" },
                                { value: "square", label: "Square" },
                                { value: "round", label: "Round" },
                                { value: "landscape", label: "Landscape" }
                              ]}
                            />
                          </div>
                          <div>
                            <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Border Style</label>
                            <CustomSelect
                              value={config.storyFrameBorderTheme || "double-gilded"}
                              onChange={(val) => onChangeField("storyFrameBorderTheme", val)}
                              options={[
                                { value: "double-gilded", label: "Gilded" },
                                { value: "pearls", label: "Pearls" },
                                { value: "floral-lace", label: "Lace" },
                                { value: "minimalist", label: "Minimal" }
                              ]}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div className="border-t border-white/10 pt-3">
                    {renderShadowControlBlock("Couple Section Shadow", "couple", "rgba(0, 0, 0, 0.2)")}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ENVELOPE DESIGN TAB */}
        {activeTab === "envelope" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Envelope & Opening Experiences</h3>

            {/* Opening Experience Style Selector (Dropdown Menu) */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-amber-500/30 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-300 block uppercase tracking-wider flex items-center gap-1.5">
                  <span>✨</span> Opening Experience Style
                </span>
                <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                  {config.envelopeOpeningStyle || "classic-envelope"}
                </span>
              </div>
              <p className="text-[8.5px] text-slate-400 leading-relaxed">
                Choose the cinematic opening animation that welcomes your guests:
              </p>
              
              {/* Dropdown Menu */}
              <div>
                <CustomSelect
                  value={config.envelopeOpeningStyle || "classic-envelope"}
                  onChange={(val) => onChangeField("envelopeOpeningStyle", val)}
                  options={[
                    { value: "classic-envelope", label: "✉️ Royal Wax Seal Envelope" },
                    { value: "royal-doors", label: "🚪 Grand Palace Real Wooden Doors" },
                    { value: "leaf-blown", label: "🍂 Whispering Real Autumn Leaves" },
                    { value: "petal-blown", label: "🌸 Romantic Real Rose Petals" },
                    { value: "royal-curtains", label: "🎭 Imperial Real Velvet Curtains" },
                  ]}
                />
              </div>

              {/* Cover Shape & Anti-Stretch Sizing Controls */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wide">
                    📐 Cover Shape & Device Layout
                  </span>
                  <span className="text-[8px] text-slate-400">Anti-Stretch</span>
                </div>
                
                <div>
                  <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Cover Sizing Mode</label>
                  <CustomSelect
                    value={config.envelopeSizingMode || "classic-rectangle"}
                    onChange={(val) => onChangeField("envelopeSizingMode", val)}
                    options={[
                      { value: "classic-rectangle", label: "📐 Classic Rectangle (No Stretch - Recommended)" },
                      { value: "responsive-card", label: "📱 Responsive Adaptive Frame" },
                      { value: "full-bleed", label: "🖥️ Full-Bleed Viewport (Edge-to-Edge)" },
                    ]}
                  />
                </div>

                {config.envelopeSizingMode !== "full-bleed" && (
                  <div className="space-y-1.5 pt-1 bg-slate-950/60 p-2 rounded border border-slate-850">
                    <div>
                      <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Rectangle Proportions</label>
                      <CustomSelect
                        value={config.envelopeAspectRatio || "auto"}
                        onChange={(val) => onChangeField("envelopeAspectRatio", val)}
                        options={[
                          { value: "auto", label: "🔄 Auto Responsive (Phone Portrait / PC Landscape)" },
                          { value: "classic-horizontal", label: "✉️ Landscape Envelope (1.45 : 1)" },
                          { value: "portrait", label: "📱 Portrait Invitation Card (1 : 1.38)" },
                          { value: "square", label: "🪟 Royal Square (1 : 1)" },
                        ]}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-0.5">
                        <label className="text-[8px] uppercase text-slate-400">Max Envelope Width (px)</label>
                        <span className="text-[8px] text-amber-500 font-mono">{config.envelopeMaxWidth || 760}px</span>
                      </div>
                      <input
                        type="range"
                        min="480"
                        max="1020"
                        step="20"
                        value={config.envelopeMaxWidth || 760}
                        onChange={(e) => onChangeField("envelopeMaxWidth", parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Real Asset Controls & Options based on selected style */}
              {config.envelopeOpeningStyle === "petal-blown" && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-rose-300 uppercase tracking-wide">
                      🌸 Real Rose Petal Asset
                    </span>
                    <span className="text-[8px] text-slate-400">Photorealistic</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-lg border border-rose-500/30">
                    <img 
                      src={config.envelopePetalImg || "/real_rose_petal.jpg"} 
                      alt="Rose Petal" 
                      className="w-10 h-10 object-contain rounded bg-black shrink-0 border border-rose-500/40" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[8.5px] text-slate-300 font-semibold truncate">Real Red Rose Petal</p>
                      <p className="text-[7.5px] text-slate-500">Natural curling veins & velvet texture</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Custom Petal Image URL or Upload</label>
                    <input 
                      type="text" 
                      value={config.envelopePetalImg || "/real_rose_petal.jpg"} 
                      onChange={(e) => onChangeField("envelopePetalImg", e.target.value)}
                      placeholder="/real_rose_petal.jpg"
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[9px] mb-1 font-mono text-slate-300"
                    />
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange("envelopePetalImg", e)}
                      className="w-full text-xs text-slate-300 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-rose-500 file:text-white hover:file:bg-rose-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {config.envelopeOpeningStyle === "leaf-blown" && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wide">
                      🍂 Real Autumn Leaf Asset
                    </span>
                    <span className="text-[8px] text-slate-400">Photorealistic</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-lg border border-amber-500/30">
                    <img 
                      src={config.envelopeLeafImg || "/real_autumn_leaf.jpg"} 
                      alt="Autumn Leaf" 
                      className="w-10 h-10 object-contain rounded bg-black shrink-0 border border-amber-500/40" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[8.5px] text-slate-300 font-semibold truncate">Real Golden Maple Leaf</p>
                      <p className="text-[7.5px] text-slate-500">Natural veins & crisp autumn foliage</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Custom Leaf Image URL or Upload</label>
                    <input 
                      type="text" 
                      value={config.envelopeLeafImg || "/real_autumn_leaf.jpg"} 
                      onChange={(e) => onChangeField("envelopeLeafImg", e.target.value)}
                      placeholder="/real_autumn_leaf.jpg"
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[9px] mb-1 font-mono text-slate-300"
                    />
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange("envelopeLeafImg", e)}
                      className="w-full text-xs text-slate-300 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {config.envelopeOpeningStyle === "royal-doors" && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wide">
                      🚪 Real Palace Doors Asset
                    </span>
                    <span className="text-[8px] text-slate-400">Photorealistic</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-lg border border-amber-500/30">
                    <img 
                      src={config.envelopeDoorsImg || "/real_palace_doors.jpg"} 
                      alt="Palace Doors" 
                      className="w-10 h-10 object-cover rounded bg-black shrink-0 border border-amber-500/40" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[8.5px] text-slate-300 font-semibold truncate">Indian Heritage Palace Doors</p>
                      <p className="text-[7.5px] text-slate-500">Carved teakwood & brass lion knockers</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Custom Doors Image URL or Upload</label>
                    <input 
                      type="text" 
                      value={config.envelopeDoorsImg || "/real_palace_doors.jpg"} 
                      onChange={(e) => onChangeField("envelopeDoorsImg", e.target.value)}
                      placeholder="/real_palace_doors.jpg"
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[9px] mb-1 font-mono text-slate-300"
                    />
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange("envelopeDoorsImg", e)}
                      className="w-full text-xs text-slate-300 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {config.envelopeOpeningStyle === "royal-curtains" && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wide">
                      🎭 Real Velvet Curtains Asset
                    </span>
                    <span className="text-[8px] text-slate-400">Photorealistic</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-lg border border-amber-500/30">
                    <img 
                      src={config.envelopeCurtainsImg || "/real_velvet_curtains.jpg"} 
                      alt="Velvet Curtains" 
                      className="w-10 h-10 object-cover rounded bg-black shrink-0 border border-amber-500/40" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[8.5px] text-slate-300 font-semibold truncate">Royal Crimson Velvet Drapes</p>
                      <p className="text-[7.5px] text-slate-500">Heavy silk folds & golden bullion fringe</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Custom Curtains Image URL or Upload</label>
                    <input 
                      type="text" 
                      value={config.envelopeCurtainsImg || "/real_velvet_curtains.jpg"} 
                      onChange={(e) => onChangeField("envelopeCurtainsImg", e.target.value)}
                      placeholder="/real_velvet_curtains.jpg"
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[9px] mb-1 font-mono text-slate-300"
                    />
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange("envelopeCurtainsImg", e)}
                      className="w-full text-xs text-slate-300 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pinterest Envelope Design Presets */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 block uppercase tracking-wide">
                  ✉ Envelope Design Presets (Pinterest)
                </span>
                <span className="text-[8px] text-slate-400">1-Click Fullscreen</span>
              </div>
              <p className="text-[8.5px] text-slate-400">
                Photorealistic envelope design presets matching Pinterest references:
              </p>
              
              {/* Curated Presets Grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {(envelopePresets || []).filter(ep => ep.isDefault !== false).map((ep) => (
                  <button
                    key={ep.id || ep.name}
                    type="button"
                    onClick={() => {
                      onChangeField("envelopeBgColor", ep.bg);
                      onChangeField("envelopeSealColor", ep.seal);
                      onChangeField("envelopeSealType", ep.type || "heart");
                      onChangeField("envelopeFlapShape", ep.flap || "classic-v");
                      onChangeField("envelopeSealShape", ep.shape || "organic");
                      onChangeField("envelopeParticleType", ep.particles || "sparkles");
                      if (ep.speed) onChangeField("envelopeSpeed", ep.speed);
                      if (ep.count !== undefined) onChangeField("envelopeParticles", ep.count);
                      if (ep.sealTop !== undefined) onChangeField("envelopeSealTop", ep.sealTop);
                      if (ep.bgImage !== undefined) onChangeField("envelopeBgImage", ep.bgImage);
                      if (ep.flapBgStart) onChangeField("envelopeFlapBgStart", ep.flapBgStart);
                      if (ep.flapBgEnd) onChangeField("envelopeFlapBgEnd", ep.flapBgEnd);
                    }}
                    className={`flex items-center space-x-2 p-1.5 rounded-lg border text-left transition text-[9px] cursor-pointer ${
                      config.envelopeBgColor === ep.bg 
                        ? 'border-amber-400 bg-amber-500/15 text-amber-200' 
                        : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full border border-white/20 shrink-0 relative flex items-center justify-center shadow-inner" style={{ backgroundColor: ep.bg }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ep.seal }} />
                    </div>
                    <span className="truncate font-semibold">{ep.name}</span>
                  </button>
                ))}
              </div>

              {/* Custom Saved Envelope Presets */}
              {(envelopePresets || []).filter(ep => !ep.isDefault).length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-850">
                  <span className="text-[8.5px] font-bold text-amber-300 uppercase tracking-wider block">
                    My Custom Saved Envelope Presets ({envelopePresets.filter(ep => !ep.isDefault).length})
                  </span>
                  <div className="grid grid-cols-1 gap-1">
                    {envelopePresets.filter(ep => !ep.isDefault).map((ep) => (
                      <div
                        key={ep.id}
                        className={`flex items-center justify-between p-1.5 rounded-lg border text-left transition text-[9px] ${
                          config.envelopeBgColor === ep.bg 
                            ? 'border-amber-400 bg-amber-500/15 text-amber-200' 
                            : 'border-slate-850 bg-slate-950/80 text-slate-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onChangeField("envelopeBgColor", ep.bg);
                            onChangeField("envelopeSealColor", ep.seal);
                            onChangeField("envelopeSealType", ep.type || "heart");
                            onChangeField("envelopeFlapShape", ep.flap || "classic-v");
                            onChangeField("envelopeSealShape", ep.shape || "organic");
                            onChangeField("envelopeParticleType", ep.particles || "sparkles");
                            if (ep.speed) onChangeField("envelopeSpeed", ep.speed);
                            if (ep.count !== undefined) onChangeField("envelopeParticles", ep.count);
                            if (ep.sealTop !== undefined) onChangeField("envelopeSealTop", ep.sealTop);
                            if (ep.bgImage !== undefined) onChangeField("envelopeBgImage", ep.bgImage);
                            if (ep.waxImg !== undefined) onChangeField("envelopeWaxSealImg", ep.waxImg);
                            if (ep.flapBgStart) onChangeField("envelopeFlapBgStart", ep.flapBgStart);
                            if (ep.flapBgEnd) onChangeField("envelopeFlapBgEnd", ep.flapBgEnd);
                          }}
                          className="flex items-center space-x-2 truncate flex-1 cursor-pointer text-left"
                        >
                          <div className="w-4 h-4 rounded-full border border-white/20 shrink-0 relative flex items-center justify-center shadow-inner" style={{ backgroundColor: ep.bg }}>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ep.seal }} />
                          </div>
                          <span className="truncate font-semibold">{ep.name}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            triggerDialog({
                              type: 'confirm',
                              title: 'Permanently Delete Envelope Preset',
                              message: `Are you sure you want to permanently delete envelope preset "${ep.name}" from the database? It will not be recovered.`,
                              confirmText: 'Delete Permanently',
                              onConfirm: () => {
                                dbStore.deleteEnvelopePreset(ep.id);
                                setEnvelopePresets(dbStore.getEnvelopePresets());
                              }
                            });
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1 text-[10px] cursor-pointer"
                          title="Delete preset"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Save Envelope Preset & Save Full Design Template */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    triggerDialog({
                      type: 'prompt',
                      title: 'Save Envelope Preset',
                      message: 'Enter a name for this custom envelope design preset:',
                      defaultValue: `${config.envelopeNamesText || 'Custom'} Envelope Theme`,
                      onConfirm: (presetName) => {
                        if (!presetName) return;
                        try {
                          const envelopeConfig = {
                            envelopeBgColor: config.envelopeBgColor,
                            envelopeSealColor: config.envelopeSealColor,
                            envelopeFlapShape: config.envelopeFlapShape,
                            envelopeSealShape: config.envelopeSealShape,
                            envelopeSealType: config.envelopeSealType,
                            envelopeWaxSealImg: config.envelopeWaxSealImg,
                            envelopeSealTop: config.envelopeSealTop,
                            envelopeParticleType: config.envelopeParticleType,
                            envelopeSpeed: config.envelopeSpeed,
                            envelopeParticles: config.envelopeParticles,
                            envelopeBgImage: config.envelopeBgImage,
                            envelopeFlapBgStart: config.envelopeFlapBgStart,
                            envelopeFlapBgEnd: config.envelopeFlapBgEnd
                          };
                          dbStore.createEnvelopePreset(presetName, envelopeConfig);
                          setEnvelopePresets(dbStore.getEnvelopePresets());
                          if (onSave) onSave();
                          triggerDialog({
                            type: 'alert',
                            title: 'Envelope Preset Saved',
                            message: `Successfully saved envelope design preset "${presetName}"! It is now listed under your presets.`
                          });
                        } catch(e) {
                          console.error("Failed to save envelope preset:", e);
                        }
                      }
                    });
                  }}
                  className="w-full py-1.5 px-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded text-[9px] font-bold uppercase tracking-wider transition text-center flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>💾 Save Envelope Preset</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerDialog({
                      type: 'prompt',
                      title: 'Save New Design Template',
                      message: 'Enter a title for this complete invitation & envelope template preset:',
                      defaultValue: `${config.brideName || 'Bride'} & ${config.groomName || 'Groom'}'s Theme`,
                      onConfirm: (titleInput) => {
                        if (!titleInput) return;
                        try {
                          const newP = dbStore.createPresetFromInvitation(config, titleInput);
                          onChangeField("presetId", newP.id);
                          if (onSave) onSave();
                          triggerDialog({
                            type: 'alert',
                            title: 'Design Preset Created',
                            message: `Successfully created and saved design template "${titleInput}" into the template gallery!`
                          });
                        } catch(err) {
                          console.error("Failed to create preset:", err);
                        }
                      }
                    });
                  }}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-amber-500/20 to-yellow-600/20 hover:from-amber-500/30 hover:to-yellow-600/30 border border-amber-500/50 text-amber-200 rounded text-[9px] font-bold uppercase tracking-wider transition text-center flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>🌟 Save as Design Template</span>
                </button>
              </div>
            </div>
            
            {renderPartCard({
              title: "Wax Seal & Stamp Settings",
              toggleKey: "showEnvelopeSeal",
              children: (
                <div className="space-y-3 pt-1">
                  {renderRgbaControlSelfParsed("Envelope Background Color", "envelopeBgColor", config.primaryColor || "#0b1329")}
                  {renderRgbaControlSelfParsed("Flap Gradient Start", "envelopeFlapBgStart", `${config.accentGold || "#f59e0b"}20`)}
                  {renderRgbaControlSelfParsed("Flap Gradient End", "envelopeFlapBgEnd", `${config.accentGold || "#f59e0b"}20`)}
                  {renderRgbaControlSelfParsed("Wax Seal Color", "envelopeSealColor", "#991b1b")}
                  
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Envelope Flap Cut & Shape</label>
                    <CustomSelect
                      value={config.envelopeFlapShape || "classic-v"}
                      onChange={(val) => onChangeField("envelopeFlapShape", val)}
                      options={[
                        { value: "classic-v", label: "Classic V-Cut Flap" },
                        { value: "curved-scoop", label: "Elegant Curved Scoop" },
                        { value: "deep-royal", label: "Deep Royal Flap" }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Wax Seal Outer Contour</label>
                    <CustomSelect
                      value={config.envelopeSealShape || "organic"}
                      onChange={(val) => onChangeField("envelopeSealShape", val)}
                      options={[
                        { value: "organic", label: "Natural Melted Wax (Classic)" },
                        { value: "circle", label: "Crisp Circle Seal" },
                        { value: "shield", label: "Royal Heritage Shield" },
                        { value: "hexagon", label: "Modern Hexagon Seal" }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Wax Seal Stamp Icon / Style</label>
                    <CustomSelect
                      value={config.envelopeSealType || "real-gold"}
                      onChange={(val) => {
                        onChangeField("envelopeSealType", val);
                        if (val === "real-gold") {
                          onChangeField("envelopeWaxSealImg", "/real_wax_seal_gold.jpg");
                        } else if (val === "real-burgundy") {
                          onChangeField("envelopeWaxSealImg", "/real_wax_seal_burgundy.jpg");
                        }
                      }}
                      options={[
                        { value: "real-gold", label: "👑 Antique Gold Real Wax Seal" },
                        { value: "real-burgundy", label: "🔴 Imperial Crimson Real Wax Seal" },
                        { value: "initials", label: "✍️ Engraved Royal Monogram (S&V)" },
                        { value: "heart", label: "Classic Heart ❤" },
                        { value: "ganesh", label: "Sacred Ganesha / Om 🕉" },
                        { value: "rings", label: "Interlocking Rings 💍" },
                        { value: "rose", label: "Royal Rose 🌹" },
                        { value: "crown", label: "Imperial Crown 👑" },
                        { value: "custom", label: "Custom Seal Image 🖼" }
                      ]}
                    />
                  </div>

                  {/* Wax Seal Dimensions & Scale Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-0.5">
                      <label className="text-[8px] uppercase text-slate-400">Wax Seal Size (px)</label>
                      <span className="text-[8px] text-amber-500 font-mono">{config.envelopeSealSizePx || 104}px</span>
                    </div>
                    <input
                      type="range"
                      min="64"
                      max="160"
                      value={config.envelopeSealSizePx || 104}
                      onChange={(e) => onChangeField("envelopeSealSizePx", parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  {/* Custom Wax Seal Image Upload if Custom Selected or optionally */}
                  <div className="p-2 bg-slate-950/70 rounded border border-slate-850 space-y-1.5">
                    <label className="text-[8px] uppercase text-slate-350 block font-semibold">Custom Wax Stamp Logo / Emblem</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            const compressed = await compressImage(file);
                            onChangeField("envelopeWaxSealImg", compressed);
                            onChangeField("envelopeSealType", "custom");
                          } catch (err) {
                            console.error("Error compressing seal image:", err);
                          }
                        }
                      }}
                      className="w-full text-[9px] text-slate-300 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[8.5px] file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                    />
                    {config.envelopeWaxSealImg && (
                      <div className="flex items-center space-x-2 pt-1">
                        <img src={config.envelopeWaxSealImg} alt="Custom Seal Preview" className="w-8 h-8 rounded-full border border-amber-500/50 object-cover" />
                        <button
                          type="button"
                          onClick={() => onChangeField("envelopeWaxSealImg", "")}
                          className="text-[8px] text-rose-400 hover:underline cursor-pointer"
                        >
                          Clear custom emblem
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Wax Seal Vertical Position Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-0.5">
                      <label className="text-[8px] uppercase text-slate-400">Wax Sticker Placement Y (%)</label>
                      <span className="text-[8px] text-amber-500 font-mono">{config.envelopeSealTop !== undefined ? config.envelopeSealTop : 42}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="95"
                      value={config.envelopeSealTop !== undefined ? config.envelopeSealTop : 42}
                      onChange={(e) => onChangeField("envelopeSealTop", parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>
              )
            })}

            {renderPartCard({
              title: "Envelope Texture & Background",
              toggleKey: "showEnvelopeTexture",
              children: (
                <div className="p-3 bg-slate-900/60 rounded border border-slate-850 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 block uppercase tracking-wide">
                      Envelope Texture / Background Image
                    </span>
                    <span className="text-[8px] text-amber-400 font-mono">
                      {envelopeTextures.length} saved
                    </span>
                  </div>

                  {/* Real Cotton Paper Texture & Folds Toggles */}
                  <div className="p-2 bg-slate-950/80 rounded border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[8.5px] font-bold text-amber-300 uppercase tracking-wide">
                        📄 Real Cotton Cardstock Paper
                      </span>
                      <input
                        type="checkbox"
                        checked={config.showEnvelopePaperTexture !== false}
                        onChange={(e) => onChangeField("showEnvelopePaperTexture", e.target.checked)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                    </div>
                    {config.showEnvelopePaperTexture !== false && (
                      <div>
                        <div className="flex justify-between items-center mb-0.5">
                          <label className="text-[7.5px] uppercase text-slate-400">Paper Texture Grain & Fibers</label>
                          <span className="text-[8px] text-amber-500 font-mono">
                            {Math.round((config.envelopePaperOpacity !== undefined ? config.envelopePaperOpacity : 0.75) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={Math.round((config.envelopePaperOpacity !== undefined ? config.envelopePaperOpacity : 0.75) * 100)}
                          onChange={(e) => onChangeField("envelopePaperOpacity", parseInt(e.target.value) / 100)}
                          onInput={(e) => onChangeField("envelopePaperOpacity", parseInt(e.target.value) / 100)}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer color-slider-horizontal"
                          style={{
                            background: 'linear-gradient(to right, rgba(214,173,97,0.1), rgba(214,173,97,1))',
                            padding: 0
                          }}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                      <span className="text-[8.5px] text-slate-300">
                        Realistic Paper Folds & Creases
                      </span>
                      <input
                        type="checkbox"
                        checked={config.showEnvelopeFolds !== false}
                        onChange={(e) => onChangeField("showEnvelopeFolds", e.target.checked)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  {/* File Uploader */}
                  <div className="space-y-1.5">
                    <label className="text-[7.5px] uppercase text-slate-400 block font-semibold">Upload Texture Image</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            const compressed = await compressImage(file);
                            onChangeField("envelopeBgImage", compressed);
                          } catch (err) {
                            console.error("Error compressing envelope image:", err);
                          }
                        }
                      }}
                      className="w-full text-[10px] text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                    />

                    {/* Active Texture Bar & Save as Preset */}
                    {config.envelopeBgImage && (
                      <div className="flex items-center justify-between p-1.5 bg-slate-950/80 rounded border border-amber-500/30">
                        <div className="flex items-center space-x-2 truncate">
                          <img 
                            src={config.envelopeBgImage} 
                            alt="Current Texture" 
                            className="w-7 h-7 rounded border border-amber-500/60 object-cover shrink-0" 
                          />
                          <span className="text-[8.5px] text-amber-200 font-medium truncate">Active Texture</span>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              triggerDialog({
                                type: 'prompt',
                                title: 'Save Texture Preset',
                                message: 'Enter a name for this envelope texture preset:',
                                defaultValue: 'Custom Luxury Texture',
                                onConfirm: (texName) => {
                                  if (!texName) return;
                                  dbStore.createEnvelopeTexture(texName, config.envelopeBgImage);
                                  setEnvelopeTextures(dbStore.getEnvelopeTextures());
                                  triggerDialog({
                                    type: 'alert',
                                    title: 'Texture Saved',
                                    message: `Successfully saved "${texName}" to your texture library!`
                                  });
                                }
                              });
                            }}
                            className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded text-[8px] font-bold uppercase transition cursor-pointer"
                          >
                            💾 Save Texture
                          </button>
                          <button
                            type="button"
                            onClick={() => onChangeField("envelopeBgImage", "")}
                            className="px-1.5 py-0.5 text-rose-400 hover:text-rose-300 text-[8px] cursor-pointer"
                            title="Remove texture"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Texture Library Row */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <label className="text-[8px] uppercase tracking-wider text-slate-350 block font-bold">
                        Texture Library
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          triggerDialog({
                            type: 'prompt',
                            title: 'Add Texture via Image URL',
                            message: 'Enter the direct image URL for the texture:',
                            placeholder: 'https://images.unsplash.com/...',
                            onConfirm: (urlInput) => {
                              if (!urlInput) return;
                              triggerDialog({
                                type: 'prompt',
                                title: 'Texture Name',
                                message: 'Enter a label for this texture:',
                                defaultValue: 'Custom Texture',
                                onConfirm: (nameInput) => {
                                  dbStore.createEnvelopeTexture(nameInput || 'Custom Texture', urlInput);
                                  setEnvelopeTextures(dbStore.getEnvelopeTextures());
                                  onChangeField("envelopeBgImage", urlInput);
                                  triggerDialog({
                                    type: 'alert',
                                    title: 'Texture Added',
                                    message: `Added "${nameInput || 'Custom Texture'}" to texture library!`
                                  });
                                }
                              });
                            }
                          });
                        }}
                        className="text-[7.5px] text-amber-400 hover:underline uppercase font-bold cursor-pointer"
                      >
                        ➕ Add by URL
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {/* Solid option (No Texture) */}
                      <button
                        type="button"
                        onClick={() => onChangeField("envelopeBgImage", "")}
                        className={`px-2 py-1 rounded text-[8px] font-bold border transition-all cursor-pointer ${
                          !config.envelopeBgImage 
                            ? "bg-amber-500/25 border-amber-500 text-amber-300 shadow-sm" 
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Solid
                      </button>

                      {/* Admin-saved custom textures */}
                      {envelopeTextures.map(tex => {
                        const isSelected = config.envelopeBgImage === tex.url;
                        return (
                          <div
                            key={tex.id}
                            className={`inline-flex items-center rounded border transition-all ${
                              isSelected 
                                ? "bg-amber-500/20 border-amber-500 text-amber-300" 
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => onChangeField("envelopeBgImage", tex.url)}
                              className="px-2 py-1 text-[8px] font-medium cursor-pointer truncate max-w-[110px]"
                              title={tex.name}
                            >
                              {tex.name}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerDialog({
                                  type: 'confirm',
                                  title: 'Delete Texture',
                                  message: `Delete texture "${tex.name}" from your library?`,
                                  onConfirm: () => {
                                    dbStore.deleteEnvelopeTexture(tex.id);
                                    setEnvelopeTextures(dbStore.getEnvelopeTextures());
                                    if (config.envelopeBgImage === tex.url) {
                                      onChangeField("envelopeBgImage", "");
                                    }
                                  }
                                });
                              }}
                              className="px-1 text-slate-500 hover:text-rose-400 text-[8px] cursor-pointer"
                              title="Delete texture"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {envelopeTextures.length === 0 && (
                      <p className="text-[7.5px] text-slate-500 italic">
                        No custom textures saved yet. Upload an image above and click "Save Texture" to build your library.
                      </p>
                    )}
                  </div>
                </div>
              )
            })}

            {renderPartCard({
              title: "Opening Animation & Particles",
              toggleKey: "showEnvelopeFiligree",
              children: (
                <div className="space-y-2 p-2.5 bg-slate-900/40 rounded border border-slate-850">
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Opening Particle Type</label>
                    <CustomSelect
                      value={config.envelopeParticleType || "sparkles"}
                      onChange={(val) => onChangeField("envelopeParticleType", val)}
                      options={[
                        { value: "sparkles", label: "Golden Sparkles ✨" },
                        { value: "hearts", label: "Romantic Hearts 💕" },
                        { value: "petals", label: "Rose Petals 🌸" },
                        { value: "confetti", label: "Festive Confetti 🎉" },
                        { value: "om", label: "Sacred Symbols 🕉" }
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Opening Speed (secs)</label>
                      <input 
                        type="range" min="0.5" max="3" step="0.1"
                        value={config.envelopeSpeed !== undefined ? config.envelopeSpeed : 1.2}
                        onChange={(e) => onChangeField("envelopeSpeed", e.target.value)}
                        className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="text-right text-[8px] text-slate-400 font-mono mt-0.5">{config.envelopeSpeed || 1.2}s</div>
                    </div>
                    <div>
                      <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Particle Count</label>
                      <input 
                        type="range" min="0" max="80" step="5"
                        value={config.envelopeParticles !== undefined ? config.envelopeParticles : 20}
                        onChange={(e) => onChangeField("envelopeParticles", parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="text-right text-[8px] text-slate-400 font-mono mt-0.5">{config.envelopeParticles || 20} particles</div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {renderShadowControlBlock("Envelope", "envelope", "rgba(0, 0, 0, 0.45)")}

            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 pt-2 border-t border-slate-900">Envelope Typography & Labels</h3>

            {/* SACRED SYMBOL OVERRIDE (DEDICATED STUDIO: TEXT OR CLIPART/IMAGE) */}
            {(() => {
              const isImgSymbol = config.envelopeSymbolType === "image" || (config.envelopeSymbolType !== "text" && !!config.envelopeSymbolImg);
              return renderPartCard({
                key: "envelopeSymbol",
                title: "Sacred Symbol Override Settings",
                toggleKey: "showEnvelopeSymbol",
                badge: isImgSymbol ? "🖼 Clipart" : "🔤 Text",
                children: (
                  <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-850 space-y-3">
                    {/* Mode Switcher Tabs */}
                    <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          onChangeField("envelopeSymbolType", "text");
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-md text-[9px] font-bold flex items-center justify-center space-x-1 transition cursor-pointer ${
                          !isImgSymbol
                            ? "bg-amber-500 text-slate-950 shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span>🔤 Text / Emoji</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onChangeField("envelopeSymbolType", "image");
                          if (!config.envelopeSymbolImg && CURATED_CLIPARTS && CURATED_CLIPARTS.length > 0) {
                            onChangeField("envelopeSymbolImg", CURATED_CLIPARTS[0].url);
                          }
                        }}
                        className={`flex-1 py-1.5 px-2 rounded-md text-[9px] font-bold flex items-center justify-center space-x-1 transition cursor-pointer ${
                          isImgSymbol
                            ? "bg-amber-500 text-slate-950 shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span>🖼 Clipart / Image</span>
                      </button>
                    </div>

                    {isImgSymbol ? (
                      /* ─── CLIPART & IMAGE STUDIO ─── */
                      <div className="space-y-3">
                        {/* Curated Clipart Library Picker */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[8.5px] uppercase font-extrabold text-amber-300 tracking-wider">
                              Curated Clipart Library
                            </label>
                            <span className="text-[7.5px] text-slate-400">10 Vector Icons</span>
                          </div>
                          <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-slate-950/80 rounded-lg border border-slate-850">
                            {(CURATED_CLIPARTS || []).map((clip) => {
                              const isSelected = config.envelopeSymbolImg === clip.url;
                              return (
                                <button
                                  key={clip.id}
                                  type="button"
                                  onClick={() => {
                                    onChangeField("envelopeSymbolImg", clip.url);
                                    onChangeField("envelopeSymbolType", "image");
                                  }}
                                  title={`${clip.name} (${clip.category})`}
                                  className={`p-1.5 rounded-lg border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer group ${
                                    isSelected
                                      ? "bg-amber-500/25 border-amber-400 ring-1 ring-amber-400 shadow-sm"
                                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                                  }`}
                                >
                                  <div className="w-6 h-6 flex items-center justify-center">
                                    <img src={clip.url} alt={clip.name} className="w-5 h-5 object-contain group-hover:scale-110 transition-transform" />
                                  </div>
                                  <span className={`text-[7px] truncate max-w-full text-center font-medium ${isSelected ? "text-amber-300 font-bold" : "text-slate-400"}`}>
                                    {clip.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Upload Image / Custom URL */}
                        <div className="space-y-1.5 p-2 bg-slate-950/70 rounded-lg border border-slate-850">
                          <label className="text-[8px] uppercase text-slate-350 block font-bold">
                            Upload Custom Clipart / Image
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                try {
                                  const compressed = await compressImage(file, 1024, 1024, 0.9);
                                  onChangeField("envelopeSymbolImg", compressed);
                                  onChangeField("envelopeSymbolType", "image");
                                } catch (err) {
                                  console.error("Error loading clipart image:", err);
                                }
                              }
                            }}
                            className="w-full text-[9px] text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[8.5px] file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                          />
                          <div className="flex items-center space-x-1 pt-1">
                            <input
                              type="text"
                              value={config.envelopeSymbolImg || ""}
                              placeholder="Or paste image URL (https://...)"
                              onChange={(e) => {
                                onChangeField("envelopeSymbolImg", e.target.value);
                                if (e.target.value) onChangeField("envelopeSymbolType", "image");
                              }}
                              className="flex-1 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[9px] text-slate-200"
                            />
                            {config.envelopeSymbolImg && (
                              <button
                                type="button"
                                onClick={() => {
                                  onChangeField("envelopeSymbolImg", "");
                                  onChangeField("envelopeSymbolType", "text");
                                }}
                                className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/40 text-rose-300 rounded text-[8px] font-bold uppercase transition"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          {/* Active Preview Strip */}
                          {config.envelopeSymbolImg && (
                            <div className="mt-1.5 flex items-center justify-between p-1.5 bg-slate-900 rounded border border-amber-500/30">
                              <div className="flex items-center space-x-2 truncate">
                                <img
                                  src={config.envelopeSymbolImg}
                                  alt="Active Symbol"
                                  className="w-6 h-6 object-contain rounded bg-slate-950/80 p-0.5 border border-amber-500/40 shrink-0"
                                />
                                <span className="text-[8px] text-amber-300 font-bold truncate">Active Symbol Loaded</span>
                              </div>
                              <span className="text-[7.5px] text-emerald-400 font-mono font-bold">Vector / HD Ready</span>
                            </div>
                          )}
                        </div>

                        {/* Scale & Pixel Size Controls */}
                        <div className="space-y-2 p-2 bg-slate-950/70 rounded-lg border border-slate-850">
                          <span className="text-[8px] uppercase tracking-wider font-extrabold text-amber-300 block">
                            Scale &amp; Sizing Controls
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {/* Scale Multiplier */}
                            <div>
                              <div className="flex justify-between items-center text-[7.5px] uppercase text-slate-400 font-bold mb-0.5">
                                <span>Scale Multiplier</span>
                                <span className="text-amber-400 font-mono font-bold">
                                  {config.envelopeSymbolScale !== undefined ? `${config.envelopeSymbolScale}x` : "1.0x"}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <input
                                  type="range"
                                  min="0.2"
                                  max="3.0"
                                  step="0.05"
                                  value={config.envelopeSymbolScale !== undefined ? config.envelopeSymbolScale : 1.0}
                                  onChange={(e) => onChangeField("envelopeSymbolScale", parseFloat(e.target.value))}
                                  className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => onChangeField("envelopeSymbolScale", 1.0)}
                                  className="px-1 py-0.2 text-[7px] text-slate-400 hover:text-amber-300 bg-slate-900 border border-slate-800 rounded font-mono"
                                  title="Reset scale"
                                >
                                  ↺
                                </button>
                              </div>
                            </div>

                            {/* Pixel Size */}
                            <div>
                              <div className="flex justify-between items-center text-[7.5px] uppercase text-slate-400 font-bold mb-0.5">
                                <span>Base Size (px)</span>
                                <span className="text-amber-400 font-mono font-bold">
                                  {config.envelopeSymbolSizePx || 48}px
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <input
                                  type="range"
                                  min="20"
                                  max="160"
                                  step="2"
                                  value={config.envelopeSymbolSizePx || 48}
                                  onChange={(e) => onChangeField("envelopeSymbolSizePx", parseInt(e.target.value))}
                                  className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => onChangeField("envelopeSymbolSizePx", 48)}
                                  className="px-1 py-0.2 text-[7px] text-slate-400 hover:text-amber-300 bg-slate-900 border border-slate-800 rounded font-mono"
                                  title="Reset size"
                                >
                                  ↺
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Move X, Move Y & Rotation Controls */}
                        <div className="space-y-2 p-2 bg-slate-950/70 rounded-lg border border-slate-850">
                          <span className="text-[8px] uppercase tracking-wider font-extrabold text-amber-300 block">
                            Position Offsets (Move Left/Right, Up/Down)
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {/* Move X (Left-Right) */}
                            <div>
                              <div className="flex justify-between items-center text-[7.5px] uppercase text-slate-400 font-bold mb-0.5">
                                <span>Move X (Left-Right)</span>
                                <span className="text-amber-400 font-mono font-bold">{config.envelopeSymbolX || 0}px</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <input
                                  type="range"
                                  min="-150"
                                  max="150"
                                  step="1"
                                  value={config.envelopeSymbolX || 0}
                                  onChange={(e) => onChangeField("envelopeSymbolX", parseInt(e.target.value))}
                                  className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => onChangeField("envelopeSymbolX", 0)}
                                  className="px-1 py-0.2 text-[7px] text-slate-400 hover:text-amber-300 bg-slate-900 border border-slate-800 rounded font-mono"
                                  title="Reset X"
                                >
                                  0
                                </button>
                              </div>
                            </div>

                            {/* Move Y (Up-Down) */}
                            <div>
                              <div className="flex justify-between items-center text-[7.5px] uppercase text-slate-400 font-bold mb-0.5">
                                <span>Move Y (Up-Down)</span>
                                <span className="text-amber-400 font-mono font-bold">
                                  {config.envelopeSymbolY !== undefined ? config.envelopeSymbolY : (config.envelopeSymbolTextYOffset || 0)}px
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <input
                                  type="range"
                                  min="-150"
                                  max="150"
                                  step="1"
                                  value={config.envelopeSymbolY !== undefined ? config.envelopeSymbolY : (config.envelopeSymbolTextYOffset || 0)}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    onChangeField("envelopeSymbolY", val);
                                    onChangeField("envelopeSymbolTextYOffset", val);
                                  }}
                                  className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    onChangeField("envelopeSymbolY", 0);
                                    onChangeField("envelopeSymbolTextYOffset", 0);
                                  }}
                                  className="px-1 py-0.2 text-[7px] text-slate-400 hover:text-amber-300 bg-slate-900 border border-slate-800 rounded font-mono"
                                  title="Reset Y"
                                >
                                  0
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Rotation & Alignment Row */}
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                            <div>
                              <div className="flex justify-between items-center text-[7.5px] uppercase text-slate-400 font-bold mb-0.5">
                                <span>Rotation Angle</span>
                                <span className="text-amber-400 font-mono font-bold">{config.envelopeSymbolRotate || 0}°</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <input
                                  type="range"
                                  min="-180"
                                  max="180"
                                  step="1"
                                  value={config.envelopeSymbolRotate || 0}
                                  onChange={(e) => onChangeField("envelopeSymbolRotate", parseInt(e.target.value))}
                                  className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => onChangeField("envelopeSymbolRotate", 0)}
                                  className="px-1 py-0.2 text-[7px] text-slate-400 hover:text-amber-300 bg-slate-900 border border-slate-800 rounded font-mono"
                                  title="Reset angle"
                                >
                                  0°
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="text-[7.5px] uppercase text-slate-400 block font-bold mb-0.5">Horizontal Align</label>
                              <div className="grid grid-cols-3 gap-1">
                                {[
                                  { id: "text-left", label: "Left" },
                                  { id: "text-center", label: "Center" },
                                  { id: "text-right", label: "Right" }
                                ].map((aln) => (
                                  <button
                                    key={aln.id}
                                    type="button"
                                    onClick={() => onChangeField("envelopeSymbolAlign", aln.id)}
                                    className={`py-0.5 text-[8px] rounded font-bold border transition ${
                                      (config.envelopeSymbolAlign || "text-center") === aln.id
                                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                                    }`}
                                  >
                                    {aln.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Overlays, Colors & Blending */}
                        <div className="space-y-2 p-2 bg-slate-950/70 rounded-lg border border-slate-850">
                          <span className="text-[8px] uppercase tracking-wider font-extrabold text-amber-300 block">
                            Overlays, Color Tint &amp; Blending
                          </span>
                          
                          {/* Color Tint with Quick Swatches */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[7.5px] uppercase text-slate-400 font-bold">
                              <span>Overlay Color Tint</span>
                              <div className="flex items-center space-x-1.5">
                                {config.envelopeSymbolTintColor && (
                                  <span className="text-[7.5px] font-mono text-amber-300">{config.envelopeSymbolTintColor}</span>
                                )}
                                <input
                                  type="color"
                                  value={config.envelopeSymbolTintColor || "#d4af37"}
                                  onChange={(e) => onChangeField("envelopeSymbolTintColor", e.target.value)}
                                  className="w-4 h-4 rounded cursor-pointer border border-white/20 p-0 bg-transparent"
                                  title="Custom tint color"
                                />
                                {config.envelopeSymbolTintColor && (
                                  <button
                                    type="button"
                                    onClick={() => onChangeField("envelopeSymbolTintColor", "")}
                                    className="text-[7.5px] text-rose-400 hover:underline"
                                  >
                                    None
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {[
                                { name: "Clear", color: "" },
                                { name: "Gold", color: "#d4af37" },
                                { name: "Amber", color: "#f59e0b" },
                                { name: "Burgundy", color: "#8a2b3f" },
                                { name: "White", color: "#ffffff" },
                                { name: "Emerald", color: "#065f46" },
                                { name: "Navy", color: "#0b1329" },
                                { name: "Silver", color: "#e2e8f0" }
                              ].map((swatch, sIdx) => {
                                const isCurrent = (config.envelopeSymbolTintColor || "") === swatch.color;
                                return (
                                  <button
                                    key={sIdx}
                                    type="button"
                                    onClick={() => onChangeField("envelopeSymbolTintColor", swatch.color)}
                                    className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold border transition ${
                                      isCurrent
                                        ? "border-amber-400 text-amber-300 bg-amber-500/20 shadow-sm"
                                        : "border-slate-800 text-slate-400 bg-slate-900 hover:text-slate-200"
                                    }`}
                                  >
                                    {swatch.color ? (
                                      <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle border border-white/30" style={{ backgroundColor: swatch.color }} />
                                    ) : (
                                      <span className="inline-block mr-1">✕</span>
                                    )}
                                    {swatch.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Blend Mode & Opacity */}
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                            <div>
                              <label className="text-[7.5px] uppercase text-slate-400 block font-bold mb-0.5">Blend Mode</label>
                              <CustomSelect
                                value={config.envelopeSymbolBlendMode || "normal"}
                                onChange={(val) => onChangeField("envelopeSymbolBlendMode", val)}
                                options={[
                                  { value: "normal", label: "Normal" },
                                  { value: "color", label: "Color (Mask)" },
                                  { value: "multiply", label: "Multiply" },
                                  { value: "screen", label: "Screen" },
                                  { value: "overlay", label: "Overlay" },
                                  { value: "soft-light", label: "Soft Light" },
                                  { value: "luminosity", label: "Luminosity" }
                                ]}
                              />
                            </div>
                            <div>
                              <div className="flex justify-between items-center text-[7.5px] uppercase text-slate-400 font-bold mb-0.5">
                                <span>Opacity</span>
                                <span className="text-amber-400 font-mono font-bold">
                                  {config.envelopeSymbolOpacity !== undefined ? `${Math.round(config.envelopeSymbolOpacity * 100)}%` : "100%"}
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0.05"
                                max="1.0"
                                step="0.05"
                                value={config.envelopeSymbolOpacity !== undefined ? config.envelopeSymbolOpacity : 1.0}
                                onChange={(e) => onChangeField("envelopeSymbolOpacity", parseFloat(e.target.value))}
                                onInput={(e) => onChangeField("envelopeSymbolOpacity", parseFloat(e.target.value))}
                                className="w-full h-2 rounded-lg appearance-none cursor-pointer color-slider-horizontal"
                                style={{
                                  background: 'linear-gradient(to right, rgba(214,173,97,0.1), rgba(214,173,97,1))',
                                  padding: 0
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Drop Shadow Controls */}
                        <div className="space-y-2 p-2 bg-slate-950/70 rounded-lg border border-slate-850">
                          <span className="text-[8px] uppercase tracking-wider font-extrabold text-amber-300 block">
                            Drop Shadow &amp; Depth
                          </span>
                          <div className="grid grid-cols-3 gap-1.5">
                            <div>
                              <div className="flex justify-between text-[7px] uppercase text-slate-400 font-bold mb-0.5">
                                <span>Blur</span>
                                <span className="font-mono text-amber-400">{config.envelopeSymbolShadowBlur !== undefined ? config.envelopeSymbolShadowBlur : 8}px</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="30"
                                step="1"
                                value={config.envelopeSymbolShadowBlur !== undefined ? config.envelopeSymbolShadowBlur : 8}
                                onChange={(e) => onChangeField("envelopeSymbolShadowBlur", parseInt(e.target.value))}
                                className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[7px] uppercase text-slate-400 font-bold mb-0.5">
                                <span>Offset X</span>
                                <span className="font-mono text-amber-400">{config.envelopeSymbolShadowX || 0}px</span>
                              </div>
                              <input
                                type="range"
                                min="-25"
                                max="25"
                                step="1"
                                value={config.envelopeSymbolShadowX || 0}
                                onChange={(e) => onChangeField("envelopeSymbolShadowX", parseInt(e.target.value))}
                                className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[7px] uppercase text-slate-400 font-bold mb-0.5">
                                <span>Offset Y</span>
                                <span className="font-mono text-amber-400">{config.envelopeSymbolShadowY !== undefined ? config.envelopeSymbolShadowY : 4}px</span>
                              </div>
                              <input
                                type="range"
                                min="-25"
                                max="25"
                                step="1"
                                value={config.envelopeSymbolShadowY !== undefined ? config.envelopeSymbolShadowY : 4}
                                onChange={(e) => onChangeField("envelopeSymbolShadowY", parseInt(e.target.value))}
                                className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                              />
                            </div>
                          </div>

                          {/* Shadow Color Swatches */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                            <span className="text-[7.5px] uppercase text-slate-400 font-bold">Shadow Mood:</span>
                            <div className="flex gap-1">
                              {[
                                { name: "Deep", val: "rgba(0, 0, 0, 0.65)" },
                                { name: "Gold Glow", val: "rgba(245, 158, 11, 0.5)" },
                                { name: "Soft", val: "rgba(0, 0, 0, 0.25)" },
                                { name: "None", val: "transparent" }
                              ].map((sh, shIdx) => (
                                <button
                                  key={shIdx}
                                  type="button"
                                  onClick={() => onChangeField("envelopeSymbolShadowColor", sh.val)}
                                  className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold border transition ${
                                    (config.envelopeSymbolShadowColor || "rgba(0, 0, 0, 0.5)") === sh.val
                                      ? "bg-amber-500/20 border-amber-500 text-amber-300"
                                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                                  }`}
                                >
                                  {sh.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Reset All Studio Button */}
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              onChangeField("envelopeSymbolScale", 1.0);
                              onChangeField("envelopeSymbolSizePx", 48);
                              onChangeField("envelopeSymbolX", 0);
                              onChangeField("envelopeSymbolY", 0);
                              onChangeField("envelopeSymbolTextYOffset", 0);
                              onChangeField("envelopeSymbolRotate", 0);
                              onChangeField("envelopeSymbolOpacity", 1.0);
                              onChangeField("envelopeSymbolBlendMode", "normal");
                              onChangeField("envelopeSymbolTintColor", "");
                              onChangeField("envelopeSymbolShadowBlur", 8);
                              onChangeField("envelopeSymbolShadowX", 0);
                              onChangeField("envelopeSymbolShadowY", 4);
                              onChangeField("envelopeSymbolShadowColor", "rgba(0, 0, 0, 0.5)");
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 rounded text-[8px] font-bold uppercase transition flex items-center space-x-1"
                          >
                            <span>↺ Reset All Clipart Transforms</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ─── TEXT / EMOJI MODE ─── */
                      <div className="space-y-2">
                        <div>
                          <input
                            type="text"
                            value={config.envelopeSymbolText || ""}
                            placeholder={config.customSacredSymbol || "❤"}
                            onChange={(e) => onChangeField("envelopeSymbolText", e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-950 border border-slate-850 rounded text-[10px]"
                          />
                          {/* Quick Emoji Swatches */}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {["❤", "ॐ", "🕉", "⚜", "👑", "💍", "🪷", "✨", "🕊️", "🌹"].map((emoji, eIdx) => (
                              <button
                                key={eIdx}
                                type="button"
                                onClick={() => onChangeField("envelopeSymbolText", emoji)}
                                className="w-5 h-5 flex items-center justify-center bg-slate-950 border border-slate-800 hover:border-amber-500 rounded text-[10px] cursor-pointer transition hover:scale-110"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          <div>
                            <label className="text-[7px] uppercase text-slate-400 block mb-0.5">Font</label>
                            <CustomFontSelect
                              value={config.envelopeSymbolFont || ""}
                              onChange={(val) => onChangeField("envelopeSymbolFont", val)}
                              options={FONTS}
                            />
                          </div>

                          <div>
                            <label className="text-[7px] uppercase text-slate-400 block mb-0.5">Size</label>
                            <CustomSelect
                              value={config.envelopeSymbolSize || ""}
                              onChange={(val) => onChangeField("envelopeSymbolSize", val)}
                              options={[
                                { value: "", label: "Default" },
                                { value: "text-[8px]", label: "8px" },
                                { value: "text-[9px]", label: "9px" },
                                { value: "text-[10px]", label: "10px" },
                                { value: "text-xs", label: "12px" },
                                { value: "text-sm", label: "14px" },
                                { value: "text-base", label: "16px" },
                                { value: "text-lg", label: "18px" },
                                { value: "text-xl", label: "20px" },
                                { value: "text-2xl", label: "24px" },
                                { value: "text-3xl", label: "30px" }
                              ]}
                            />
                          </div>

                          <div>
                            <label className="text-[7px] uppercase text-slate-400 block mb-0.5">Align</label>
                            <CustomSelect
                              value={config.envelopeSymbolAlign || "text-center"}
                              onChange={(val) => onChangeField("envelopeSymbolAlign", val)}
                              options={[
                                { value: "text-left", label: "Left" },
                                { value: "text-center", label: "Center" },
                                { value: "text-right", label: "Right" }
                              ]}
                            />
                          </div>
                        </div>

                        {renderRgbaControlSelfParsed("Sacred Symbol Override Color", "envelopeSymbolColor", config.accentGold || "#f59e0b")}

                        <div className="pt-1.5 border-t border-slate-800/50 space-y-1.5">
                          {renderPositionSlider("Sacred Symbol Override", "envelopeSymbolText")}

                          {/* Extra horizontal move & scale sliders for text symbol */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                              <div className="flex justify-between items-center text-[7.5px] uppercase text-slate-400 font-bold mb-0.5">
                                <span>Move X (Offset)</span>
                                <span className="text-amber-400 font-mono font-bold">{config.envelopeSymbolX || 0}px</span>
                              </div>
                              <input
                                type="range"
                                min="-120"
                                max="120"
                                step="1"
                                value={config.envelopeSymbolX || 0}
                                onChange={(e) => onChangeField("envelopeSymbolX", parseInt(e.target.value))}
                                className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-amber-500"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between items-center text-[7.5px] uppercase text-slate-400 font-bold mb-0.5">
                                <span>Scale Multiplier</span>
                                <span className="text-amber-400 font-mono font-bold">{config.envelopeSymbolScale || 1}x</span>
                              </div>
                              <input
                                type="range"
                                min="0.5"
                                max="2.5"
                                step="0.1"
                                value={config.envelopeSymbolScale !== undefined ? config.envelopeSymbolScale : 1.0}
                                onChange={(e) => onChangeField("envelopeSymbolScale", parseFloat(e.target.value))}
                                className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-amber-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              });
            })()}

            {[
              { key: "envelopeInitials", field: "envelopeInitials", label: "Wax Seal Initials", defaultVal: "S & V", toggleKey: "showEnvelopeStamp" },
              { key: "envelopeTagline", field: "envelopeTagline", label: "Envelope Tagline", defaultVal: "You're Invited", toggleKey: "showEnvelopeTagline" },
              { key: "envelopeNames", field: "envelopeNamesText", label: "Couple Names", defaultVal: `${config.brideName} & ${config.groomName}`, toggleKey: "showEnvelopeNames" },
              { key: "envelopeInviteLabel", field: "envelopeInviteLabelText", label: "Invitation Label Text", defaultVal: "Request the pleasure of your company", toggleKey: "showEnvelopeInviteLabel" }
            ].map(entity => (
              renderPartCard({
                key: entity.key,
                title: `${entity.label} Settings`,
                toggleKey: entity.toggleKey,
                children: (
                  <div className="p-2.5 bg-slate-900/60 rounded border border-slate-850 space-y-2">
                    <input
                      type="text"
                      value={config[entity.field] || ""}
                      placeholder={entity.defaultVal}
                      onChange={(e) => onChangeField(entity.field, e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-850 rounded text-[10px]"
                    />

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <div>
                        <label className="text-[7px] uppercase text-slate-400 block mb-0.5">Font</label>
                        <CustomFontSelect
                          value={config[`${entity.key}Font`] || ""}
                          onChange={(val) => onChangeField(`${entity.key}Font`, val)}
                          options={FONTS}
                        />
                      </div>

                      <div>
                        <label className="text-[7px] uppercase text-slate-400 block mb-0.5">Size</label>
                        <CustomSelect
                          value={config[`${entity.key}Size`] || ""}
                          onChange={(val) => onChangeField(`${entity.key}Size`, val)}
                          options={[
                            { value: "", label: "Default" },
                            { value: "text-[8px]", label: "8px" },
                            { value: "text-[9px]", label: "9px" },
                            { value: "text-[10px]", label: "10px" },
                            { value: "text-xs", label: "12px" },
                            { value: "text-sm", label: "14px" },
                            { value: "text-base", label: "16px" },
                            { value: "text-lg", label: "18px" },
                            { value: "text-xl", label: "20px" },
                            { value: "text-2xl", label: "24px" },
                            { value: "text-3xl", label: "30px" }
                          ]}
                        />
                      </div>

                      <div>
                        <label className="text-[7px] uppercase text-slate-400 block mb-0.5">Align</label>
                        <CustomSelect
                          value={config[`${entity.key}Align`] || "text-center"}
                          onChange={(val) => onChangeField(`${entity.key}Align`, val)}
                          options={[
                            { value: "text-left", label: "Left" },
                            { value: "text-center", label: "Center" },
                            { value: "text-right", label: "Right" }
                          ]}
                        />
                      </div>
                    </div>

                    {renderRgbaControlSelfParsed(`${entity.label} Color`, `${entity.key}Color`, config.accentGold || "#f59e0b")}

                    {entity.key !== "envelopeInitials" ? (
                      <div className="pt-1.5 border-t border-slate-800/50">
                        {renderPositionSlider(entity.label, entity.field)}
                      </div>
                    ) : (
                      <div className="pt-1.5 border-t border-slate-800/50">
                        <div>
                          <div className="flex justify-between items-center mb-0.5">
                            <label className="text-[8px] uppercase text-slate-400">Initials Offset Y (px)</label>
                            <span className="text-[8px] text-amber-500 font-mono">{config.envelopeInitialsYOffset !== undefined ? config.envelopeInitialsYOffset : -24}px</span>
                          </div>
                          <input
                            type="range"
                            min="-60"
                            max="40"
                            value={config.envelopeInitialsYOffset !== undefined ? config.envelopeInitialsYOffset : -24}
                            onChange={(e) => onChangeField("envelopeInitialsYOffset", parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            ))}

            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 pt-2 border-t border-slate-900">Open Invitation Button</h3>

            {renderPartCard({
              title: "Open Invitation Button (CTA)",
              toggleKey: "showEnvelopeBtn",
              children: (
                <div className="p-3 bg-slate-900/60 rounded border border-slate-850 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Button Text</label>
                      <input
                        type="text"
                        value={config.envelopeBtnText || ""}
                        onChange={(e) => onChangeField("envelopeBtnText", e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-850 rounded text-[10px] text-slate-200"
                        placeholder="Open Invitation"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Button Style Preset</label>
                      <CustomSelect
                        value={config.envelopeBtnDesign || "classic"}
                        onChange={(val) => onChangeField("envelopeBtnDesign", val)}
                        options={[
                          { value: "classic", label: "Classic Minimal Border" },
                          { value: "gilded-glow", label: "Gilded Gold Glow" },
                          { value: "glassmorphism", label: "Frosted Glassmorphism" },
                          { value: "royal-burgundy", label: "Royal Burgundy Matched" },
                          { value: "pulsing-aura", label: "Pulsing Aura Glow" }
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Button Font</label>
                      <CustomFontSelect
                        value={config.envelopeBtnFont || "font-sans"}
                        onChange={(val) => onChangeField("envelopeBtnFont", val)}
                        options={FONTS}
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Button Font Size</label>
                      <CustomSelect
                        value={config.envelopeBtnSize || "text-xs"}
                        onChange={(val) => onChangeField("envelopeBtnSize", val)}
                        options={[
                          { value: "text-[8px]", label: "8px" },
                          { value: "text-[9px]", label: "9px" },
                          { value: "text-[10px]", label: "10px" },
                          { value: "text-xs", label: "12px" },
                          { value: "text-sm", label: "14px" },
                          { value: "text-base", label: "16px" },
                          { value: "text-lg", label: "18px" }
                        ]}
                      />
                    </div>
                  </div>

                  {renderRgbaControlSelfParsed("Button Text/Border Color", "envelopeBtnColor", config.accentGold || "#f59e0b")}
                </div>
              )
            })}
          </div>
        )}

        {/* COVER DESIGN TAB */}
        {activeTab === "cover" && (
          <div className="space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Cover Layout & Elements</h3>

            {/* SECTION 1: COVER BACKGROUND & STYLING */}
            <div className="p-3 bg-slate-900/60 rounded border border-slate-850 space-y-4">
              <span className="text-[11px] font-bold text-amber-500 block uppercase tracking-wide">1. Background & Theme Layout</span>

              {/* Background Preset */}
              <div className="space-y-2 border-b border-slate-800 pb-3">
                <span className="text-[9px] font-bold text-slate-350 block uppercase tracking-wide">Background Design Presets</span>
                <p className="text-[8px] text-slate-400">Select an asset design to instantly configure luxury fonts and matching colors:</p>
                
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {bgPresets.map(preset => {
                    const isSelected = config.heroImage === preset.url;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => {
                          if (preset.presetKey) {
                            applyThemePreset(preset.presetKey);
                          } else {
                            onChangeField('heroImage', preset.url);
                            if (preset.config) {
                              Object.entries(preset.config).forEach(([k, v]) => {
                                onChangeField(k, v);
                              });
                            }
                          }
                        }}
                        className={`relative p-1.5 rounded-xl bg-slate-900/50 backdrop-blur border text-left transition flex flex-col items-center cursor-pointer group shadow-lg hover:border-amber-500/50 hover:shadow-amber-500/10 ${
                          isSelected 
                            ? 'border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/30' 
                            : 'border-white/10'
                        }`}
                      >
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerDialog({
                                type: 'confirm',
                                title: 'Permanently Delete Background Preset',
                                message: `Are you sure you want to permanently delete background preset "${preset.name}" from the database? It will not be recovered.`,
                                confirmText: 'Delete Permanently',
                                onConfirm: () => {
                                  dbStore.deleteBgPreset(preset.id);
                                  setBgPresets(dbStore.getBgPresets());
                                }
                              });
                            }}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold flex items-center justify-center border border-slate-950 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            title="Delete Preset"
                          >
                            ✕
                          </button>
                        )}
                        <img 
                          src={preset.url} 
                          alt={preset.name} 
                          className="w-full aspect-[3/4] object-cover rounded-lg mb-1 drop-shadow-md" 
                        />
                        <span className="text-[8px] font-semibold text-slate-300 truncate w-full text-center">
                          {preset.name}
                        </span>
                      </div>
                    );
                  })}
                  {isAdmin && (
                    <div
                      onClick={() => {
                        triggerDialog({
                          type: 'prompt',
                          title: 'Save Background Preset',
                          message: 'Enter a name for this new background design preset:',
                          defaultValue: 'Luxury Custom BG',
                          onConfirm: (name) => {
                            if (!name) return;
                            const presetConfig = {
                              coverTopTaglineColor: config.coverTopTaglineColor,
                              coverSubheadingColor: config.coverSubheadingColor,
                              coverBrideColor: config.coverBrideColor,
                              coverAmpersandColor: config.coverAmpersandColor,
                              coverGroomColor: config.coverGroomColor,
                              coverQuoteColor: config.coverQuoteColor,
                              coverBottomTaglineColor: config.coverBottomTaglineColor,
                              coverBottomTaglineBg: config.coverBottomTaglineBg,
                              coverBrideFont: config.coverBrideFont,
                              coverGroomFont: config.coverGroomFont,
                              coverAmpersandFont: config.coverAmpersandFont,
                              coverBorderColor: config.coverBorderColor,
                              coverInnerBorderColor: config.coverInnerBorderColor,
                              primaryColor: config.primaryColor,
                              accentGold: config.accentGold,
                              lightBgColor: config.lightBgColor
                            };
                            dbStore.createBgPreset(name, config.heroImage, presetConfig);
                            setBgPresets(dbStore.getBgPresets());
                            triggerDialog({
                              type: 'alert',
                              title: 'Success',
                              message: `Successfully saved background preset "${name}"!`
                            });
                          }
                        });
                      }}
                      className="relative p-1.5 rounded-xl bg-slate-950/40 border border-dashed border-amber-500/40 text-center transition flex flex-col justify-center items-center cursor-pointer hover:border-amber-500 hover:bg-slate-900/60 aspect-[3/4] shadow-md group"
                      title="Save Current Design as Preset"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                        <span className="text-amber-400 text-lg font-bold font-mono">+</span>
                      </div>
                      <span className="text-[7.5px] uppercase font-extrabold tracking-wider text-amber-400/80 group-hover:text-amber-300">
                        Add Preset
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Background Image Upload & Scaling/Crop */}
              <div className="space-y-3 border-b border-slate-800 pb-3">
                <span className="text-[9px] font-bold text-slate-350 block uppercase tracking-wide">Cover Background Image</span>
                
                {config.heroImage ? (
                  <div className="p-2 bg-slate-950/80 rounded-xl border border-amber-500/30 flex items-center space-x-3 shadow-md relative overflow-hidden group">
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden border border-slate-800 shrink-0">
                      <img src={config.heroImage} alt="Cover BG Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold block">Active Background</span>
                      <span className="text-[10px] text-slate-100 font-bold truncate block">
                        {config.heroImage.startsWith('data:') ? 'Custom Uploaded UHD Image' : config.heroImage.split('/').pop()}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <button 
                          type="button"
                          onClick={() => {
                            const fileInput = document.getElementById('heroImageReplaceInput');
                            if (fileInput) fileInput.click();
                          }}
                          className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded text-[8.5px] font-bold uppercase transition cursor-pointer"
                        >
                          Replace Image
                        </button>
                        <button 
                          type="button"
                          onClick={() => onChangeField("heroImage", "")}
                          className="px-2 py-0.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded text-[8.5px] font-bold uppercase transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                      <input 
                        type="file" 
                        id="heroImageReplaceInput"
                        accept="image/*"
                        onChange={(e) => handleFileChange("heroImage", e)}
                        className="hidden"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
                    <span className="text-[8.5px] text-slate-400 block font-semibold">No background image active</span>
                    <button
                      type="button"
                      onClick={() => {
                        const fileInput = document.getElementById('heroImageUploadInput');
                        if (fileInput) fileInput.click();
                      }}
                      className="px-3 py-1 bg-amber-500 text-slate-950 rounded-lg text-[9px] font-bold uppercase hover:bg-amber-600 transition cursor-pointer"
                    >
                      Upload Background
                    </button>
                    <input 
                      type="file" 
                      id="heroImageUploadInput"
                      accept="image/*"
                      onChange={(e) => handleFileChange("heroImage", e)}
                      className="hidden"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Or Enter Hero Image URL</label>
                  <input 
                    type="text" 
                    value={config.heroImage || ""} 
                    onChange={(e) => onChangeField("heroImage", e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded text-xs focus:outline-none focus:border-amber-500"
                    placeholder="https://example.com/background.jpg"
                  />
                </div>

                <div className="p-2.5 bg-slate-900/40 rounded border border-slate-850 space-y-2">
                  <span className="text-[9px] uppercase tracking-wider text-slate-300 block">Scaling &amp; Crop Offset</span>
                  
                  <div>
                    <div className="flex justify-between text-[8px] text-slate-400 mb-0.5">
                      <span>Background Scale</span>
                      <span>{config.coverHeroScale || 100}%</span>
                    </div>
                    <input 
                      type="range" min="50" max="250" step="5"
                      value={config.coverHeroScale || 100}
                      onChange={(e) => onChangeField("coverHeroScale", parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between text-[8px] text-slate-400 mb-0.5">
                        <span>X Crop (Left-Right)</span>
                        <span>{config.coverHeroXOffset ?? 50}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="5"
                        value={config.coverHeroXOffset ?? 50}
                        onChange={(e) => onChangeField("coverHeroXOffset", parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[8px] text-slate-400 mb-0.5">
                        <span>Y Crop (Up-Down)</span>
                        <span>{config.coverHeroYOffset ?? 50}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="5"
                        value={config.coverHeroYOffset ?? 50}
                        onChange={(e) => onChangeField("coverHeroYOffset", parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  </div>
                </div>
                {renderRgbaControlSelfParsed("Background Shade Overlay Start", "coverBgOverlayStart", "rgba(0, 0, 0, 0.45)")}
                {renderRgbaControlSelfParsed("Background Shade Overlay End", "coverBgOverlayEnd", "rgba(0, 0, 0, 0.70)")}
              </div>

              {/* General Theme Colors */}
              <div className="space-y-2 border-b border-slate-800 pb-3">
                <span className="text-[9px] font-bold text-slate-350 block uppercase tracking-wide">General Theme Colors</span>
                {renderRgbaControlSelfParsed("Primary Theme Color", "primaryColor", config.primaryColor || "#0b1329")}
                {renderRgbaControlSelfParsed("Accent Gold Color", "accentGold", config.accentGold || "#f59e0b")}
                {renderRgbaControlSelfParsed("Light Bg / Paper Color", "lightBgColor", config.lightBgColor || "#fcf8f2")}
              </div>

              {/* Borders and Styles */}
              {renderPartCard({
                title: "Frame & Border Outlines",
                toggleKey: "coverBorderEnabled",
                children: (
                  <div className="space-y-3 border-b border-slate-800 pb-3">
                    {renderRgbaControlSelfParsed("Corner Border Color", "coverBorderColor", config.accentGold || "#f59e0b")}
                    
                    <div className="grid grid-cols-2 gap-3 p-2 bg-slate-900/40 rounded border border-slate-850">
                      <div>
                        <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Border Size (px)</label>
                        <input 
                          type="range" min="0" max="10" step="1"
                          value={config.coverBorderSize !== undefined ? config.coverBorderSize : 2}
                          onChange={(e) => onChangeField("coverBorderSize", parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="text-right text-[8px] text-slate-400 font-mono mt-0.5">{config.coverBorderSize !== undefined ? config.coverBorderSize : 2}px</div>
                      </div>
                      <div>
                        <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Corner Span (px)</label>
                        <input 
                          type="range" min="16" max="96" step="2"
                          value={config.coverCornerSize !== undefined ? config.coverCornerSize : 32}
                          onChange={(e) => onChangeField("coverCornerSize", parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="text-right text-[8px] text-slate-400 font-mono mt-0.5">{config.coverCornerSize !== undefined ? config.coverCornerSize : 32}px</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-2 bg-slate-900/40 rounded border border-slate-850">
                      <div>
                        <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Border Opacity</label>
                        <input 
                          type="range" min="0" max="1" step="0.05"
                          value={config.coverBorderOpacity !== undefined ? config.coverBorderOpacity : 1.0}
                          onChange={(e) => onChangeField("coverBorderOpacity", parseFloat(e.target.value))}
                          onInput={(e) => onChangeField("coverBorderOpacity", parseFloat(e.target.value))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer color-slider-horizontal"
                          style={{
                            background: 'linear-gradient(to right, rgba(214,173,97,0.1), rgba(214,173,97,1))',
                            padding: 0
                          }}
                        />
                        <div className="text-right text-[8px] text-slate-400 font-mono mt-0.5">{Math.round((config.coverBorderOpacity !== undefined ? config.coverBorderOpacity : 1.0) * 100)}%</div>
                      </div>
                      <div className="flex flex-col justify-center">
                        <label className="text-[8px] uppercase text-slate-400 block mb-1">Inner Box Outline</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={config.coverInnerBorderEnabled !== false}
                            onChange={(e) => onChangeField("coverInnerBorderEnabled", e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-slate-950"></div>
                          <span className="ml-2 text-[9px] font-medium text-slate-300">Enabled</span>
                        </label>
                      </div>
                    </div>

                    {config.coverInnerBorderEnabled !== false && (
                      renderRgbaControlSelfParsed("Inner Border Color", "coverInnerBorderColor", "rgba(255, 255, 255, 0.15)")
                    )}
                  </div>
                )
              })}

              {/* Global Border / Frame PNG */}
              {renderPartCard({
                title: "Global Border Image (PNG)",
                subtitle: "Framing overlay with zero stretching & scroll options",
                toggleKey: "showGlobalBorder",
                badge: "Global Frame",
                children: (
                  <div className="space-y-3.5 border-b border-slate-800 pb-3">
                    {/* Quick Presets */}
                    <div>
                      <label className="text-[8px] uppercase text-slate-400 block mb-1.5 font-bold tracking-wider">
                        Curated Luxury Frame Presets
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: "royal-gold", name: "Royal Gold", style: "royal-gold", url: "/frames/royal_gold_frame.svg" },
                          { id: "floral-vintage", name: "Floral Laurel", style: "floral-vintage", url: "/frames/floral_vintage_frame.svg" },
                          { id: "sleek-modern", name: "Sleek Modern", style: "sleek-modern", url: "/frames/sleek_modern_frame.svg" },
                          { id: "art-deco", name: "Art Deco", style: "art-deco", url: "/frames/art_deco_frame.svg" }
                        ].map((preset) => {
                          const isSelected = (config.globalBorderStyle === preset.style) || (config.globalBorderImage === preset.url);
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                onChangeField("globalBorderImage", preset.url);
                                onChangeField("globalBorderStyle", preset.style);
                                onChangeField("showGlobalBorder", true);
                              }}
                              className={`p-1.5 rounded-lg border flex flex-col items-center gap-1 transition ${
                                isSelected 
                                  ? "border-amber-500 bg-amber-500/10 shadow-sm shadow-amber-500/20" 
                                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                              }`}
                            >
                              <div className="w-full aspect-[2/3] bg-slate-950/80 rounded border border-white/5 flex items-center justify-center p-0.5 overflow-hidden">
                                <img src={preset.url} alt={preset.name} className="w-full h-full object-contain" />
                              </div>
                              <span className="text-[8px] font-semibold text-slate-300 truncate w-full text-center">
                                {preset.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Metal Finish Tone */}
                    <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-850 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[8px] uppercase text-slate-300 font-bold block tracking-wider">
                          Metallic Finish & Tone
                        </label>
                        <span className="text-[8px] text-amber-400 font-mono font-bold capitalize">
                          {(config.globalBorderTone || "yellow-gold").replace("-", " ")}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded border border-slate-800">
                        {[
                          { id: "yellow-gold", name: "24K Gold", color: "#D4AF37" },
                          { id: "rose-gold", name: "Rose Gold", color: "#D98A92" },
                          { id: "champagne-gold", name: "Champagne", color: "#C8B693" },
                          { id: "antique-bronze", name: "Bronze", color: "#9E7B58" },
                        ].map((tone) => {
                          const isToneActive = (config.globalBorderTone || "yellow-gold") === tone.id;
                          return (
                            <button
                              key={tone.id}
                              type="button"
                              onClick={() => onChangeField("globalBorderTone", tone.id)}
                              className={`py-1 px-1 rounded flex items-center justify-center gap-1 text-[7.5px] font-bold transition ${
                                isToneActive
                                  ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                                  : "text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0 shadow-xs" style={{ background: tone.color }} />
                              <span className="truncate">{tone.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Upload Custom PNG Frame or URL */}
                    <div className="space-y-1.5 p-2.5 bg-slate-900/40 rounded-lg border border-slate-850">
                      <label className="text-[8px] uppercase text-slate-300 font-bold block tracking-wider">
                        Custom Border Image / PNG
                      </label>
                      <input 
                        type="file" 
                        accept="image/png,image/*"
                        onChange={(e) => handleFileChange("globalBorderImage", e)}
                        className="w-full text-xs text-slate-100 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer shadow-sm"
                      />
                      <div className="flex items-center space-x-1.5 pt-1">
                        <input 
                          type="text" 
                          value={config.globalBorderImage || ""} 
                          placeholder="Or enter image / PNG URL (https://...)"
                          onChange={(e) => onChangeField("globalBorderImage", e.target.value)}
                          className="flex-1 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-[9px] text-slate-200 focus:outline-none focus:border-amber-500"
                        />
                        {config.globalBorderImage && (
                          <button
                            type="button"
                            onClick={() => onChangeField("globalBorderImage", "")}
                            className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/40 text-rose-300 rounded text-[8px] font-bold uppercase transition"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Scroll Behavior: Non-Scrollable (Fixed) vs Scrollable with Pages */}
                    <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-850 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[8px] uppercase text-slate-300 font-bold block tracking-wider">
                          Scroll Behavior
                        </label>
                        <span className="text-[8px] text-amber-400 font-mono font-bold">
                          {(config.globalBorderScrollMode || "fixed") === "fixed" ? "Fixed to Viewport" : "Scrolls with Content"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded border border-slate-800">
                        <button
                          type="button"
                          onClick={() => onChangeField("globalBorderScrollMode", "fixed")}
                          className={`py-1.5 px-2 text-[9px] font-bold rounded flex items-center justify-center gap-1.5 transition ${
                            (config.globalBorderScrollMode || "fixed") === "fixed"
                              ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <span>📌 Non-Scrollable (Fixed)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onChangeField("globalBorderScrollMode", "scroll")}
                          className={`py-1.5 px-2 text-[9px] font-bold rounded flex items-center justify-center gap-1.5 transition ${
                            config.globalBorderScrollMode === "scroll"
                              ? "bg-amber-500 text-slate-950 shadow-sm font-black"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <span>📜 Scroll with Pages</span>
                        </button>
                      </div>
                      <p className="text-[7.5px] text-slate-400 italic">
                        {(config.globalBorderScrollMode || "fixed") === "fixed"
                          ? "Border stays fixed on the screen while the wedding invitation scrolls inside."
                          : "Border moves and scrolls along with the full height of the invitation pages."}
                      </p>
                    </div>

                    {/* Stretch & Proportions Control */}
                    <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-850 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[8px] uppercase text-slate-300 font-bold block tracking-wider">
                          Aspect Ratio &amp; No-Stretch Mode
                        </label>
                      </div>
                      <CustomSelect
                        value={config.globalBorderFit || "contain"}
                        onChange={(val) => onChangeField("globalBorderFit", val)}
                        options={[
                          { value: "contain", label: "Proportional Frame (Contain - Zero Stretch)" },
                          { value: "slice", label: "9-Slice CSS Border (Corners Never Stretch)" },
                          { value: "cover", label: "Full Perimeter Fill (Cover - No Distortion)" }
                        ]}
                      />
                      <p className="text-[7.5px] text-slate-400 italic">
                        {config.globalBorderFit === "slice"
                          ? "9-Slice: 4 corner ornaments remain sharp and unstretched at their natural size while border lines frame the edges."
                          : "Proportional: Image strictly preserves native aspect ratio and never stretches or distorts."}
                      </p>
                    </div>

                    {/* Fine Tuning: Opacity, Inset, Width */}
                    <div className="grid grid-cols-2 gap-3 p-2 bg-slate-900/40 rounded-lg border border-slate-850">
                      <div>
                        <div className="flex justify-between text-[8px] text-slate-400 mb-0.5">
                          <span>Frame Opacity</span>
                          <span className="font-mono text-amber-400">
                            {Math.round((config.globalBorderOpacity !== undefined ? config.globalBorderOpacity : 1.0) * 100)}%
                          </span>
                        </div>
                        <input 
                          type="range" min="0" max="1" step="0.05"
                          value={config.globalBorderOpacity !== undefined ? config.globalBorderOpacity : 1.0}
                          onChange={(e) => onChangeField("globalBorderOpacity", parseFloat(e.target.value))}
                          onInput={(e) => onChangeField("globalBorderOpacity", parseFloat(e.target.value))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer color-slider-horizontal"
                          style={{
                            background: 'linear-gradient(to right, rgba(214,173,97,0.1), rgba(214,173,97,1))',
                            padding: 0
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[8px] text-slate-400 mb-0.5">
                          <span>Screen Inset</span>
                          <span className="font-mono text-amber-400">{config.globalBorderInset || 0}px</span>
                        </div>
                        <input 
                          type="range" min="0" max="48" step="2"
                          value={config.globalBorderInset || 0}
                          onChange={(e) => onChangeField("globalBorderInset", parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                    </div>

                    {/* 9-Slice specific controls if slice mode is chosen */}
                    {config.globalBorderFit === "slice" && (
                      <div className="grid grid-cols-2 gap-3 p-2 bg-slate-900/40 rounded-lg border border-slate-850">
                        <div>
                          <div className="flex justify-between text-[8px] text-slate-400 mb-0.5">
                            <span>Border Width</span>
                            <span className="font-mono text-amber-400">{config.globalBorderWidth || 28}px</span>
                          </div>
                          <input 
                            type="range" min="8" max="72" step="2"
                            value={config.globalBorderWidth || 28}
                            onChange={(e) => onChangeField("globalBorderWidth", parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[8px] text-slate-400 mb-0.5">
                            <span>Corner Slice</span>
                            <span className="font-mono text-amber-400">{config.globalBorderSlice || 48}px</span>
                          </div>
                          <input 
                            type="range" min="16" max="120" step="4"
                            value={config.globalBorderSlice || 48}
                            onChange={(e) => onChangeField("globalBorderSlice", parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Page Background Decoration */}
              <div className="space-y-2 pb-1">
                <span className="text-[9px] font-bold text-slate-350 block uppercase tracking-wide">Background Shapes & Particles</span>
                <div>
                  <label className="text-[8px] uppercase text-slate-400 block mb-1">Background Shape Type</label>
                  <CustomSelect
                    value={config.bgShapesType || "none"}
                    onChange={(val) => onChangeField("bgShapesType", val)}
                    options={[
                      { value: "none", label: "Plain Solid Background" },
                      { value: "floating-circles", label: "Floating Circles/Bubbles" },
                      { value: "floating-hearts", label: "Floating Love Hearts" },
                      { value: "floating-petals", label: "Floating Flower Petals" },
                      { value: "sparkling-stars", label: "Blinking Magic Stars" }
                    ]}
                  />
                </div>

                {config.bgShapesType && config.bgShapesType !== 'none' && (
                  <div className="space-y-2 pt-1 text-[9px]">
                    <div>
                      <div className="flex justify-between text-[8px] font-semibold text-slate-400 uppercase mb-0.5">
                        <span>Shape Density (Count)</span>
                        <span>{config.bgShapesCount ?? 12}</span>
                      </div>
                      <input 
                        type="range" min="4" max="30" step="1"
                        value={config.bgShapesCount ?? 12}
                        onChange={(e) => onChangeField("bgShapesCount", parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[8px] font-semibold text-slate-400 uppercase mb-0.5">
                        <span>Shape Size Scale</span>
                        <span>{config.bgShapesSize ?? "1.0"}x</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="2.5" step="0.1"
                        value={config.bgShapesSize ?? 1.0}
                        onChange={(e) => onChangeField("bgShapesSize", parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[8px] font-semibold text-slate-400 uppercase mb-0.5">
                        <span>Shape Opacity</span>
                        <span>{Math.round((config.bgShapesOpacity ?? 0.15) * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0.05" max="0.5" step="0.01"
                        value={config.bgShapesOpacity ?? 0.15}
                        onChange={(e) => onChangeField("bgShapesOpacity", parseFloat(e.target.value))}
                        onInput={(e) => onChangeField("bgShapesOpacity", parseFloat(e.target.value))}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer color-slider-horizontal"
                        style={{
                          background: 'linear-gradient(to right, rgba(214,173,97,0.1), rgba(214,173,97,1))',
                          padding: 0
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              {renderShadowControlBlock("Cover", "cover", "rgba(0, 0, 0, 0.35)")}
            </div>

            {/* SECTION 2: SACRED SYMBOL & RELIGIOUS VERSES GROUP */}
            {renderPartCard({
              title: "Sacred Symbol & Religious Verses",
              toggleKey: "showSacredSection",
              children: (
                <div className="p-3 bg-slate-900/80 rounded-xl border border-amber-500/30 space-y-4 shadow-md">
                  <div className="flex items-center space-x-2 border-b border-amber-500/20 pb-2">
                    <SvgAward className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] font-extrabold text-amber-300 block uppercase tracking-wider">
                      Sacred Symbol &amp; Religious Verses
                    </span>
                  </div>
                  
                  {/* Religious Theme Dropdown */}
                  <div>
                    <label className="text-[9px] uppercase text-amber-300 font-extrabold block mb-1 tracking-wider">
                      Religious Theme Selection
                    </label>
                    <CustomSelect 
                      value={config.religionKey || "secular"}
                      onChange={(val) => handleReligionChange(val)}
                      options={Object.entries(RELIGIONS).map(([key, val]) => ({
                        value: key,
                        label: val.name
                      }))}
                    />
                  </div>

                  {/* Upload Sacred Holy Image Symbol */}
                  {/* Holy Image & Clipart Symbol Studio */}
                  <div className="space-y-2.5 p-2.5 bg-slate-950/80 rounded-xl border border-amber-500/30">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] uppercase text-amber-300 font-extrabold block tracking-wider">
                        Holy Image / Clipart Symbol Studio
                      </label>
                      {config.customSacredSymbolImg && (
                        <span className="text-[7.5px] text-emerald-400 font-bold uppercase">Active on Cover</span>
                      )}
                    </div>

                    {/* Curated Clipart Library Picker */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[7.5px] uppercase font-bold text-slate-400">
                          Curated Clipart Library
                        </span>
                        <span className="text-[7px] text-amber-400">1-Click Apply</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
                        {(CURATED_CLIPARTS || []).map((clip) => {
                          const isSelected = config.customSacredSymbolImg === clip.url;
                          return (
                            <button
                              key={clip.id}
                              type="button"
                              onClick={() => onChangeField("customSacredSymbolImg", clip.url)}
                              title={`${clip.name} (${clip.category})`}
                              className={`p-1.5 rounded-lg border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer group ${
                                isSelected
                                  ? "bg-amber-500/25 border-amber-400 ring-1 ring-amber-400 shadow-sm"
                                  : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                              }`}
                            >
                              <div className="w-6 h-6 flex items-center justify-center">
                                <img src={clip.url} alt={clip.name} className="w-5 h-5 object-contain group-hover:scale-110 transition-transform" />
                              </div>
                              <span className={`text-[6.5px] truncate max-w-full text-center font-medium ${isSelected ? "text-amber-300 font-bold" : "text-slate-400"}`}>
                                {clip.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Upload File / Image URL */}
                    <div className="space-y-1 pt-1 border-t border-slate-900">
                      <label className="text-[7.5px] uppercase text-slate-400 font-bold block">
                        Upload Custom Holy Image
                      </label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange("customSacredSymbolImg", e)}
                        className="w-full text-xs text-slate-100 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[9px] file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer shadow-sm"
                      />
                      <div className="flex items-center space-x-1 pt-0.5">
                        <input
                          type="text"
                          value={config.customSacredSymbolImg || ""}
                          placeholder="Or paste image URL (https://...)"
                          onChange={(e) => onChangeField("customSacredSymbolImg", e.target.value)}
                          className="flex-1 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[9px] text-slate-200"
                        />
                        {config.customSacredSymbolImg && (
                          <button 
                            type="button"
                            onClick={() => onChangeField("customSacredSymbolImg", "")}
                            className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/40 text-rose-300 rounded text-[8px] font-bold uppercase transition"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Editing Controls (Active when customSacredSymbolImg exists) */}
                    {config.customSacredSymbolImg && (
                      <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                        {/* Scale & Pixel Size */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="flex justify-between items-center text-[7.5px] uppercase text-slate-400 font-bold mb-0.5">
                              <span>Scale Multiplier</span>
                              <span className="text-amber-400 font-mono font-bold">
                                {config.customSacredSymbolImgScale !== undefined ? `${config.customSacredSymbolImgScale}x` : "1.0x"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <input
                                type="range"
                                min="0.2"
                                max="3.0"
                                step="0.05"
                                value={config.customSacredSymbolImgScale !== undefined ? config.customSacredSymbolImgScale : 1.0}
                                onChange={(e) => onChangeField("customSacredSymbolImgScale", parseFloat(e.target.value))}
                                className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                              />
                              <button
                                type="button"
                                onClick={() => onChangeField("customSacredSymbolImgScale", 1.0)}
                                className="px-1 py-0.2 text-[7px] text-slate-400 hover:text-amber-300 bg-slate-900 border border-slate-800 rounded font-mono"
                                title="Reset scale"
                              >
                                ↺
                              </button>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center text-[7.5px] uppercase text-slate-400 font-bold mb-0.5">
                              <span>Base Size (px)</span>
                              <span className="text-amber-400 font-mono font-bold">
                                {config.customSacredSymbolImgSizePx || 56}px
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <input
                                type="range"
                                min="20"
                                max="160"
                                step="2"
                                value={config.customSacredSymbolImgSizePx || 56}
                                onChange={(e) => onChangeField("customSacredSymbolImgSizePx", parseInt(e.target.value))}
                                className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                              />
                              <button
                                type="button"
                                onClick={() => onChangeField("customSacredSymbolImgSizePx", 56)}
                                className="px-1 py-0.2 text-[7px] text-slate-400 hover:text-amber-300 bg-slate-900 border border-slate-800 rounded font-mono"
                                title="Reset size"
                              >
                                ↺
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Position Offsets (Move Left/Right, Up/Down, Rotate) */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="flex justify-between items-center text-[7.5px] uppercase text-slate-400 font-bold mb-0.5">
                              <span>Move X (Left-Right)</span>
                              <span className="text-amber-400 font-mono font-bold">{config.customSacredSymbolImgX || 0}px</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <input
                                type="range"
                                min="-150"
                                max="150"
                                step="1"
                                value={config.customSacredSymbolImgX || 0}
                                onChange={(e) => onChangeField("customSacredSymbolImgX", parseInt(e.target.value))}
                                className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                              />
                              <button
                                type="button"
                                onClick={() => onChangeField("customSacredSymbolImgX", 0)}
                                className="px-1 py-0.2 text-[7px] text-slate-400 hover:text-amber-300 bg-slate-900 border border-slate-800 rounded font-mono"
                                title="Reset X"
                              >
                                0
                              </button>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center text-[7.5px] uppercase text-slate-400 font-bold mb-0.5">
                              <span>Move Y (Up-Down)</span>
                              <span className="text-amber-400 font-mono font-bold">{config.customSacredSymbolImgY || 0}px</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <input
                                type="range"
                                min="-150"
                                max="150"
                                step="1"
                                value={config.customSacredSymbolImgY || 0}
                                onChange={(e) => onChangeField("customSacredSymbolImgY", parseInt(e.target.value))}
                                className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                              />
                              <button
                                type="button"
                                onClick={() => onChangeField("customSacredSymbolImgY", 0)}
                                className="px-1 py-0.2 text-[7px] text-slate-400 hover:text-amber-300 bg-slate-900 border border-slate-800 rounded font-mono"
                                title="Reset Y"
                              >
                                0
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Rotation & Blend Mode */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="flex justify-between items-center text-[7.5px] uppercase text-slate-400 font-bold mb-0.5">
                              <span>Rotation Angle</span>
                              <span className="text-amber-400 font-mono font-bold">{config.customSacredSymbolImgRotate || 0}°</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <input
                                type="range"
                                min="-180"
                                max="180"
                                step="1"
                                value={config.customSacredSymbolImgRotate || 0}
                                onChange={(e) => onChangeField("customSacredSymbolImgRotate", parseInt(e.target.value))}
                                className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                              />
                              <button
                                type="button"
                                onClick={() => onChangeField("customSacredSymbolImgRotate", 0)}
                                className="px-1 py-0.2 text-[7px] text-slate-400 hover:text-amber-300 bg-slate-900 border border-slate-800 rounded font-mono"
                                title="Reset angle"
                              >
                                0°
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[7.5px] uppercase text-slate-400 block font-bold mb-0.5">Blend Mode</label>
                              <CustomSelect
                                value={config.customSacredSymbolImgBlendMode || "normal"}
                                onChange={(val) => onChangeField("customSacredSymbolImgBlendMode", val)}
                                options={[
                                  { value: "normal", label: "Normal" },
                                  { value: "color", label: "Color (Mask)" },
                                  { value: "multiply", label: "Multiply" },
                                  { value: "screen", label: "Screen" },
                                  { value: "overlay", label: "Overlay" },
                                  { value: "soft-light", label: "Soft Light" },
                                  { value: "luminosity", label: "Luminosity" }
                                ]}
                              />
                            </div>
                            <div>
                              <div className="flex justify-between items-center text-[7.5px] uppercase text-slate-400 font-bold mb-0.5">
                                <span>Opacity</span>
                                <span className="text-amber-400 font-mono font-bold">
                                  {config.customSacredSymbolImgOpacity !== undefined ? `${Math.round(config.customSacredSymbolImgOpacity * 100)}%` : "100%"}
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0.05"
                                max="1.0"
                                step="0.05"
                                value={config.customSacredSymbolImgOpacity !== undefined ? config.customSacredSymbolImgOpacity : 1.0}
                                onChange={(e) => onChangeField("customSacredSymbolImgOpacity", parseFloat(e.target.value))}
                                onInput={(e) => onChangeField("customSacredSymbolImgOpacity", parseFloat(e.target.value))}
                                className="w-full h-2 rounded-lg appearance-none cursor-pointer color-slider-horizontal"
                                style={{
                                  background: 'linear-gradient(to right, rgba(214,173,97,0.1), rgba(214,173,97,1))',
                                  padding: 0
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Overlay Tint & Opacity */}
                        <div className="space-y-1 pt-1 border-t border-slate-900">
                          <div className="flex justify-between items-center text-[7.5px] uppercase text-slate-400 font-bold">
                            <span>Overlay Tint Color</span>
                            <div className="flex items-center space-x-1.5">
                              {config.customSacredSymbolImgTintColor && (
                                <span className="text-[7.5px] font-mono text-amber-300">{config.customSacredSymbolImgTintColor}</span>
                              )}
                              <input
                                type="color"
                                value={config.customSacredSymbolImgTintColor || "#d4af37"}
                                onChange={(e) => onChangeField("customSacredSymbolImgTintColor", e.target.value)}
                                className="w-4 h-4 rounded cursor-pointer border border-white/20 p-0 bg-transparent"
                                title="Custom tint color"
                              />
                              {config.customSacredSymbolImgTintColor && (
                                <button
                                  type="button"
                                  onClick={() => onChangeField("customSacredSymbolImgTintColor", "")}
                                  className="text-[7.5px] text-rose-400 hover:underline"
                                >
                                  None
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {[
                              { name: "Clear", color: "" },
                              { name: "Gold", color: "#d4af37" },
                              { name: "Amber", color: "#f59e0b" },
                              { name: "Burgundy", color: "#8a2b3f" },
                              { name: "White", color: "#ffffff" },
                              { name: "Emerald", color: "#065f46" }
                            ].map((swatch, sIdx) => {
                              const isCurrent = (config.customSacredSymbolImgTintColor || "") === swatch.color;
                              return (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => onChangeField("customSacredSymbolImgTintColor", swatch.color)}
                                  className={`px-1.5 py-0.5 rounded text-[7px] font-bold border transition ${
                                    isCurrent
                                      ? "border-amber-400 text-amber-300 bg-amber-500/20 shadow-sm"
                                      : "border-slate-800 text-slate-400 bg-slate-900 hover:text-slate-200"
                                  }`}
                                >
                                  {swatch.color ? (
                                    <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle border border-white/30" style={{ backgroundColor: swatch.color }} />
                                  ) : (
                                    <span className="inline-block mr-1">✕</span>
                                  )}
                                  {swatch.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Drop Shadow Controls */}
                        <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-900">
                          <div>
                            <div className="flex justify-between text-[7px] uppercase text-slate-400 font-bold mb-0.5">
                              <span>Shadow Blur</span>
                              <span className="font-mono text-amber-400">{config.customSacredSymbolImgShadowBlur !== undefined ? config.customSacredSymbolImgShadowBlur : 8}px</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="30"
                              step="1"
                              value={config.customSacredSymbolImgShadowBlur !== undefined ? config.customSacredSymbolImgShadowBlur : 8}
                              onChange={(e) => onChangeField("customSacredSymbolImgShadowBlur", parseInt(e.target.value))}
                              className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-[7px] uppercase text-slate-400 font-bold mb-0.5">
                              <span>Offset X</span>
                              <span className="font-mono text-amber-400">{config.customSacredSymbolImgShadowX || 0}px</span>
                            </div>
                            <input
                              type="range"
                              min="-25"
                              max="25"
                              step="1"
                              value={config.customSacredSymbolImgShadowX || 0}
                              onChange={(e) => onChangeField("customSacredSymbolImgShadowX", parseInt(e.target.value))}
                              className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-[7px] uppercase text-slate-400 font-bold mb-0.5">
                              <span>Offset Y</span>
                              <span className="font-mono text-amber-400">{config.customSacredSymbolImgShadowY !== undefined ? config.customSacredSymbolImgShadowY : 3}px</span>
                            </div>
                            <input
                              type="range"
                              min="-25"
                              max="25"
                              step="1"
                              value={config.customSacredSymbolImgShadowY !== undefined ? config.customSacredSymbolImgShadowY : 3}
                              onChange={(e) => onChangeField("customSacredSymbolImgShadowY", parseInt(e.target.value))}
                              className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-500"
                            />
                          </div>
                        </div>

                        {/* Reset All Holy Image Studio Controls */}
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              onChangeField("customSacredSymbolImgScale", 1.0);
                              onChangeField("customSacredSymbolImgSizePx", 56);
                              onChangeField("customSacredSymbolImgX", 0);
                              onChangeField("customSacredSymbolImgY", 0);
                              onChangeField("customSacredSymbolImgRotate", 0);
                              onChangeField("customSacredSymbolImgOpacity", 1.0);
                              onChangeField("customSacredSymbolImgBlendMode", "normal");
                              onChangeField("customSacredSymbolImgTintColor", "");
                              onChangeField("customSacredSymbolImgShadowBlur", 8);
                              onChangeField("customSacredSymbolImgShadowX", 0);
                              onChangeField("customSacredSymbolImgShadowY", 3);
                              onChangeField("customSacredSymbolImgShadowColor", "rgba(0, 0, 0, 0.45)");
                            }}
                            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-amber-300 rounded text-[7.5px] font-bold uppercase transition"
                          >
                            ↺ Reset Image Settings
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sacred Symbol Text / Emoji Accordion Tool */}
                  {renderCategorizedElementTool("Sacred Text Symbol", "customSacredSymbol", "🕉")}

                  {/* Sacred Holy Verse Accordion Tool */}
                  {renderCategorizedElementTool("Sacred Holy Verse", "customSacredVerse", "Love is patient, love is kind...")}

                  {/* Sacred Banner Box Shadow */}
                  <div className="border-t border-white/10 pt-3">
                    {renderShadowControlBlock("Sacred Banner Shadow", "sacred", "rgba(0, 0, 0, 0.15)")}
                  </div>
                </div>
              )
            })}

            {/* SECTION 3: CATEGORIZED COVER ELEMENT EDITORS */}
            <span className="text-[11px] font-bold text-amber-500 block uppercase tracking-wider pt-2 border-t border-slate-900">
              3. Cover Typography &amp; Element Tools
            </span>

            {renderCategorizedElementTool("Top Tagline Sentiment", "coverTopTaglineText", "Under the Auspices of Love and Destiny")}
            {renderCategorizedElementTool("Union Subheading Text", "coverSubheadingText", "The Union Ceremony of")}
            {renderCategorizedElementTool("Bride Name Details", "coverBrideText", config.brideName || "Suman")}
            {renderCategorizedElementTool("Ampersand (&) Symbol", "coverAmpersandText", "&")}
            {renderCategorizedElementTool("Groom Name Details", "coverGroomText", config.groomName || "Vishal")}
            {renderCategorizedElementTool("Intro Love Quote", "coverQuoteText", config.introQuote || "Joined in holy matrimony, we celebrate a bond written in heaven and lived in faith.")}
            {renderCategorizedElementTool("Bottom Tagline Banner", "coverBottomTaglineText", "Joined in holy matrimony, we celebrate a bond written in heaven and lived in faith.")}
            {renderCategorizedElementTool("Cover Reveal Button", "coverRevealBtnText", "Reveal Secret Save the Date")}
          </div>
        )}

        {/* WEDDING TIMELINE TAB */}
        {activeTab === "timeline" && (
          <TimelineEditorDrawer
            config={config}
            onChangeField={onChangeField}
            triggerDialog={triggerDialog}
          />
        )}

        {/* EVENT VENUES TAB */}
        {activeTab === "venue" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Event Timings &amp; Venues</h3>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Wedding Date &amp; Time</label>
              <input 
                type="datetime-local" 
                value={config.weddingDate ? config.weddingDate.slice(0, 16) : ""} 
                onChange={(e) => onChangeField("weddingDate", e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs focus:outline-none focus:border-amber-500 text-slate-200"
              />
            </div>

            {/* Typography and Colors */}
            {renderPartCard({
              title: "Venue Styles & Colors",
              toggleKey: "showVenueHeader",
              children: (
                <div className="p-3 bg-slate-900/60 rounded border border-slate-850 space-y-2">
                  <div className="grid grid-cols-2 gap-2 mb-1">
                    <div>
                      <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Title Font</label>
                      <CustomFontSelect
                        value={config.venueTitleFont || "font-serif"}
                        onChange={(val) => onChangeField("venueTitleFont", val)}
                        options={FONTS}
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Title Size</label>
                      <CustomSelect
                        value={config.venueTitleSize || "text-2xl sm:text-3xl"}
                        onChange={(val) => onChangeField("venueTitleSize", val)}
                        options={[
                          { value: "text-xl", label: "Small" },
                          { value: "text-2xl sm:text-3xl", label: "Medium" },
                          { value: "text-3xl sm:text-4xl", label: "Large" }
                        ]}
                      />
                    </div>
                  </div>
                  {renderRgbaControlSelfParsed("Section Title Color", "venueTitleColor", config.accentGold || "#b89254")}
                  {renderRgbaControlSelfParsed("Venue Card Background", "venueCardBgColor", "rgba(0, 0, 0, 0.2)")}
                  {renderRgbaControlSelfParsed("Venue Card Text Color", "venueCardTextColor", config.lightBgColor || "#faf6f0")}
                </div>
              )
            })}

            {/* CEREMONY CARD */}
            {renderPartCard({
              title: "Ceremony Card Details",
              toggleKey: "showCeremonyVenue",
              children: (
                <div className="p-3 bg-slate-900/60 rounded border border-slate-850 space-y-3">
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Venue Name</label>
                    <input 
                      type="text" 
                      value={config.weddingVenue || ""} 
                      onChange={(e) => onChangeField("weddingVenue", e.target.value)}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Address</label>
                    <input 
                      type="text" 
                      value={config.weddingAddress || ""} 
                      onChange={(e) => onChangeField("weddingAddress", e.target.value)}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Maps Google Link</label>
                    <input 
                      type="url" 
                      value={config.weddingMapUrl || ""} 
                      onChange={(e) => onChangeField("weddingMapUrl", e.target.value)}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px]"
                    />
                  </div>
                  <div className="pt-1.5 border-t border-slate-800 space-y-1.5">
                    <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Upload Photo</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange("venueCeremonyImage", e)}
                      className="w-full text-[10px] text-slate-300 file:mr-2 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                    />
                    {config.venueCeremonyImage && (
                      <div className="mt-2 flex items-center space-x-2 bg-slate-950/80 p-2 rounded-lg border border-amber-500/30">
                        <img src={config.venueCeremonyImage} alt="Ceremony Preview" className="h-7 object-contain rounded" />
                        <span className="text-[9px] text-slate-100 font-bold truncate flex-1">Ceremony Photo Active</span>
                        <button 
                          type="button"
                          onClick={() => onChangeField("venueCeremonyImage", "")}
                          className="px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/40 text-rose-300 hover:text-rose-100 rounded text-[9px] font-extrabold uppercase transition"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                    {config.venueCeremonyImage && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Shape</label>
                          <CustomSelect
                            value={config.venueCeremonyFrameShape || "landscape"}
                            onChange={(val) => onChangeField("venueCeremonyFrameShape", val)}
                            options={[
                              { value: "oval", label: "Oval" },
                              { value: "portrait", label: "Portrait" },
                              { value: "square", label: "Square" },
                              { value: "round", label: "Round" },
                              { value: "landscape", label: "Landscape" }
                            ]}
                          />
                        </div>
                        <div>
                          <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Border</label>
                          <CustomSelect
                            value={config.venueCeremonyFrameBorderTheme || "minimalist"}
                            onChange={(val) => onChangeField("venueCeremonyFrameBorderTheme", val)}
                            options={[
                              { value: "double-gilded", label: "Gilded" },
                              { value: "pearls", label: "Pearls" },
                              { value: "floral-lace", label: "Lace" },
                              { value: "minimalist", label: "Minimal" }
                            ]}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* RECEPTION CARD */}
            {renderPartCard({
              title: "Reception Card Details",
              toggleKey: "showReceptionVenue",
              children: (
                <div className="p-3 bg-slate-900/60 rounded border border-slate-850 space-y-3">
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Venue Name</label>
                    <input 
                      type="text" 
                      value={config.receptionVenue || ""} 
                      onChange={(e) => onChangeField("receptionVenue", e.target.value)}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Address</label>
                    <input 
                      type="text" 
                      value={config.receptionAddress || ""} 
                      onChange={(e) => onChangeField("receptionAddress", e.target.value)}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px]"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Date</label>
                    <input 
                      type="date" 
                      value={config.receptionDate || ""} 
                      onChange={(e) => onChangeField("receptionDate", e.target.value)}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px] text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Maps Google Link</label>
                    <input 
                      type="url" 
                      value={config.receptionMapUrl || ""} 
                      onChange={(e) => onChangeField("receptionMapUrl", e.target.value)}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px]"
                    />
                  </div>
                  <div className="pt-1.5 border-t border-slate-800 space-y-1.5">
                    <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Upload Photo</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange("venueReceptionImage", e)}
                      className="w-full text-[10px] text-slate-300 file:mr-2 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                    />
                    {config.venueReceptionImage && (
                      <div className="mt-2 flex items-center space-x-2 bg-slate-950/80 p-2 rounded-lg border border-amber-500/30">
                        <img src={config.venueReceptionImage} alt="Reception Preview" className="h-7 object-contain rounded" />
                        <span className="text-[9px] text-slate-100 font-bold truncate flex-1">Reception Photo Active</span>
                        <button 
                          type="button"
                          onClick={() => onChangeField("venueReceptionImage", "")}
                          className="px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/40 text-rose-300 hover:text-rose-100 rounded text-[9px] font-extrabold uppercase transition"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                    {config.venueReceptionImage && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Shape</label>
                          <CustomSelect
                            value={config.venueReceptionFrameShape || "landscape"}
                            onChange={(val) => onChangeField("venueReceptionFrameShape", val)}
                            options={[
                              { value: "oval", label: "Oval" },
                              { value: "portrait", label: "Portrait" },
                              { value: "square", label: "Square" },
                              { value: "round", label: "Round" },
                              { value: "landscape", label: "Landscape" }
                            ]}
                          />
                        </div>
                        <div>
                          <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Border</label>
                          <CustomSelect
                            value={config.venueReceptionFrameBorderTheme || "minimalist"}
                            onChange={(val) => onChangeField("venueReceptionFrameBorderTheme", val)}
                            options={[
                              { value: "double-gilded", label: "Gilded" },
                              { value: "pearls", label: "Pearls" },
                              { value: "floral-lace", label: "Lace" },
                              { value: "minimalist", label: "Minimal" }
                            ]}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            {renderShadowControlBlock("Venue", "venue", "rgba(0, 0, 0, 0.2)")}
          </div>
        )}

        {/* OUR GALLERY TAB */}
        {activeTab === "gallery" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Our Photo Gallery</h3>
            
            <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded border border-slate-850">
              <span className="text-xs text-slate-350">Show Gallery Section</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={config.showGallery !== false}
                  onChange={(e) => onChangeField("showGallery", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-slate-950"></div>
              </label>
            </div>

            {config.showGallery !== false && (
              <div className="space-y-4">
                {renderPartCard({
                  title: "Gallery Headings & Subtitle",
                  toggleKey: "showGalleryHeader",
                  children: (
                    <div className="p-3 bg-slate-900/60 rounded border border-slate-850 space-y-2">
                      <div>
                        <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Section Title</label>
                        <input 
                          type="text" 
                          value={config.galleryTitle || "Our Gallery"}
                          onChange={(e) => onChangeField("galleryTitle", e.target.value)}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px]"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Section Subtitle</label>
                        <input 
                          type="text" 
                          value={config.gallerySubtitle || "Our Love in Frames"}
                          onChange={(e) => onChangeField("gallerySubtitle", e.target.value)}
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Title Font</label>
                          <CustomFontSelect
                            value={config.galleryTitleFont || "font-serif"}
                            onChange={(val) => onChangeField("galleryTitleFont", val)}
                            options={FONTS}
                          />
                        </div>
                        <div>
                          <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Title Size</label>
                          <CustomSelect
                            value={config.galleryTitleSize || "text-2xl sm:text-3xl"}
                            onChange={(val) => onChangeField("galleryTitleSize", val)}
                            options={[
                              { value: "text-xl", label: "Small" },
                              { value: "text-2xl sm:text-3xl", label: "Medium" },
                              { value: "text-3xl sm:text-4xl", label: "Large" }
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Memories Slider Settings */}
                {renderPartCard({
                  title: "Gallery Slider & Photos Grid",
                  toggleKey: "showGalleryGrid",
                  children: (
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-900/60 rounded border border-slate-850 space-y-3">
                  
                  <div>
                    <label className="text-[8.5px] uppercase text-slate-400 block mb-1">Swipe Transition Effect</label>
                    <CustomSelect
                      value={config.gallerySlideEffect || "slide"}
                      onChange={(val) => onChangeField("gallerySlideEffect", val)}
                      options={[
                        { value: "slide", label: "1. Classic Horizontal Slide" },
                        { value: "fade", label: "2. Fade Overlay on Swipe" },
                        { value: "stack", label: "3. Elegant Paper Stack" },
                        { value: "fold", label: "4. 3D Origami Paper Fold" },
                        { value: "cube", label: "5. 3D Rotating Cube" },
                        { value: "zoom", label: "6. Zoom & Fade Transition" },
                        { value: "deck", label: "7. Card Deck Flow" },
                        { value: "parallax", label: "8. Layered Parallax Slide" },
                        { value: "flip", label: "9. 3D Book Page Flip" },
                        { value: "coverflow", label: "10. 3D Coverflow Perspective" }
                      ]}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] text-slate-400 uppercase">Auto-play Slideshow</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.galleryAutoplay !== false}
                        onChange={(e) => onChangeField("galleryAutoplay", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-slate-950"></div>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Single Multiple Upload Option */}
                  <div className="p-3 bg-slate-900/60 rounded border border-slate-850 space-y-2">
                    <span className="text-[10px] font-bold text-slate-350 block uppercase tracking-wide">Upload Gallery Photos</span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={handleMultipleFilesChange}
                      className="w-full text-[10px] text-slate-300 file:mr-2 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                    />
                    <p className="text-[8px] text-slate-450 leading-relaxed">Select up to 10 images. They will be added to your gallery slots and will not delete automatically.</p>
                  </div>

                  {/* List of active gallery images */}
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(idx => {
                    const imgUrl = config[`galleryImage${idx}`];
                    if (!imgUrl) return null;

                    return (
                      <div key={idx} className="p-3 bg-slate-900/40 rounded border border-slate-850 space-y-2.5">
                        <div className="flex justify-between items-center pb-1 border-b border-slate-850">
                          <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wide">Photo Slot {idx}</span>
                          <button 
                            type="button"
                            onClick={() => {
                              onChangeField(`galleryImage${idx}`, "");
                              onChangeField(`galleryCaption${idx}`, "");
                            }}
                            className="text-[8px] text-rose-450 hover:text-rose-350 font-bold uppercase transition"
                          >
                            Remove Image
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 bg-slate-950/80 p-1 rounded border border-slate-800">
                            <img src={imgUrl} alt={`Slot ${idx}`} className="w-10 h-10 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                              <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Caption</label>
                              <input 
                                type="text"
                                value={config[`galleryCaption${idx}`] || ""}
                                onChange={(e) => onChangeField(`galleryCaption${idx}`, e.target.value)}
                                placeholder="Add caption..."
                                className="w-full px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Frame Shape</label>
                              <CustomSelect
                                value={config[`galleryFrameShape${idx}`] || "portrait"}
                                onChange={(val) => onChangeField(`galleryFrameShape${idx}`, val)}
                                options={[
                                  { value: "oval", label: "Oval" },
                                  { value: "portrait", label: "Portrait" },
                                  { value: "square", label: "Square" },
                                  { value: "round", label: "Round" },
                                  { value: "landscape", label: "Landscape" }
                                ]}
                              />
                            </div>
                            <div>
                              <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Frame Border</label>
                              <CustomSelect
                                value={config[`galleryFrameBorder${idx}`] || "double-gilded"}
                                onChange={(val) => onChangeField(`galleryFrameBorder${idx}`, val)}
                                options={[
                                  { value: "double-gilded", label: "Gilded" },
                                  { value: "pearls", label: "Pearls" },
                                  { value: "floral-lace", label: "Lace" },
                                  { value: "minimalist", label: "Minimal" }
                                ]}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          })}
                {renderShadowControlBlock("Photo Gallery", "gallery", "rgba(0, 0, 0, 0.25)")}
              </div>
            )}
          </div>
        )}

        {/* SCRATCH & REVEAL EFFECT TAB */}
        {activeTab === "scratch" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Save Date Reveal Effect</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Left Column: Animation Style, Card & Shield Shape, and Reveal Duration */}
              <div className="space-y-2.5 p-3.5 bg-[#FFFFFF] rounded-xl border border-[#E9DCCB] shadow-sm flex flex-col justify-between">
                <div>
                  <label className="text-[10px] font-extrabold text-[#513321] block uppercase tracking-wide mb-1">Animation Style</label>
                  <CustomSelect 
                    value={config.revealEffect || "scratch"} 
                    onChange={(val) => onChangeField("revealEffect", val)}
                    options={[
                      { value: "scratch", label: "Scratch Card (Wipe Shield)" },
                      { value: "door-open", label: "Door Open (Sliding Panels)" },
                      { value: "magical-fade", label: "Magical Fade & Glow" },
                      { value: "particle-blow", label: "Particle Blow (Disintegrate)" },
                      { value: "page-tear", label: "Page Tear (Diagonal Peeling)" },
                      { value: "slide-left-right", label: "Slide Away Left/Right" },
                      { value: "break-wall", label: "Break The Wall (Physics Shatter)" },
                      { value: "touch-glow", label: "Touch Glow Flashlight Mask" },
                      { value: "sparkle-burst", label: "Sparkle Burst Transition" },
                      { value: "heart-pop", label: "Heart Pop & Float Up" },
                      { value: "starry-night", label: "Starry Night (Constellations)" },
                      { value: "curtain-draw", label: "Curtain Draw (Theater Parting)" },
                      { value: "diamond-shimmer", label: "Diamond Shimmer (Glitter Sweep)" },
                      { value: "circular-ripple", label: "Circular Ripple (Water Drop)" },
                      { value: "lotus-bloom", label: "Lotus Bloom (Petal Expand)" }
                    ]}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-[#513321] block uppercase tracking-wide mb-1">Card &amp; Shield Shape</label>
                  <CustomSelect 
                    value={config.scratchCardShape || "rounded"} 
                    onChange={(val) => onChangeField("scratchCardShape", val)}
                    options={[
                      { value: "rounded", label: "Classic Rounded Rectangle" },
                      { value: "oval", label: "Smooth Pill / Oval Frame" },
                      { value: "arch", label: "Royal Portal Arch" },
                      { value: "diamond", label: "Octagon Chamfer / Diamond" },
                      { value: "vintage", label: "Vintage Double Inset Frame" }
                    ]}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-extrabold text-[#513321] block uppercase tracking-wide">Reveal Duration</label>
                    <span className="text-[9px] font-mono text-[#C49A4A] font-extrabold">{config.revealSpeed || "1.0"}s</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="range" min="0.3" max="5.0" step="0.1"
                      value={parseFloat(config.revealSpeed || "1.0")} 
                      onChange={(e) => onChangeField("revealSpeed", e.target.value)}
                      onInput={(e) => onChangeField("revealSpeed", e.target.value)}
                      className="flex-1 h-2 rounded-lg appearance-none cursor-pointer color-slider-horizontal"
                      style={{
                        background: 'linear-gradient(to right, #E6DED5, #D6AD61)',
                        padding: 0
                      }}
                    />
                    <input 
                      type="number" min="0.3" max="5" step="0.1"
                      value={config.revealSpeed || "1.0"} 
                      onChange={(e) => onChangeField("revealSpeed", e.target.value)}
                      className="w-12 px-1.5 py-1 text-center bg-[#F8EFE4] border border-[#E9DCCB] rounded-lg text-[10px] text-[#513321] font-mono font-bold focus:outline-none focus:border-[#D6AD61]"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Reveal Color */}
              <div>
                {renderRgbaControlSelfParsed("Reveal Color", "revealColor", config.accentGold || "#f59e0b")}
              </div>
            </div>

            {/* Test and Reset Animation Controls */}
            <div className="flex items-center space-x-2 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('triggerRevealAnimation'));
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/25 hover:from-amber-500/30 hover:to-amber-600/35 border border-amber-500/40 text-[#513321] text-[10px] font-extrabold flex items-center justify-center space-x-1.5 transition shadow-xs cursor-pointer active:scale-98"
              >
                <span>✨ Test Reveal Animation</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('resetScratchCard'));
                }}
                className="py-2 px-3.5 rounded-xl bg-[#F7EFE5] hover:bg-[#EFE5D7] border border-[#E9DCCB] text-[#513321] text-[10px] font-bold flex items-center justify-center transition shadow-xs cursor-pointer active:scale-98"
                title="Reset Animation Shield"
              >
                <span>↺ Reset</span>
              </button>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Secret Hidden Message</label>
              <textarea 
                value={config.scratchSecretMessage || ""} 
                onChange={(e) => onChangeField("scratchSecretMessage", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs focus:outline-none focus:border-amber-500 resize-none font-sans"
              />
            </div>

            {/* Dedicated Scratch Card Cover Custom Image & Controls */}
            <div className="p-3.5 bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-slate-950 rounded-xl border border-amber-500/50 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider block">
                    ✨ Scratch Card Cover Surface
                  </span>
                  <p className="text-[8.5px] text-slate-350 leading-tight mt-0.5">
                    Upload a custom top image to cover the scratch card. Guests scratch this off to reveal the date.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('resetScratchCard'));
                  }}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/60 text-amber-300 hover:text-amber-100 rounded text-[9px] font-extrabold uppercase transition flex items-center space-x-1 cursor-pointer shrink-0 shadow-sm"
                  title="Test surprise by re-covering the scratch card"
                >
                  <span>↺ Test Surprise</span>
                </button>
              </div>

              {renderImageToolControl("Scratch Card Cover Image", "scratchImage")}
            </div>

            {/* Additional Background Images & Overlay Controls */}
            <div className="space-y-4 pt-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide block">
                Additional Section Backgrounds
              </span>
              
              {/* Outer Section Background Tool */}
              {renderImageToolControl("Outer Banner Background", "scratchSectionBgImage")}

              {/* Inner Card Background Image Tool */}
              {renderImageToolControl("Inner Revealed Card Background", "scratchCardBgImage")}
            </div>

            {/* Burst Particle Selection */}
            {renderPartCard({
              title: "Celebration Fireworks & Sound",
              toggleKey: "scratchCelebrationEnabled",
              children: (
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#513321] font-bold block mb-1">Burst Particle Effect</label>
                    <CustomSelect
                      value={config.celebrationParticleType || "graffiti"}
                      onChange={(val) => {
                        onChangeField("celebrationParticleType", val);
                        window.dispatchEvent(new CustomEvent('triggerCelebrationPreview', { detail: val }));
                      }}
                      options={[
                        { value: "graffiti", label: "24K Gold Sparkles & Stardust" },
                        { value: "flowers", label: "Royal Blossom Shower" },
                        { value: "petals", label: "Falling Velvet Rose Petals" },
                        { value: "hearts", label: "Romantic 3D Floating Hearts" },
                        { value: "firecrackers", label: "Royal Sparkler Cascade" }
                      ]}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('triggerCelebrationPreview', { detail: config.celebrationParticleType || 'graffiti' }));
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#E8E4DC] hover:bg-[#DDD8CF] border border-[#D6D0C5] text-[#382416] text-[10px] font-bold flex items-center justify-center space-x-1.5 transition shadow-xs cursor-pointer"
                  >
                    <span>🎉 Test Particle Effect</span>
                  </button>
                </div>
              )
            })}

            {/* Categorized Element Tools (Accordions) */}
            <div className="border-t border-slate-900 pt-3 space-y-2.5">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide block mb-1">
                Element Tools &amp; Categorized Settings
              </span>
              
              {renderCategorizedElementTool({
                key: "scratchTitle",
                label: "Title Text",
                icon: <SvgSparkles className="w-3.5 h-3.5 text-amber-400" />,
                defaultVal: "Secret Save The Date"
              })}

              {renderCategorizedElementTool({
                key: "scratchCoupleText",
                label: "Couple Text",
                icon: <SvgUsers className="w-3.5 h-3.5 text-amber-400" />,
                defaultVal: `${config.brideName} & ${config.groomName}`
              })}

              {renderCategorizedElementTool({
                key: "scratchMarriedLabel",
                label: "Married Label",
                icon: <SvgHeart className="w-3.5 h-3.5 text-amber-400" />,
                defaultVal: "Are getting married on"
              })}

              {renderCategorizedElementTool({
                key: "scratchDateText",
                label: "Wedding Date",
                icon: <SvgCalendar className="w-3.5 h-3.5 text-amber-400" />,
                defaultVal: config.weddingDate,
                isDate: true,
                dateType: "date"
              })}

              {renderCategorizedElementTool({
                key: "scratchCountdownLabel",
                label: "Countdown Label",
                icon: <SvgSparkles className="w-3.5 h-3.5 text-amber-400" />,
                defaultVal: "Countdown"
              })}

              {renderCategorizedElementTool({
                key: "scratchSecretMessage",
                label: "Hidden Secret Message",
                icon: <SvgHeart className="w-3.5 h-3.5 text-amber-400" />,
                defaultVal: "We have booked a private stargazing toast after the reception!"
              })}
            </div>

            {/* Card Theme & Appearance */}
            <div className="border-t border-slate-900 pt-3 space-y-3">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Card Theme &amp; Appearance</span>
              
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-1">Card Background</label>
                    <input 
                      type="color" 
                      value={config.scratchCardBg || "#0D1322"} 
                      onChange={(e) => onChangeField("scratchCardBg", e.target.value)}
                      className="w-full h-8 rounded cursor-pointer border border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-1">Countdown Box BG</label>
                    <input 
                      type="color" 
                      value={config.scratchCountdownBoxBg || "#121827"} 
                      onChange={(e) => onChangeField("scratchCountdownBoxBg", e.target.value)}
                      className="w-full h-8 rounded cursor-pointer border border-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {renderRgbaControlSelfParsed("Card Border Color", "scratchCardBorder", "rgba(220,185,90,0.45)")}
                  {renderRgbaControlSelfParsed("Card Glow Color", "scratchCardGlow", "rgba(233,190,86,0.18)")}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {renderRgbaControlSelfParsed("Countdown Box Border", "scratchCountdownBoxBorder", "rgba(220,185,90,0.4)")}
                  {renderRgbaControlSelfParsed("Section Border", "scratchSectionBorderColor", "rgba(220,185,90,0.35)")}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-1">Number Color</label>
                    <input 
                      type="color" 
                      value={config.scratchCountdownNumColor || "#F3D38A"} 
                      onChange={(e) => onChangeField("scratchCountdownNumColor", e.target.value)}
                      className="w-full h-7 rounded cursor-pointer border border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-1">Heading Color</label>
                    <input 
                      type="color" 
                      value={config.scratchHeadingColor || "#F7E8C5"} 
                      onChange={(e) => onChangeField("scratchHeadingColor", e.target.value)}
                      className="w-full h-7 rounded cursor-pointer border border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] uppercase text-slate-400 block mb-1">Description</label>
                    <input 
                      type="color" 
                      value={config.scratchDescColor || "#C8B78D"} 
                      onChange={(e) => onChangeField("scratchDescColor", e.target.value)}
                      className="w-full h-7 rounded cursor-pointer border border-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3D Scroll Effects */}
            <div className="border-t border-slate-900 pt-3 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wide">3D Kinetic Scroll Controls</span>
                <input 
                  type="checkbox"
                  checked={config.scroll3DEnabled !== false}
                  onChange={(e) => onChangeField("scroll3DEnabled", e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-800 accent-amber-500 cursor-pointer"
                />
              </div>

              {config.scroll3DEnabled !== false && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">3D Kinetic Effect Type</label>
                    <CustomSelect
                      value={config.scroll3DEffectType || "3d-roll"}
                      onChange={(val) => onChangeField("scroll3DEffectType", val)}
                      options={[
                        { value: "3d-roll", label: "3D Roll (Standard Depth Roll)" },
                        { value: "3d-tilt-slide", label: "3D Tilt Slide (Horizontal Shift)" },
                        { value: "gilded-zoom", label: "Gilded Zoom (Size Scaling)" },
                        { value: "cinematic-blur", label: "Cinematic Blur Fade (Glow Blur)" },
                        { value: "parallax-fly", label: "Parallax Fly-In (Float Translate)" }
                      ]}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Intensity Scale</label>
                      <input 
                        type="number" min="1" max="15" 
                        value={config.scroll3DIntensity || "4"}
                        onChange={(e) => onChangeField("scroll3DIntensity", parseInt(e.target.value) || 4)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-805 rounded text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Perspective Depth</label>
                      <input 
                        type="number" min="200" max="3000" step="50"
                        value={config.scroll3DPerspective || "900"}
                        onChange={(e) => onChangeField("scroll3DPerspective", parseInt(e.target.value) || 900)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-805 rounded text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {renderShadowControlBlock("Scratch Card", "scratch", "rgba(0, 0, 0, 0.2)")}
          </div>
        )}

        {/* RSVP & BLESSINGS TAB */}
        {activeTab === "rsvp" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">RSVP &amp; Blessings Style</h3>

            {/* RSVP section details */}
            {renderPartCard({
              title: "RSVP Reservation Form & Title",
              toggleKey: "showRsvpForm",
              children: (
                <div className="p-3 bg-slate-900/60 rounded border border-slate-850 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Font Style</label>
                      <CustomFontSelect
                        value={config.rsvpTitleFont || "font-serif"}
                        onChange={(val) => onChangeField("rsvpTitleFont", val)}
                        options={FONTS}
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Title Alignment</label>
                      <CustomSelect
                        value={config.rsvpTitleAlign || "text-center"}
                        onChange={(val) => onChangeField("rsvpTitleAlign", val)}
                        options={[
                          { value: "text-left", label: "Left" },
                          { value: "text-center", label: "Center" },
                          { value: "text-right", label: "Right" }
                        ]}
                      />
                    </div>
                  </div>
                  {renderRgbaControlSelfParsed("RSVP Title Color", "rsvpTitleColor", config.accentGold || "#b89254")}
                </div>
              )
            })}

            {/* Wishes section details */}
            {renderPartCard({
              title: "Guest Blessings & Wishes Wall",
              toggleKey: "showWishesWall",
              children: (
                <div className="p-3 bg-slate-900/60 rounded border border-slate-850 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Font Style</label>
                      <CustomFontSelect
                        value={config.wishTitleFont || "font-serif"}
                        onChange={(val) => onChangeField("wishTitleFont", val)}
                        options={FONTS}
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase text-slate-400 block mb-0.5">Title Alignment</label>
                      <CustomSelect
                        value={config.wishTitleAlign || "text-center"}
                        onChange={(val) => onChangeField("wishTitleAlign", val)}
                        options={[
                          { value: "text-left", label: "Left" },
                          { value: "text-center", label: "Center" },
                          { value: "text-right", label: "Right" }
                        ]}
                      />
                    </div>
                  </div>
                  {renderRgbaControlSelfParsed("Wishes Title Color", "wishTitleColor", config.accentGold || "#b89254")}
                </div>
              )
            })}

            {/* Glass buttons */}
            <div className="border-t border-slate-900 pt-3 space-y-3">
              <span className="text-[11px] font-bold text-slate-200 block uppercase tracking-wide">Glass Buttons Style</span>
              {renderRgbaControlSelfParsed("Button Background", "glassBtnBg", "rgba(255, 255, 255, 0.12)")}
              {renderRgbaControlSelfParsed("Button Border", "glassBtnBorder", "rgba(245, 158, 11, 0.35)")}
              {renderRgbaControlSelfParsed("Button Shadow Color", "glassBtnShadow", "rgba(245, 158, 11, 0.5)")}
              {renderRgbaControlSelfParsed("Button Text Color", "glassBtnText", "#ffffff")}

              <div>
                <div className="flex justify-between text-[8px] text-slate-400 mb-0.5">
                  <span>Shadow Blur Size</span>
                  <span>{config.glassBtnShadowSize || "16"}px</span>
                </div>
                <input 
                  type="range" min="0" max="60" 
                  value={config.glassBtnShadowSize || "16"} 
                  onChange={(e) => onChangeField("glassBtnShadowSize", e.target.value)}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>
            {renderShadowControlBlock("RSVP & Blessings", "rsvp", "rgba(0, 0, 0, 0.2)")}
          </div>
        )}

        {/* SAAS MULTI-TENANT & PRESETS TAB */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">SaaS Multi-Tenant Settings</h3>
            
            {onAssignCustomer && (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Assign to Customer</label>
                <CustomSelect
                  value={assignedCustomerId || ""}
                  onChange={(val) => onAssignCustomer(val || null)}
                  options={[
                    { value: "", label: "-- Select Customer (Unassigned) --" },
                    ...customers.map(c => ({
                      value: c.id,
                      label: `${c.displayName} (${c.username})`
                    }))
                  ]}
                />
              </div>
            )}

            {onChangeStatus && (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Invitation Status</label>
                <CustomSelect
                  value={status || "draft"}
                  onChange={(val) => onChangeStatus(val)}
                  options={[
                    { value: "draft", label: "Draft" },
                    { value: "preview", label: "Preview (Watermarked)" },
                    { value: "paid", label: "Paid (Live)" },
                    { value: "published", label: "Published" }
                  ]}
                />
              </div>
            )}

            {onChangePaymentStatus && (
              <div className="flex items-center justify-between bg-slate-900 p-3 rounded border border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Simulate Payment Status</p>
                  <p className="text-[9px] text-slate-400">Marking paid removes "DS" watermark</p>
                </div>
                <button
                  type="button"
                  onClick={() => onChangePaymentStatus(!isPaid)}
                  className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition ${
                    isPaid 
                      ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                  }`}
                >
                  {isPaid ? "Paid (Clear)" : "Unpaid (Watermarked)"}
                </button>
              </div>
            )}

            <div className="border-t border-slate-900 pt-3 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Custom WhatsApp &amp; Email Text</h3>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Share Template Message</label>
                <textarea 
                  value={config.shareText || `We are thrilled to invite you to our wedding celebration! View our digital invitation here: {url} - ${config.brideName || 'Bride'} & ${config.groomName || 'Groom'}`} 
                  onChange={(e) => onChangeField("shareText", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs focus:outline-none focus:border-amber-500 resize-none font-sans"
                  placeholder="Use {url} where the link should go"
                />
                <span className="text-[9px] text-slate-500 mt-1 block">💡 Protip: The string "{`{url}`}" will be replaced automatically by the invitation's active sharing URL.</span>
              </div>
            </div>

            {/* Design Preset Sync & Saving */}
            <div className="border-t border-slate-900 pt-3 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Design Preset Gallery</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Sync this design config back to a preset template to update its visual card thumbnail and demo link in the public "Browse Designs" gallery tab.
              </p>
              
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-wider text-slate-400 block">Select Preset Target</label>
                <CustomSelect
                  value={config.presetId || ""}
                  onChange={(val) => onChangeField("presetId", val)}
                  options={[
                    { value: "", label: "-- Associate with Preset template --" },
                    ...dbStore.getPresets().map(p => ({
                      value: p.id,
                      label: `${p.title} (${p.id})`
                    }))
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const pid = config.presetId;
                    if (!pid) {
                      triggerDialog({
                        type: 'alert',
                        title: 'Selection Required',
                        message: 'Please select a Preset Target template from the dropdown first to sync changes.'
                      });
                      return;
                    }
                    try {
                      dbStore.updatePreset(pid, {
                        config: { ...config }
                      });
                      triggerDialog({
                        type: 'alert',
                        title: 'Sync Success',
                        message: `Successfully synchronized this design to preset "${dbStore.getPresetById(pid)?.title || pid}"! Visual thumbnails in the gallery will reflect updates.`
                      });
                    } catch(err) {
                      console.error(err);
                      triggerDialog({
                        type: 'alert',
                        title: 'Sync Failed',
                        message: 'Failed to sync design config to preset.'
                      });
                    }
                  }}
                  className="py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] font-bold uppercase tracking-wider rounded text-amber-400 text-center transition"
                >
                  Sync to Preset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerDialog({
                      type: 'prompt',
                      title: 'Save New Preset Template',
                      message: 'Enter a title for the new design template in the gallery:',
                      defaultValue: `${config.brideName || 'Bride'} & ${config.groomName || 'Groom'}'s Theme`,
                      onConfirm: (titleInput) => {
                        if (!titleInput) return;
                        try {
                          const newP = dbStore.createPresetFromInvitation(config, titleInput);
                          onChangeField("presetId", newP.id);
                          triggerDialog({
                            type: 'alert',
                            title: 'Template Created',
                            message: `Successfully added new design template "${titleInput}" to the Browse Designs tab!`
                          });
                        } catch(err) {
                          console.error(err);
                          triggerDialog({
                            type: 'alert',
                            title: 'Creation Failed',
                            message: 'Failed to create new preset template.'
                          });
                        }
                      }
                    });
                  }}
                  className="py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 text-[10px] font-bold uppercase tracking-wider rounded text-center transition"
                >
                  Save New Preset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <CustomDialog {...dialog} themeConfig={config} />
    </div>
  );
}
