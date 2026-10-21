// Helper function to convert Hex to RGB
export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return { r: 11, g: 19, b: 41 };
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 11, g: 19, b: 41 };
}

// Helper function to convert RGB to Hex
export function rgbToHex(r, g, b) {
  const clamp = (val) => Math.min(Math.max(0, val), 255);
  return "#" + ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1);
}

// CSS class mapper for custom wedding frame shapes and border styles
export function getFrameClasses(shape, border) {
  let shapeClass = "";
  switch(shape) {
    case "portrait": shapeClass = "aspect-[3/4] rounded-2xl"; break;
    case "square": shapeClass = "aspect-square rounded-xl"; break;
    case "round": shapeClass = "aspect-square rounded-full"; break;
    case "oval": shapeClass = "aspect-[2/3] rounded-[50%]"; break;
    case "landscape": shapeClass = "aspect-[16/10] rounded-xl"; break;
    default: shapeClass = "aspect-[3/4] rounded-2xl";
  }

  let borderClass = "";
  switch(border) {
    case "double-gilded":
      borderClass = "ring-4 ring-amber-500/80 ring-offset-4 ring-offset-slate-900 border-2 border-amber-300";
      break;
    case "pearls":
      borderClass = "border-[8px] border-double border-pink-100 shadow-[0_0_20px_rgba(244,219,219,0.7)]";
      break;
    case "floral-lace":
      borderClass = "border-4 border-dashed border-rose-300 ring-8 ring-rose-100 ring-offset-2";
      break;
    case "custom-png":
      borderClass = "border-0 shadow-none";
      break;
    case "minimalist":
      borderClass = "border-2 border-white/60 shadow-lg";
      break;
    default:
      borderClass = "border-2 border-white/60 shadow-lg";
  }

  return `${shapeClass} ${borderClass}`;
}

function parseCustomDate(dateStr) {
  if (!dateStr) return null;
  const str = dateStr.trim();
  
  // Check if it matches ISO format YYYY-MM-DD
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(str)) {
    const parts = str.split(/[T ]/)[0].split(/[-/]/);
    const timePart = str.split(/[T ]/)[1] || "";
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    
    let hour = 12;
    let min = 0;
    if (timePart) {
      const t = timePart.split(":");
      hour = parseInt(t[0]) || 12;
      min = parseInt(t[1]) || 0;
    }
    return new Date(year, month, day, hour, min);
  }
  
  // Check if it matches European/Indian format DD-MM-YYYY (e.g. 29-11-2026)
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(str)) {
    const parts = str.split(/[T ]/)[0].split(/[-/]/);
    const timePart = str.split(/[T ]/)[1] || "";
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    
    let hour = 12;
    let min = 0;
    if (timePart) {
      const t = timePart.split(":");
      hour = parseInt(t[0]) || 12;
      min = parseInt(t[1]) || 0;
    }
    
    if (month >= 0 && month < 12 && day > 0 && day <= 31) {
      return new Date(year, month, day, hour, min);
    }
  }

  // Fallback to native parsing
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  return null;
}

// Formats date string into dd-mm-yyyy
export function formatWeddingDateDmy(dateStr) {
  try {
    const date = parseCustomDate(dateStr);
    if (!date || isNaN(date.getTime())) return "TBD";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (e) {
    return "TBD";
  }
}

// Formats date string into human readable format
export function formatWeddingDate(dateStr) {
  if (!dateStr) return "TBD";
  try {
    const date = parseCustomDate(dateStr);
    if (!date || isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

// Formats time string into human readable format
export function formatWeddingTime(dateStr) {
  if (!dateStr) return "";
  try {
    const date = parseCustomDate(dateStr);
    if (!date || isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-US", {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return "";
  }
}

// Client-side image compression using canvas
export function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7, preserveAlpha = false) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions keeping aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        
        // Preserve transparency only if preserveAlpha is true AND file is image/png
        const usePng = preserveAlpha && file.type === 'image/png';
        
        if (!usePng) {
          // Fill canvas background with white to avoid transparent parts rendering as black in JPEG
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }
        
        ctx.drawImage(img, 0, 0, width, height);

        const format = usePng ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(format, format === 'image/jpeg' ? quality : undefined);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

// Parses color strings (hex, rgb, rgba) into { r, g, b, a } object
export function parseColor(colorStr) {
  const defaultVal = { r: 245, g: 158, b: 11, a: 1.0 };
  if (!colorStr || typeof colorStr !== 'string') return defaultVal;
  
  const trimmed = colorStr.trim().toLowerCase();
  
  // rgba(r, g, b, a) or rgb(r, g, b)
  const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
      a: rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1.0
    };
  }
  
  // 6-digit hex (#ffffff)
  const hexMatch = trimmed.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
      a: 1.0
    };
  }
  
  // 3-digit hex (#fff)
  const shorthandMatch = trimmed.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);
  if (shorthandMatch) {
    return {
      r: parseInt(shorthandMatch[1] + shorthandMatch[1], 16),
      g: parseInt(shorthandMatch[2] + shorthandMatch[2], 16),
      b: parseInt(shorthandMatch[3] + shorthandMatch[3], 16),
      a: 1.0
    };
  }
  
  return defaultVal;
}

// Serializes { r, g, b, a } numbers to CSS rgba() format
export function rgbaToCss(r, g, b, a) {
  const clampRgb = (val) => Math.min(Math.max(0, Math.round(val)), 255);
  const clampAlpha = (val) => Math.min(Math.max(0, parseFloat(val)), 1);
  return `rgba(${clampRgb(r)}, ${clampRgb(g)}, ${clampRgb(b)}, ${clampAlpha(a)})`;
}

/**
 * Extract Google Drive file ID from any Google Drive URL format
 */
export function extractDriveFileId(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const apiMatch = trimmed.match(/\/drive\/v3\/files\/([a-zA-Z0-9_-]{15,})/);
  if (apiMatch) return apiMatch[1];

  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{15,})/);
  if (fileDMatch) return fileDMatch[1];

  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{15,})/);
  if (dMatch) return dMatch[1];

  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (idMatch) return idMatch[1];

  return null;
}

/**
 * Automatically format Google Drive URLs into fast, permanent embeddable CDN URLs
 * - type: 'image' -> 'https://lh3.googleusercontent.com/d/{fileId}'
 * - type: 'audio' / 'media' -> 'https://drive.google.com/uc?export=download&id={fileId}'
 */
export function formatDriveDirectUrl(url, type = "image") {
  if (!url || typeof url !== "string") return url;
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  const fileId = extractDriveFileId(trimmed);
  if (!fileId) return trimmed;

  if (type === "audio" || type === "music" || type === "sound") {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  return `https://lh3.googleusercontent.com/d/${fileId}`;
}


