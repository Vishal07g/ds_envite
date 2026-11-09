import fs from 'fs';

const filePath = 'Frontend/src/utils/googleDriveStorage.js';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// 1. Check if subfolder helper exists, if not add it
const helperCode = `
/**
 * Maps an invitation media category to its proper subfolder in Drive:
 * - images/ (photos, covers, galleries, symbols)
 * - videos/ (cover videos, background videos)
 * - music/ (starting song, background music)
 * - files/ (documents, cliparts, attachments)
 */
export function getMediaSubfolderName(category, file = null) {
  const isVideo = Boolean(
    (file && file.type && (file.type.startsWith("video/") || file.type.includes("mp4") || file.type.includes("webm") || file.type.includes("quicktime"))) ||
    (typeof category === "string" && (category.toLowerCase().includes("video") || category === "scratchCardBgVideo" || category === "envelopeBgVideo"))
  );
  if (isVideo) return "videos";

  const isAudio = Boolean(
    (file && file.type && (file.type.startsWith("audio/") || file.type.includes("mpeg") || file.type.includes("mp3") || file.type.includes("wav") || file.type.includes("ogg"))) ||
    (typeof category === "string" && (category.toLowerCase().includes("music") || category.toLowerCase().includes("audio") || category.toLowerCase().includes("song")))
  );
  if (isAudio) return "music";

  if (category === "files" || category === "documents" || category === "pdf") return "files";

  return "images";
}
`;

if (!content.includes('getMediaSubfolderName')) {
  // insert right before formatDriveFolderName
  content = content.replace('export function formatDriveFolderName', `${helperCode}\nexport function formatDriveFolderName`);
  console.log('ADDED_SUBFOLDER_HELPER');
}

fs.writeFileSync(filePath, content, 'utf8');

