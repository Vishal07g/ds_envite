// Google Drive Cloud Storage Integration Service for Wedding Invitations
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase.js";
import { compressImage } from "./helpers.js";

const env = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : (typeof process !== "undefined" && process.env ? process.env : {});

export const GOOGLE_DRIVE_ROOT_FOLDER_ID = 
  env.VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID || "1_pdrNFiXcOymZQEby52O3FbvImCU_SW8";

export const GOOGLE_DRIVE_ROOT_FOLDER_URL = 
  env.VITE_GOOGLE_DRIVE_FOLDER_URL || 
  `https://drive.google.com/drive/folders/${GOOGLE_DRIVE_ROOT_FOLDER_ID}?usp=drive_link`;

export const GOOGLE_DRIVE_API_KEY = 
  env.VITE_GOOGLE_DRIVE_API_KEY || "AIzaSyDQTB_jBNM85-QwmJtVSfxne1V4BmoOe6Y";

export const GOOGLE_DRIVE_CLIENT_ID = 
  env.VITE_GOOGLE_DRIVE_CLIENT_ID || "481414834690-smumepc6si7n9qcrqs559e5rqv405d9v.apps.googleusercontent.com";

// Designated Google Drive Owner Account - strictly sync all Drive assets to this account
export const GOOGLE_DRIVE_OWNER_EMAIL = 
  env.VITE_GOOGLE_DRIVE_OWNER_EMAIL || "snierxgameplay@gmail.com";

/**
 * Get active stored OAuth access token
 */
export function getStoredOAuthToken() {
  const token = (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("gdrive_oauth_token") : null) || 
                (typeof localStorage !== "undefined" ? localStorage.getItem("gdrive_oauth_token") : null);
  const expiresAt = parseInt(
    (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("gdrive_oauth_expires_at") : null) || 
    (typeof localStorage !== "undefined" ? localStorage.getItem("gdrive_oauth_expires_at") : "0") || 
    "0", 
    10
  );
  if (token && Date.now() < expiresAt) {
    return token;
  }
  return null;
}

/**
 * Request Google Drive OAuth Token via Google Identity Services
 */
export function requestGoogleDriveAuth() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.google?.accounts?.oauth2) {
      return reject(new Error("Google Identity Services script is still loading. Please wait 2 seconds and try again."));
    }

    let isSettled = false;
    const timeoutId = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        reject(new Error("Google Drive authorization timed out or popup was closed/blocked."));
      }
    }, 30000);

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_DRIVE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive",
        hint: GOOGLE_DRIVE_OWNER_EMAIL,
        callback: async (tokenResponse) => {
          if (isSettled) return;

          if (tokenResponse.error) {
            isSettled = true;
            clearTimeout(timeoutId);
            const errDetail = tokenResponse.error_description || tokenResponse.error;
            const errStr = String(errDetail);
            if (errStr.toLowerCase().includes("origin_mismatch")) {
              const currentOrigin = typeof window !== "undefined" ? window.location.origin : "current origin";
              reject(new Error(`Google OAuth Origin Mismatch (Error 400): Origin "${currentOrigin}" is not registered in Google Cloud Console. Please add "${currentOrigin}" to Authorized JavaScript Origins for Client ID, or use the 1-click Google Apps Script Webhook for snierxgameplay@gmail.com.`));
            } else {
              reject(new Error(errStr));
            }
            return;
          }

          const token = tokenResponse.access_token;

          // Strictly verify signed-in account is snierxgameplay@gmail.com
          try {
            const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (userRes.ok) {
              const profile = await userRes.json();
              if (profile.email && profile.email.toLowerCase() !== GOOGLE_DRIVE_OWNER_EMAIL.toLowerCase()) {
                isSettled = true;
                clearTimeout(timeoutId);
                if (typeof sessionStorage !== "undefined") {
                  sessionStorage.removeItem("gdrive_oauth_token");
                  sessionStorage.removeItem("gdrive_oauth_expires_at");
                }
                if (typeof localStorage !== "undefined") {
                  localStorage.removeItem("gdrive_oauth_token");
                  localStorage.removeItem("gdrive_oauth_expires_at");
                }
                if (window.google?.accounts?.oauth2?.revoke) {
                  window.google.accounts.oauth2.revoke(token, () => {});
                }
                reject(new Error(`Account mismatch! Signed in as "${profile.email}". Google Drive MUST be synced with "${GOOGLE_DRIVE_OWNER_EMAIL}" only.`));
                return;
              }
            }
          } catch(profileErr) {
            console.warn("Could not verify Google profile email:", profileErr);
          }

          isSettled = true;
          clearTimeout(timeoutId);
          const expiresIn = parseInt(tokenResponse.expires_in || "3500", 10);
          const expiresTimestamp = String(Date.now() + (expiresIn - 60) * 1000);
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.setItem("gdrive_oauth_token", token);
            sessionStorage.setItem("gdrive_oauth_expires_at", expiresTimestamp);
          }
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("gdrive_oauth_token", token);
            localStorage.setItem("gdrive_oauth_expires_at", expiresTimestamp);
          }
          resolve(token);
        }
      });

      // Always request account selection with hint of the target email
      client.requestAccessToken({
        prompt: "select_account",
        hint: GOOGLE_DRIVE_OWNER_EMAIL
      });
    } catch (err) {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timeoutId);
        reject(err);
      }
    }
  });
}

/**
 * Create or get folder on Google Drive using OAuth access token
 */
export async function getOrCreateDriveFolderOAuth(folderName, parentFolderId = GOOGLE_DRIVE_ROOT_FOLDER_ID, token) {
  const authToken = token || getStoredOAuthToken();
  if (!authToken) throw new Error("No active Google Drive OAuth token. Please authorize first.");

  // 1. Check if folder already exists
  const safeName = folderName.replace(/'/g, "\\'");
  const q = `'${parentFolderId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+name='${encodeURIComponent(safeName)}'+and+trashed=false`;
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)`, {
    headers: { "Authorization": `Bearer ${authToken}` }
  });
  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0];
    }
  }

  // 2. Create new folder
  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${authToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId]
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || "Failed to create folder in Google Drive");
  }

  const newFolder = await createRes.json();

  // Make folder accessible with link
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${newFolder.id}/permissions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "reader",
        type: "anyone"
      })
    });
  } catch(e) {}

  return newFolder;
}

/**
 * Upload a Blob directly to Google Drive via OAuth multipart upload
 */
export async function uploadFileToDriveOAuth({ blob, fileName, mimeType = "image/jpeg", folderId, token }) {
  const authToken = token || getStoredOAuthToken();
  if (!authToken) throw new Error("No Google Drive authorization token.");

  const metadata = {
    name: fileName,
    parents: [folderId || GOOGLE_DRIVE_ROOT_FOLDER_ID]
  };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", blob, fileName);

  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,webViewLink", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${authToken}`
    },
    body: form
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Failed to upload file to Google Drive");
  }

  const uploaded = await res.json();

  // Set permissions so anyone with the link can view
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${uploaded.id}/permissions?supportsAllDrives=true`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "reader",
        type: "anyone",
        allowFileDiscovery: false
      })
    });
  } catch(e) {}

  const directUrl = getDriveDirectFileUrl(uploaded.id, mimeType);

  return {
    fileId: uploaded.id,
    fileName: uploaded.name,
    directUrl,
    webViewLink: uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`
  };
}

/**
 * Permanently delete a file from Google Drive to free storage space
 */
export async function deleteDriveFileOAuth(fileId, token) {
  if (!fileId) return false;
  const authToken = token || getStoredOAuthToken();
  const webhookUrl = getDriveWebhookUrl();

  // 1. Delete via OAuth token
  if (authToken) {
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?supportsAllDrives=true`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      return res.status === 204 || res.ok;
    } catch (err) {
      console.warn(`Failed to delete Google Drive file ${fileId} via OAuth:`, err);
    }
  }

  // 2. Delete via Webhook
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "deleteFile",
          fileId: fileId
        })
      });
      return res.ok;
    } catch (e) {}
  }

  return false;
}

/**
 * Permanently delete or trash a folder from Google Drive when an invitation is deleted
 */
export async function deleteDriveFolder(folderId, token, folderName = null) {
  let targetFolderId = folderId;
  const authToken = token || getStoredOAuthToken();
  const webhookUrl = getDriveWebhookUrl();

  // If folderId is not directly known, try looking it up by folderName in GOOGLE_DRIVE_ROOT_FOLDER_ID
  if (!targetFolderId && folderName) {
    try {
      const found = await findDriveFolderByName(folderName, GOOGLE_DRIVE_ROOT_FOLDER_ID);
      if (found && found.id) {
        targetFolderId = found.id;
      }
    } catch (e) {
      console.warn("Could not find folder by name for deletion:", e);
    }
  }

  if (!targetFolderId && !webhookUrl) {
    return { success: false, message: "No folderId or folderName found to delete in Google Drive" };
  }

  let oauthSuccess = false;
  let webhookSuccess = false;

  // 1. Delete / move to trash via OAuth
  if (authToken && targetFolderId) {
    try {
      // First try moving to trash via PATCH (standard Google Drive behavior)
      const trashRes = await fetch(`https://www.googleapis.com/drive/v3/files/${targetFolderId}?supportsAllDrives=true`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ trashed: true })
      });
      if (trashRes.ok) {
        oauthSuccess = true;
      } else {
        // Fallback to direct DELETE
        const delRes = await fetch(`https://www.googleapis.com/drive/v3/files/${targetFolderId}?supportsAllDrives=true`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${authToken}` }
        });
        if (delRes.status === 204 || delRes.ok) oauthSuccess = true;
      }
    } catch (err) {
      console.warn(`Failed to delete Google Drive folder ${targetFolderId} via OAuth:`, err);
    }
  }

  // 2. Delete / move to trash via Webhook
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "deleteFolder",
          folderId: targetFolderId || null,
          folderName: folderName || null,
          rootFolderId: GOOGLE_DRIVE_ROOT_FOLDER_ID
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "success") webhookSuccess = true;
      }
    } catch (e) {
      console.warn("Failed to delete Google Drive folder via Webhook:", e);
    }
  }

  return {
    success: oauthSuccess || webhookSuccess,
    folderId: targetFolderId,
    message: (oauthSuccess || webhookSuccess)
      ? "Google Drive folder moved to trash successfully"
      : "Google Drive folder deletion recorded"
  };
}

/**
 * Clean up all orphaned / unused files from an invitation's Google Drive folder
 * Ensures only files actively used by the invitation currently remain in Drive
 */
export async function cleanUnusedDriveFilesOAuth({ invitation, token }) {
  const authToken = token || getStoredOAuthToken();
  if (!authToken || !invitation) return { success: false, deletedCount: 0 };

  const targetFolderId = invitation?.driveStorage?.folderId;
  if (!targetFolderId) return { success: false, deletedCount: 0 };

  try {
    // 1. Extract all active Drive file IDs in the current invitation config
    const activeFileIds = new Set();
    const config = invitation.config || {};
    
    // Check all top-level config properties
    for (const key of Object.keys(config)) {
      const val = config[key];
      if (typeof val === 'string') {
        const id = extractDriveFileId(val);
        if (id) activeFileIds.add(id);
      }
    }

    // Check timeline events
    if (Array.isArray(config.timelineEvents)) {
      for (const evt of config.timelineEvents) {
        if (evt?.customImageUrl) {
          const id = extractDriveFileId(evt.customImageUrl);
          if (id) activeFileIds.add(id);
        }
      }
    }

    // 2. Query all files inside this invitation's Drive folder
    const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`'${targetFolderId}' in parents and trashed = false`)}&fields=files(id,name,mimeType)&supportsAllDrives=true&pageSize=100`;
    const listRes = await fetch(listUrl, {
      headers: { "Authorization": `Bearer ${authToken}` }
    });

    if (!listRes.ok) return { success: false, deletedCount: 0 };
    const listData = await listRes.json();
    const files = listData.files || [];

    let deletedCount = 0;
    for (const f of files) {
      if (f.mimeType !== 'application/vnd.google-apps.folder' && !activeFileIds.has(f.id)) {
        console.log(`Clearing unused file from Drive: ${f.name} (${f.id})`);
        const deleted = await deleteDriveFileOAuth(f.id, authToken);
        if (deleted) deletedCount++;
      }
    }

    return { success: true, deletedCount, totalFiles: files.length };
  } catch (err) {
    console.error("cleanUnusedDriveFilesOAuth error:", err);
    return { success: false, deletedCount: 0, error: err.message };
  }
}

/**
 * Perform 1-click end-to-end transfer of invitation assets to Google Drive via OAuth
 */
export async function transferInvitationToGoogleDriveOAuth({ invitation, token, onProgress }) {
  if (!invitation) throw new Error("No invitation specified");
  
  // 1. Ensure active OAuth token
  let authToken = token || getStoredOAuthToken();
  if (!authToken) {
    if (onProgress) onProgress({ message: "Waiting for Google Account authorization...", percent: 10 });
    authToken = await requestGoogleDriveAuth();
  }

  const config = invitation.config || {};
  const folderName = formatDriveFolderName(config, invitation.title);

  if (onProgress) onProgress({ message: `Creating or finding Drive folder: "${folderName}"...`, percent: 20 });
  const folder = await getOrCreateDriveFolderOAuth(folderName, GOOGLE_DRIVE_ROOT_FOLDER_ID, authToken);

  // 2. Identify all media fields to upload
  const MEDIA_FIELDS = [
    "heroImage", "storyImage", "scratchSectionBgImage", "scratchImage",
    "customSacredSymbolImg", "envelopeWaxSealImg", "envelopeSymbolImg", "envelopeBgImage",
    "galleryImage1", "galleryImage2", "galleryImage3", "galleryImage4", "galleryImage5",
    "galleryImage6", "galleryImage7", "galleryImage8", "galleryImage9", "galleryImage10",
    "startingMusicUrl", "musicUrl"
  ];

  const filesToUpload = [];
  for (const field of MEDIA_FIELDS) {
    const val = config[field];
    if (!val) continue;

    // A) If base64
    if (typeof val === "string" && val.startsWith("data:")) {
      const converted = base64ToBlob(val);
      if (converted) {
        filesToUpload.push({
          field,
          fileName: `${field}.${converted.ext}`,
          blob: converted.blob,
          mimeType: converted.mimeType
        });
      }
    } 
    // B) If local /drive_storage/ URL from extraction
    else if (typeof val === "string" && val.startsWith("/drive_storage/")) {
      try {
        const fetchRes = await fetch(val);
        if (fetchRes.ok) {
          const blob = await fetchRes.blob();
          const ext = val.split(".").pop() || "jpg";
          filesToUpload.push({
            field,
            fileName: `${field}.${ext}`,
            blob,
            mimeType: blob.type || "image/jpeg"
          });
        }
      } catch(e) {
        console.warn(`Could not fetch local asset ${val}:`, e);
      }
    }
  }

  if (filesToUpload.length === 0) {
    return {
      success: true,
      folderId: folder.id,
      folderUrl: folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`,
      folderName,
      uploadedCount: 0,
      message: "All files are already cleanly synced from Google Drive!"
    };
  }

  // 3. Upload each file to Google Drive via OAuth
  const updatedConfig = { ...config };
  let uploadedCount = 0;

  for (let i = 0; i < filesToUpload.length; i++) {
    const item = filesToUpload[i];
    const pct = Math.round(20 + ((i + 1) / filesToUpload.length) * 75);
    if (onProgress) {
      onProgress({
        message: `Uploading "${item.fileName}" to Google Drive (${i + 1}/${filesToUpload.length})...`,
        percent: pct
      });
    }

    try {
      const res = await uploadFileToDriveOAuth({
        blob: item.blob,
        fileName: item.fileName,
        mimeType: item.mimeType,
        folderId: folder.id,
        token: authToken
      });

      if (res.directUrl) {
        updatedConfig[item.field] = res.directUrl;
        uploadedCount++;
      }
    } catch(err) {
      console.error(`Failed to upload ${item.fileName}:`, err);
    }
  }

  return {
    success: true,
    folderId: folder.id,
    folderUrl: folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`,
    folderName,
    uploadedCount,
    updatedConfig
  };
}

/**
 * Real-time Google Drive v3 Direct API Query Service
 */
export async function queryDriveChildren(parentFolderId = GOOGLE_DRIVE_ROOT_FOLDER_ID) {
  if (!parentFolderId) return [];
  const safeId = encodeURIComponent(parentFolderId);
  const q = `'${safeId}'+in+parents+and+trashed=false`;
  const oauthToken = getStoredOAuthToken();
  if (oauthToken) {
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,size,webContentLink,webViewLink,thumbnailLink)&pageSize=100`, {
        headers: { "Authorization": `Bearer ${oauthToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        return data.files || [];
      }
    } catch(e) {}
  }
  if (GOOGLE_DRIVE_API_KEY) {
    try {
      const url = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${GOOGLE_DRIVE_API_KEY}&fields=files(id,name,mimeType,size,webContentLink,webViewLink,thumbnailLink)&pageSize=100`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data.files || [];
      }
    } catch (err) {
      console.warn("Failed to query Google Drive folder via API key:", err);
    }
  }
  return [];
}

/**
 * Find subfolder in Google Drive root by exact name
 */
export async function findDriveFolderByName(folderName, parentFolderId = GOOGLE_DRIVE_ROOT_FOLDER_ID) {
  if (!folderName) return null;
  const safeName = folderName.replace(/'/g, "\\'");
  const q = `'${parentFolderId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+name='${encodeURIComponent(safeName)}'+and+trashed=false`;
  const oauthToken = getStoredOAuthToken();
  if (oauthToken) {
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)`, {
        headers: { "Authorization": `Bearer ${oauthToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.files && data.files.length > 0) return data.files[0];
      }
    } catch(e) {}
  }
  if (GOOGLE_DRIVE_API_KEY) {
    try {
      const url = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${GOOGLE_DRIVE_API_KEY}&fields=files(id,name,webViewLink)`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return (data.files && data.files.length > 0) ? data.files[0] : null;
      }
    } catch (err) {
      console.warn("Error finding folder on Drive:", err);
    }
  }
  return null;
}
/**
 * Extract Google Drive file ID from any Google Drive URL format:
 * - https://drive.google.com/file/d/{id}/view...
 * - https://drive.google.com/open?id={id}
 * - https://drive.google.com/uc?id={id}
 * - https://drive.google.com/uc?export=download&id={id}
 * - https://www.googleapis.com/drive/v3/files/{id}...
 * - https://lh3.googleusercontent.com/d/{id}
 * - https://docs.google.com/file/d/{id}
 */
export function extractDriveFileId(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. Check googleapis.com/drive/v3/files/{id}
  const apiMatch = trimmed.match(/\/drive\/v3\/files\/([a-zA-Z0-9_-]{15,})/);
  if (apiMatch) return apiMatch[1];

  // 2. Check /file/d/{id}
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{15,})/);
  if (fileDMatch) return fileDMatch[1];

  // 3. Check /d/{id} (e.g. googleusercontent.com/d/{id})
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{15,})/);
  if (dMatch) return dMatch[1];

  // 4. Check query param id= or ?id=
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (idMatch) return idMatch[1];

  return null;
}

/**
 * Check if a URL or data URI represents a video asset
 */
export function isVideoUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();
  if (!trimmed) return false;
  if (trimmed.startsWith("data:video/") || trimmed.startsWith("blob:")) return true;
  if (/\.(mp4|webm|ogg|mov|m4v|mkv|avi)(\?.*)?$/i.test(trimmed)) return true;
  if (trimmed.includes("type=video") || trimmed.includes("mediatype=video") || trimmed.includes("video/mp4") || trimmed.includes("video/webm")) return true;
  return false;
}

/**
 * Format any Google Drive URL into an ultra-fast, permanently embeddable/playable direct streaming URL.
 * - type: 'image' -> 'https://lh3.googleusercontent.com/d/{fileId}=s0' (Google global CDN Full HD original resolution, CORS enabled, no rate limits)
 * - type: 'video' -> 'https://drive.google.com/uc?export=download&id={fileId}#type=video' (Direct binary stream)
 * - type: 'audio' / 'media' -> 'https://drive.google.com/uc?export=download&id={fileId}' (Direct binary stream)
 */
export function formatDriveDirectUrl(url, type = "image") {
  if (!url || typeof url !== "string") return url;
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  const isVideo = type === "video" || isVideoUrl(trimmed);
  const isAudio = type === "audio" || type === "music" || type === "sound" || type === "media";

  const fileId = extractDriveFileId(trimmed);
  if (!fileId) return trimmed;

  if (isVideo) {
    return `https://drive.google.com/uc?export=download&id=${fileId}#type=video`;
  }

  if (isAudio) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  // Always serve crystal-clear Full HD / original uncompressed resolution (=s0)
  if (trimmed.includes("googleusercontent.com")) {
    if (/=(?:s\d+|w\d+-h\d+.*)$/i.test(trimmed)) {
      return trimmed.replace(/=(?:s\d+|w\d+-h\d+.*)$/i, "=s0");
    }
    if (trimmed.includes("=s0") || trimmed.includes("=s2560") || trimmed.includes("=s3840")) {
      return trimmed;
    }
    if (!trimmed.includes("=")) {
      return `${trimmed}=s0`;
    }
    return trimmed;
  }
  return `https://lh3.googleusercontent.com/d/${fileId}=s0`;
}

/**
 * Generate high-speed CDN streaming URL for Google Drive file with Full HD resolution
 */
export function getDriveDirectFileUrl(fileId, mimeType = "") {
  if (!fileId) return "";
  const isVideo = Boolean(
    mimeType && (
      mimeType.startsWith("video/") || 
      mimeType.includes("mp4") || 
      mimeType.includes("webm") || 
      mimeType.includes("quicktime")
    )
  );
  if (isVideo) {
    return `https://drive.google.com/uc?export=download&id=${fileId}#type=video`;
  }
  const isAudio = Boolean(
    mimeType && (
      mimeType.startsWith("audio/") || 
      mimeType.includes("mpeg") || 
      mimeType.includes("mp3") || 
      mimeType.includes("wav") || 
      mimeType.includes("ogg")
    )
  );
  if (isAudio) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return `https://lh3.googleusercontent.com/d/${fileId}=s0`;
}

/**
 * Automatically inspect Google Drive folder for an invitation and bind all assets directly to the invitation config!
 */
export async function syncInvitationMediaFromDrive(invitation) {
  if (!invitation || !GOOGLE_DRIVE_API_KEY) return { success: false, syncedFiles: 0 };
  const config = invitation.config || {};
  const folderName = formatDriveFolderName(config, invitation.title);
  
  // 1. Locate folder on Google Drive
  let folder = null;
  if (invitation.driveStorage?.folderId) {
    folder = { id: invitation.driveStorage.folderId, webViewLink: invitation.driveStorage.folderUrl };
  } else {
    folder = await findDriveFolderByName(folderName);
  }

  if (!folder) {
    return { success: false, message: `Folder "${folderName}" not yet found in Google Drive root`, syncedFiles: 0 };
  }

  // 2. Query all files inside the folder in Google Drive
  const files = await queryDriveChildren(folder.id);
  if (!files || files.length === 0) {
    return { success: true, folderId: folder.id, syncedFiles: 0, message: "Folder exists in Drive but is currently empty" };
  }

  const updatedConfig = { ...config };
  let syncedFiles = 0;

  files.forEach(file => {
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const directUrl = getDriveDirectFileUrl(file.id, file.mimeType);

    const candidateKeys = [
      "heroImage", "storyImage", "scratchSectionBgImage", "scratchImage",
      "customSacredSymbolImg", "envelopeWaxSealImg", "envelopeSymbolImg", "envelopeBgImage",
      "galleryImage1", "galleryImage2", "galleryImage3", "galleryImage4", "galleryImage5",
      "galleryImage6", "galleryImage7", "galleryImage8", "galleryImage9", "galleryImage10",
      "startingMusicUrl", "musicUrl"
    ];

    for (const key of candidateKeys) {
      if (baseName === key || baseName.startsWith(key)) {
        updatedConfig[key] = directUrl;
        syncedFiles++;
        break;
      }
    }
  });

  return {
    success: true,
    folderId: folder.id,
    folderUrl: folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`,
    folderName: folderName,
    syncedFiles,
    files,
    updatedConfig
  };
}

/**
 * Format folder name strictly according to:
 * "name of bride and groom name with wedding location in bracket whatever is given by customer or admin"
 */
export function formatDriveFolderName(config = {}, fallbackTitle = "") {
  const sanitize = (str) => String(str || "").replace(/[/\\?%*:|"<>]/g, "-").replace(/\s+/g, " ").trim();

  const bride = sanitize(config.brideName || config.coverBrideText || "");
  const groom = sanitize(config.groomName || config.coverGroomText || "");

  // Hero / Character / Celebrant / Child name for ANY type of invitation (Kids, Superhero, Birthday, etc.)
  const heroCharacter = sanitize(
    config.heroCharacter ||
    config.characterName ||
    config.heroName ||
    config.celebrantName ||
    config.childName ||
    config.personName ||
    config.babyName ||
    (Array.isArray(config.heroNames) ? config.heroNames.join(" & ") : "") ||
    ""
  );

  // Wedding / Event location
  let location = sanitize(
    config.weddingVenue || 
    config.weddingAddress || 
    config.venueName || 
    config.venueAddress || 
    config.location || 
    ""
  );

  if (config.weddingVenue && config.weddingAddress && config.weddingVenue !== config.weddingAddress) {
    location = sanitize(`${config.weddingVenue}, ${config.weddingAddress}`);
  }

  // 1. Bride & Groom (Wedding type)
  if (bride && groom) {
    return location ? `${bride} & ${groom} (${location})` : `${bride} & ${groom}`;
  }

  // 2. Hero character / Celebrant name (Any other type of invitation)
  if (heroCharacter) {
    return location ? `${heroCharacter} (${location})` : heroCharacter;
  }

  // 3. Single name (bride, groom, or celebrant)
  if (bride || groom) {
    const single = bride || groom;
    return location ? `${single} (${location})` : single;
  }

  // 4. Fallback Title (e.g. "New Wedding Invitation", "Spider-Man Birthday", etc.)
  const cleanTitle = sanitize(fallbackTitle || config.title || "New Invitation");
  return location ? `${cleanTitle} (${location})` : cleanTitle;
}

/**
 * Get active Webhook URL (from .env or localStorage configuration)
 */
export function getDriveWebhookUrl() {
  return env.VITE_GOOGLE_DRIVE_WEBHOOK_URL || (typeof localStorage !== "undefined" ? localStorage.getItem("google_drive_webhook_url") : "") || "";
}

/**
 * Set active Webhook URL
 */
export function setDriveWebhookUrl(url) {
  if (url) {
    localStorage.setItem("google_drive_webhook_url", url.trim());
  } else {
    localStorage.removeItem("google_drive_webhook_url");
  }
}

/**
 * Synchronize or create unique folder on Google Drive for an invitation
 */
export async function syncDriveFolder({ invitation, oldFolderName, customFolderName = null, token = null }) {
  if (!invitation) return null;
  const config = invitation.config || {};
  const expectedFolderName = customFolderName || invitation.driveStorage?.folderName || formatDriveFolderName(config, invitation.title);
  const webhookUrl = getDriveWebhookUrl();
  const authToken = token || getStoredOAuthToken();

  const folderState = {
    rootFolderId: GOOGLE_DRIVE_ROOT_FOLDER_ID,
    rootFolderUrl: GOOGLE_DRIVE_ROOT_FOLDER_URL,
    folderName: expectedFolderName,
    folderId: invitation.driveStorage?.folderId || null,
    folderUrl: invitation.driveStorage?.folderUrl || `${GOOGLE_DRIVE_ROOT_FOLDER_URL}`,
    lastSyncedAt: new Date().toISOString(),
    isRenamed: Boolean(oldFolderName && oldFolderName !== expectedFolderName),
    status: "synced"
  };

  // 1. If live Google Apps Script Webhook is configured, perform live API sync with Google Drive
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "syncFolder",
          rootFolderId: GOOGLE_DRIVE_ROOT_FOLDER_ID,
          folderName: expectedFolderName,
          folderId: invitation.driveStorage?.folderId || null,
          invitationId: invitation.id,
          oldFolderName: oldFolderName || null
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === "success" && result.folderId) {
          folderState.folderId = result.folderId;
          folderState.folderUrl = result.folderUrl || `https://drive.google.com/drive/folders/${result.folderId}`;
          folderState.status = "live_synced";
          return folderState;
        }
      }
    } catch (err) {
      console.warn("Google Drive webhook sync warning:", err);
      folderState.status = "local_synced";
    }
  }

  // 2. If OAuth token is available, create or rename folder directly in Google Drive!
  if (authToken) {
    try {
      // If folder already has folderId and name changed, rename it
      if (folderState.folderId && oldFolderName && oldFolderName !== expectedFolderName) {
        try {
          const renameRes = await fetch(`https://www.googleapis.com/drive/v3/files/${folderState.folderId}?supportsAllDrives=true`, {
            method: "PATCH",
            headers: {
              "Authorization": `Bearer ${authToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: expectedFolderName })
          });
          if (renameRes.ok) {
            folderState.folderName = expectedFolderName;
            folderState.status = "live_synced";
            return folderState;
          }
        } catch (e) {}
      }

      // If folder does not have folderId, create it in ROOT_FOLDER_ID
      if (!folderState.folderId) {
        const folder = await getOrCreateDriveFolderOAuth(expectedFolderName, GOOGLE_DRIVE_ROOT_FOLDER_ID, authToken);
        if (folder && folder.id) {
          folderState.folderId = folder.id;
          folderState.folderUrl = folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`;
          folderState.status = "live_synced";
          return folderState;
        }
      }
    } catch (oauthErr) {
      console.warn("Google Drive OAuth sync error:", oauthErr);
    }
  }

  // 3. If Google Drive API Key is active, check if folder already exists by name in Google Drive!
  if (!folderState.folderId && GOOGLE_DRIVE_API_KEY) {
    try {
      const remoteFolder = await findDriveFolderByName(expectedFolderName);
      if (remoteFolder) {
        folderState.folderId = remoteFolder.id;
        folderState.folderUrl = remoteFolder.webViewLink || `https://drive.google.com/drive/folders/${remoteFolder.id}`;
        folderState.status = "live_synced";
      }
    } catch (e) {
      console.warn("Direct Drive API lookup warning:", e);
    }
  }

  return folderState;
}

/**
 * Ensures an invitation has an active Google Drive folder created and linked.
 * If not yet created on Google Drive, creates it using OAuth (prompting if needed) or Webhook.
 */
export async function ensureInvitationDriveFolder(invitation, customFolderName = null, promptAuthIfNeeded = false) {
  if (!invitation) return null;
  const config = invitation.config || {};
  const folderName = customFolderName || invitation.driveStorage?.folderName || formatDriveFolderName(config, invitation.title);

  // If already linked, return it
  if (invitation.driveStorage?.folderId) {
    return {
      folderId: invitation.driveStorage.folderId,
      folderName: invitation.driveStorage.folderName || folderName,
      folderUrl: invitation.driveStorage.folderUrl || `https://drive.google.com/drive/folders/${invitation.driveStorage.folderId}`,
      status: "live_synced"
    };
  }

  // 1. Try syncDriveFolder with existing stored credentials
  let res = await syncDriveFolder({ invitation, customFolderName: folderName });
  if (res && res.folderId) {
    return res;
  }

  // 2. If promptAuthIfNeeded is requested and no token, prompt user to connect Google Drive
  if (promptAuthIfNeeded) {
    try {
      const token = await requestGoogleDriveAuth();
      if (token) {
        res = await syncDriveFolder({ invitation, customFolderName: folderName, token });
        if (res && res.folderId) return res;
      }
    } catch (e) {
      console.warn("User cancelled or failed Google Drive auth:", e);
    }
  }

  return res;
}

/**
 * Upload an invitation file to Google Drive Cloud Storage & Firebase Storage
 * Real-time sync guarantee: returns immediate high-speed CDN streaming URL for invitations
 */
export async function uploadInvitationFileToDrive({
  file,
  invitation,
  category = "photo",
  customFileName = null,
  previousUrl = null
}) {
  if (!file) throw new Error("No file provided");
  const config = invitation?.config || {};
  const folderName = formatDriveFolderName(config, invitation?.title);
  const fileExt = file.name ? file.name.split(".").pop() : "jpg";
  const rawBaseName = customFileName || (file.name ? file.name.replace(/\.[^/.]+$/, "") : `${category}_${Date.now()}`);
  const safeBaseName = rawBaseName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `${safeBaseName}.${fileExt}`;
  
  let cloudUrl = "";
  let driveFileId = null;
  let driveDirectUrl = null;
  const webhookUrl = getDriveWebhookUrl();

  // Pre-process high-definition image data so images are immediately displayable in any browser without Google login cookies
  let localHdDataUrl = null;
  const isImage = Boolean(file.type && file.type.startsWith("image/"));
  if (isImage) {
    try {
      localHdDataUrl = await compressImage(file, 2560, 2560, 0.96);
    } catch (e) {
      localHdDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
      });
    }
  }

  // Extract previous file ID to remove old version and save Drive storage
  const previousFileId = extractDriveFileId(previousUrl || config[category]);

  // 1. If Google Drive OAuth token is already authorized, upload directly to Google Drive!
  const oauthToken = getStoredOAuthToken();

  if (oauthToken) {
    try {
      let targetFolderId = invitation?.driveStorage?.folderId;
      if (!targetFolderId) {
        const found = await findDriveFolderByName(folderName);
        if (found) {
          targetFolderId = found.id;
        } else {
          const f = await getOrCreateDriveFolderOAuth(folderName, GOOGLE_DRIVE_ROOT_FOLDER_ID, oauthToken);
          targetFolderId = f.id;
        }
      }

      // Check if a file with the same name already exists in target folder to replace it
      let existingSameNameIds = [];
      try {
        const safeNameQuery = fileName.replace(/'/g, "\\'");
        const qSame = `'${targetFolderId}' in parents and name = '${safeNameQuery}' and trashed = false`;
        const searchSameRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(qSame)}&fields=files(id,name)&supportsAllDrives=true`, {
          headers: { "Authorization": `Bearer ${oauthToken}` }
        });
        if (searchSameRes.ok) {
          const sData = await searchSameRes.json();
          existingSameNameIds = (sData.files || []).map(f => f.id);
        }
      } catch (e) {}

      const isVideo = Boolean(
        (file.type && (
          file.type.startsWith("video/") || 
          file.type.includes("mp4") || 
          file.type.includes("webm") || 
          file.type.includes("quicktime")
        )) || /\.(mp4|webm|mov|m4v|mkv|ogv)$/i.test(file.name || "")
      );

      const isMedia = Boolean(
        isVideo || (
          file.type && (
            file.type.startsWith("audio/") || 
            file.type.includes("mpeg") || 
            file.type.includes("mp3") ||
            file.type.includes("wav") ||
            file.type.includes("ogg")
          )
        ) || /\.(mp3|wav|ogg|m4a|aac)$/i.test(file.name || "")
      );

      const uploaded = await uploadFileToDriveOAuth({
        blob: file,
        fileName: fileName,
        mimeType: file.type || (isVideo ? "video/mp4" : isMedia ? "audio/mpeg" : "image/jpeg"),
        folderId: targetFolderId,
        token: oauthToken
      });

      if (uploaded && uploaded.directUrl) {
        // Automatically delete previous file from Google Drive to free storage space!
        if (previousFileId && previousFileId !== uploaded.fileId) {
          deleteDriveFileOAuth(previousFileId, oauthToken).catch(() => {});
        }

        // Replace older files with the same name from Google Drive folder
        for (const sameId of existingSameNameIds) {
          if (sameId !== uploaded.fileId && sameId !== previousFileId) {
            deleteDriveFileOAuth(sameId, oauthToken).catch(() => {});
          }
        }

        const streamUrl = isVideo
          ? `https://drive.google.com/file/d/${uploaded.fileId}/preview#type=video`
          : (isMedia
            ? `https://drive.google.com/uc?export=download&id=${uploaded.fileId}`
            : (uploaded.directUrl || localHdDataUrl));

        // Background sync to Firebase Storage for ultra-fast CDN loading
        if (storage) {
          const storagePath = `drive_storage/${folderName}/${fileName}`;
          const fileStorageRef = storageRef(storage, storagePath);
          uploadBytes(fileStorageRef, file, {
            contentType: file.type || (isVideo ? "video/mp4" : isMedia ? "audio/mpeg" : "image/jpeg")
          }).catch(() => {});
        }

        return {
          success: true,
          url: streamUrl,
          driveDirectUrl: uploaded.directUrl,
          driveFileId: uploaded.fileId,
          fileName: uploaded.fileName,
          folderName,
          folderId: targetFolderId,
          folderUrl: `https://drive.google.com/drive/folders/${targetFolderId}`
        };
      }
    } catch (oauthErr) {
      console.warn("Direct Google Drive OAuth upload failed, falling back to local:", oauthErr);
    }
  }

  // 2. If Google Apps Script Webhook is active, upload directly into the specific Drive folder!
  if (webhookUrl) {
    try {
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const isVideo = Boolean(
        (file.type && (
          file.type.startsWith("video/") || 
          file.type.includes("mp4") || 
          file.type.includes("webm") || 
          file.type.includes("quicktime")
        )) || /\.(mp4|webm|mov|m4v|mkv|ogv)$/i.test(file.name || "")
      );

      const isAudio = Boolean(
        file.type && (
          file.type.startsWith("audio/") || 
          file.type.includes("mpeg") || 
          file.type.includes("mp3") ||
          file.type.includes("wav") ||
          file.type.includes("ogg")
        ) || /\.(mp3|wav|ogg|m4a|aac)$/i.test(file.name || "")
      );

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "uploadFile",
          rootFolderId: GOOGLE_DRIVE_ROOT_FOLDER_ID,
          folderId: invitation?.driveStorage?.folderId || null,
          folderName: folderName,
          fileName: fileName,
          previousFileId: previousFileId || null,
          mimeType: file.type || (isVideo ? "video/mp4" : isAudio ? "audio/mpeg" : "image/jpeg"),
          base64Data: base64Data
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === "success") {
          driveFileId = result.fileId;
          driveDirectUrl = isVideo
            ? `https://drive.google.com/file/d/${result.fileId}/preview#type=video`
            : (isAudio 
              ? `https://drive.google.com/uc?export=download&id=${result.fileId}`
              : (result.fileUrl ? (result.fileUrl.includes("=") ? result.fileUrl : `${result.fileUrl}=s0`) : `https://lh3.googleusercontent.com/d/${result.fileId}=s0`));
          cloudUrl = (isVideo || isAudio) ? driveDirectUrl : (driveDirectUrl || localHdDataUrl);
          return {
            success: true,
            url: cloudUrl,
            driveDirectUrl,
            driveFileId,
            fileName,
            folderName,
            folderId: result.folderId || invitation?.driveStorage?.folderId,
            folderUrl: result.folderUrl || invitation?.driveStorage?.folderUrl || GOOGLE_DRIVE_ROOT_FOLDER_URL
          };
        }
      }
    } catch (err) {
      console.warn("Direct Google Drive upload webhook encountered error:", err);
    }
  }

  // 3. High-speed Realtime Storage via Firebase Storage
  if (storage && !cloudUrl) {
    try {
      const isVideo = Boolean(
        (file.type && (
          file.type.startsWith("video/") || 
          file.type.includes("mp4") || 
          file.type.includes("webm") || 
          file.type.includes("quicktime")
        )) || /\.(mp4|webm|mov|m4v|mkv|ogv)$/i.test(file.name || "")
      );
      const isAudio = Boolean(
        file.type && (
          file.type.startsWith("audio/") || 
          file.type.includes("mpeg") || 
          file.type.includes("mp3") ||
          file.type.includes("wav") ||
          file.type.includes("ogg")
        ) || /\.(mp3|wav|ogg|m4a|aac)$/i.test(file.name || "")
      );

      const storagePath = `drive_storage/${folderName}/${fileName}`;
      const fileStorageRef = storageRef(storage, storagePath);
      await uploadBytes(fileStorageRef, file, {
        contentType: file.type || (isVideo ? "video/mp4" : isAudio ? "audio/mpeg" : "image/jpeg"),
        customMetadata: {
          invitationId: invitation?.id || "",
          folderName: folderName,
          category: category
        }
      });
      const firebaseUrl = await getDownloadURL(fileStorageRef);
      if (firebaseUrl) {
        cloudUrl = isVideo ? `${firebaseUrl}#type=video` : firebaseUrl;
      }
    } catch (firebaseErr) {
      console.warn("Firebase Storage upload in uploadInvitationFileToDrive:", firebaseErr);
    }
  }

  // 4. Safe fallback: For images use compressed data, for videos use ObjectURL to prevent localStorage QuotaExceededError
  if (!cloudUrl) {
    const isVideo = Boolean(
      (file.type && (
        file.type.startsWith("video/") || 
        file.type.includes("mp4") || 
        file.type.includes("webm") || 
        file.type.includes("quicktime")
      )) || /\.(mp4|webm|mov|m4v|mkv|ogv)$/i.test(file.name || "")
    );

    if (isVideo) {
      try {
        cloudUrl = URL.createObjectURL(file);
      } catch (e) {}
    } else if (localHdDataUrl) {
      cloudUrl = localHdDataUrl;
    } else if (file.type?.startsWith("image/")) {
      try {
        cloudUrl = await compressImage(file, 2560, 2560, 0.96);
      } catch (e) {}
    }
  }

  return {
    success: Boolean(cloudUrl),
    url: cloudUrl,
    driveDirectUrl: driveDirectUrl || cloudUrl,
    driveFileId,
    fileName,
    folderName,
    folderUrl: invitation?.driveStorage?.folderUrl || GOOGLE_DRIVE_ROOT_FOLDER_URL
  };
}

/**
 * Convert base64 data URL to Blob with accurate mimeType and extension
 */
export function base64ToBlob(base64Data) {
  if (!base64Data || typeof base64Data !== "string") return null;
  const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const mimeType = match[1] || "image/jpeg";
  const base64Str = match[2];
  
  try {
    const byteChars = atob(base64Str);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    let ext = "jpg";
    if (mimeType.includes("png")) ext = "png";
    else if (mimeType.includes("webp")) ext = "webp";
    else if (mimeType.includes("svg")) ext = "svg";
    else if (mimeType.includes("gif")) ext = "gif";
    else if (mimeType.includes("audio") || mimeType.includes("mpeg") || mimeType.includes("mp3")) ext = "mp3";
    
    return { blob, mimeType, ext, base64Str };
  } catch (err) {
    console.warn("Failed to convert base64 to Blob:", err);
    return null;
  }
}

/**
 * Upload base64 media directly to the invitation's Google Drive folder
 */
export async function uploadBase64ToDriveStorage({
  base64Data,
  invitation,
  category = "media",
  customFileName = null
}) {
  const converted = base64ToBlob(base64Data);
  if (!converted) {
    return { success: false, url: base64Data, freedBytes: 0 };
  }

  const config = invitation?.config || {};
  const folderName = formatDriveFolderName(config, invitation?.title);
  const timestamp = Date.now();
  const safeBaseName = (customFileName || `${category}_${timestamp}`).replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `${safeBaseName}.${converted.ext}`;

  let cloudUrl = "";
  let driveFileId = null;
  const webhookUrl = getDriveWebhookUrl();

  // 1. Google Drive direct upload via OAuth into the invitation's folder
  const oauthToken = getStoredOAuthToken();
  if (oauthToken && !cloudUrl) {
    try {
      let targetFolderId = invitation?.driveStorage?.folderId;
      if (!targetFolderId) {
        const found = await findDriveFolderByName(folderName);
        if (found) targetFolderId = found.id;
      }
      if (!targetFolderId) {
        const created = await getOrCreateDriveFolderOAuth(folderName, GOOGLE_DRIVE_ROOT_FOLDER_ID, oauthToken);
        targetFolderId = created.id;
      }
      const uploaded = await uploadFileToDriveOAuth({
        blob: converted.blob,
        fileName: fileName,
        mimeType: converted.mimeType,
        folderId: targetFolderId,
        token: oauthToken
      });
      if (uploaded && uploaded.directUrl) {
        driveFileId = uploaded.fileId;
        const isMedia = Boolean(converted.mimeType && (converted.mimeType.startsWith("audio/") || converted.mimeType.startsWith("video/") || converted.mimeType.includes("mpeg") || converted.mimeType.includes("mp3")));
        cloudUrl = isMedia
          ? `https://drive.google.com/uc?export=download&id=${uploaded.fileId}`
          : (uploaded.directUrl ? (uploaded.directUrl.includes("=") ? uploaded.directUrl : `${uploaded.directUrl}=s0`) : `https://lh3.googleusercontent.com/d/${uploaded.fileId}=s0`);
      }
    } catch (oauthErr) {
      console.warn("OAuth background migration upload warning:", oauthErr);
    }
  }

  // 2. Google Drive direct upload via Webhook into the invitation's folder
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "uploadFile",
          rootFolderId: GOOGLE_DRIVE_ROOT_FOLDER_ID,
          folderId: invitation?.driveStorage?.folderId || null,
          folderName: folderName,
          fileName: fileName,
          mimeType: converted.mimeType,
          base64Data: converted.base64Str
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === "success") {
          driveFileId = result.fileId;
          cloudUrl = result.fileUrl ? (result.fileUrl.includes("=") ? result.fileUrl : `${result.fileUrl}=s0`) : `https://lh3.googleusercontent.com/d/${result.fileId}=s0`;
        }
      }
    } catch (err) {
      console.warn("Google Drive upload webhook warning:", err);
    }
  }

  // 2. High-speed Realtime Storage (Firebase Storage synchronized in drive_storage/{folderName}/{fileName})
  if (!cloudUrl && storage) {
    try {
      const storagePath = `drive_storage/${folderName}/${fileName}`;
      const fileStorageRef = storageRef(storage, storagePath);
      await uploadBytes(fileStorageRef, converted.blob, {
        contentType: converted.mimeType,
        customMetadata: {
          invitationId: invitation?.id || "",
          folderName: folderName,
          driveRootFolderId: GOOGLE_DRIVE_ROOT_FOLDER_ID,
          category: category
        }
      });
      cloudUrl = await getDownloadURL(fileStorageRef);
    } catch (firebaseErr) {
      console.warn("Firebase Storage upload warning:", firebaseErr);
    }
  }

  return {
    success: Boolean(cloudUrl),
    url: cloudUrl || base64Data,
    driveFileId,
    fileName,
    folderName,
    freedBytes: cloudUrl ? base64Data.length : 0
  };
}

/**
 * Scan database to detect all base64 images that are filling up Firebase Realtime Database
 */
export function scanDatabaseForBase64Media(db) {
  if (!db) return { totalItems: 0, totalBytes: 0, items: [] };
  const items = [];
  let totalBytes = 0;

  const MEDIA_KEYS = [
    "heroImage", "storyImage", "scratchImage",
    "envelopeWaxSealImg", "envelopeSymbolImg", "envelopeBgImage",
    "customClipartUrl", "borderFrameImg",
    "galleryImage1", "galleryImage2", "galleryImage3", "galleryImage4", "galleryImage5",
    "galleryImage6", "galleryImage7", "galleryImage8", "galleryImage9", "galleryImage10",
    "startingMusicUrl", "musicUrl"
  ];

  // 1. Invitations (Paid marked invitations are untouched)
  (db.invitations || []).forEach(inv => {
    if (inv.isPaid) return; // UNTOUCHED
    const cfg = inv.config || {};
    const folderName = formatDriveFolderName(cfg, inv.title);
    MEDIA_KEYS.forEach(key => {
      const val = cfg[key];
      if (typeof val === "string" && val.startsWith("data:")) {
        totalBytes += val.length;
        items.push({
          targetType: "invitation",
          targetId: inv.id,
          title: inv.title || "Wedding Invitation",
          folderName: folderName,
          key: key,
          size: val.length,
          data: val
        });
      }
    });
  });

  // 2. Presets / Themes
  (db.presets || []).forEach(preset => {
    const cfg = preset.config || {};
    const folderName = `${preset.title || "Theme"} (Theme Preset)`;
    MEDIA_KEYS.forEach(key => {
      const val = cfg[key];
      if (typeof val === "string" && val.startsWith("data:")) {
        totalBytes += val.length;
        items.push({
          targetType: "preset",
          targetId: preset.id,
          title: preset.title || "Theme Preset",
          folderName: folderName,
          key: key,
          size: val.length,
          data: val
        });
      }
    });
  });

  // 3. Customer Orders
  (db.orders || []).forEach(order => {
    const details = order.details || {};
    const folderName = `${details.brideName || 'Bride'} & ${details.groomName || 'Groom'} (${details.venueName || details.venueAddress || 'Wedding Order'})`;
    if (Array.isArray(details.photos)) {
      details.photos.forEach((photo, idx) => {
        if (typeof photo === "string" && photo.startsWith("data:")) {
          totalBytes += photo.length;
          items.push({
            targetType: "order_photo",
            targetId: order.id,
            title: `Order ${order.id} Photo ${idx + 1}`,
            folderName: folderName,
            key: `photos[${idx}]`,
            index: idx,
            size: photo.length,
            data: photo
          });
        }
      });
    }
  });

  return {
    totalItems: items.length,
    totalBytes: totalBytes,
    items: items
  };
}

/**
 * Transfer all base64 images from database to Google Drive and update Firebase
 */
export async function transferAllDatabaseImagesToDrive({ getDb, saveDb, onProgress }) {
  const db = getDb();
  const scan = scanDatabaseForBase64Media(db);

  if (scan.totalItems === 0) {
    if (onProgress) onProgress({ current: 0, total: 0, message: "No base64 images found in database. All images are already cleanly synced from cloud storage!", percent: 100 });
    return { success: true, migratedCount: 0, bytesFreed: 0 };
  }

  let migratedCount = 0;
  let bytesFreed = 0;
  const errors = [];

  for (let i = 0; i < scan.items.length; i++) {
    const item = scan.items[i];
    if (onProgress) {
      const pct = Math.round(((i + 1) / scan.items.length) * 100);
      onProgress({
        current: i + 1,
        total: scan.items.length,
        message: `Transferring ${item.key} for "${item.folderName}" to Google Drive...`,
        percent: pct
      });
    }

    try {
      if (item.targetType === "invitation") {
        const inv = (db.invitations || []).find(inv => inv.id === item.targetId);
        if (inv && inv.config && inv.config[item.key]) {
          const res = await uploadBase64ToDriveStorage({
            base64Data: inv.config[item.key],
            invitation: inv,
            category: item.key,
            customFileName: `${item.key}_drive`
          });
          if (res.success && res.url.startsWith("http")) {
            inv.config[item.key] = res.url;
            bytesFreed += res.freedBytes;
            migratedCount++;
          }
        }
      } else if (item.targetType === "preset") {
        const preset = (db.presets || []).find(p => p.id === item.targetId);
        if (preset && preset.config && preset.config[item.key]) {
          const res = await uploadBase64ToDriveStorage({
            base64Data: preset.config[item.key],
            invitation: { config: preset.config, title: preset.title },
            category: item.key,
            customFileName: `${item.key}_drive`
          });
          if (res.success && res.url.startsWith("http")) {
            preset.config[item.key] = res.url;
            bytesFreed += res.freedBytes;
            migratedCount++;
          }
        }
      } else if (item.targetType === "order_photo") {
        const order = (db.orders || []).find(o => o.id === item.targetId);
        if (order && order.details && Array.isArray(order.details.photos)) {
          const rawBase64 = order.details.photos[item.index];
          if (rawBase64) {
            const res = await uploadBase64ToDriveStorage({
              base64Data: rawBase64,
              invitation: { config: order.details, title: `Order ${order.id}` },
              category: `order_photo_${item.index + 1}`
            });
            if (res.success && res.url.startsWith("http")) {
              order.details.photos[item.index] = res.url;
              if (item.index === 0) order.details.photoUrl = res.url;
              bytesFreed += res.freedBytes;
              migratedCount++;
            }
          }
        }
      }
    } catch (err) {
      console.error(`Error transferring ${item.key} for ${item.title}:`, err);
      errors.push({ item, error: err.message });
    }
  }

  // Save the lightweight database back to Firebase Realtime Database and LocalStorage!
  db.lastDriveMigration = {
    migratedAt: new Date().toISOString(),
    migratedCount: migratedCount,
    bytesFreed: bytesFreed
  };
  saveDb(db);
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new Event("db_synced"));
    window.dispatchEvent(new CustomEvent("drive_images_migrated", { detail: { migratedCount, bytesFreed } }));
  }

  if (onProgress) {
    onProgress({
      current: scan.items.length,
      total: scan.items.length,
      message: `Complete! Successfully transferred ${migratedCount} image(s) to Google Drive. Freed ${(bytesFreed / (1024 * 1024)).toFixed(2)} MB in Firebase!`,
      percent: 100
    });
  }

  return {
    success: true,
    migratedCount,
    bytesFreed,
    errors
  };
}

/**
 * Ready-to-deploy Google Apps Script Code
 * Allows 1-click deployment to script.google.com for complete automated native Google Drive control
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `
/**
 * DS Envite - Google Drive Cloud Storage Web App
 * Automatically creates & renames folders named "{Bride} & {Groom} ({Location})"
 * and saves uploaded invitation files directly inside the Drive folder.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Drive -> New -> More -> Google Apps Script (or visit script.google.com)
 * 2. Paste this entire code into Code.gs
 * 3. Click "Deploy" -> "New deployment" -> Select "Web app"
 * 4. Execute as: "Me" | Who has access: "Anyone"
 * 5. Click Deploy and copy the Web App URL (ends with /exec)
 * 6. Paste the Web App URL into your DS Envite .env or Admin Settings!
 */

var ROOT_FOLDER_ID = "${GOOGLE_DRIVE_ROOT_FOLDER_ID}";

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var root = DriveApp.getFolderById(contents.rootFolderId || ROOT_FOLDER_ID);
    
    // ACTION 1: Create or automatically rename folder
    if (action === "syncFolder") {
      var folderName = contents.folderName;
      var folder;
      
      if (contents.folderId) {
        try {
          folder = DriveApp.getFolderById(contents.folderId);
          if (folder.getName() !== folderName) {
            folder.setName(folderName);
          }
        } catch(err) {
          folder = getOrCreateFolderByName(root, folderName);
        }
      } else {
        folder = getOrCreateFolderByName(root, folderName);
      }
      
      // Ensure anyone with link can view files
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      return responseJSON({
        status: "success",
        folderId: folder.getId(),
        folderName: folder.getName(),
        folderUrl: folder.getUrl()
      });
    }
    
    // ACTION 2: Upload file directly inside the invitation folder
    if (action === "uploadFile") {
      var targetFolder;
      if (contents.folderId) {
        try {
          targetFolder = DriveApp.getFolderById(contents.folderId);
        } catch(e) {}
      }
      if (!targetFolder && contents.folderName) {
        targetFolder = getOrCreateFolderByName(root, contents.folderName);
      }
      if (!targetFolder) {
        targetFolder = root;
      }
      
      var base64Str = contents.base64Data.indexOf(",") > -1 
        ? contents.base64Data.split(",")[1] 
        : contents.base64Data;
        
      var decodedBytes = Utilities.base64Decode(base64Str);
      var blob = Utilities.newBlob(decodedBytes, contents.mimeType || "image/jpeg", contents.fileName || "photo.jpg");
      var file = targetFolder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      // High-speed direct image preview URL
      var directUrl = "https://lh3.googleusercontent.com/d/" + file.getId();
      
      return responseJSON({
        status: "success",
        fileId: file.getId(),
        fileUrl: directUrl,
        driveViewUrl: file.getUrl()
      });
    }
    
    // ACTION 3: Move folder to trash / delete folder
    if (action === "deleteFolder") {
      var targetFolder = null;
      if (contents.folderId) {
        try {
          targetFolder = DriveApp.getFolderById(contents.folderId);
        } catch(e) {}
      }
      if (!targetFolder && contents.folderName) {
        var folders = root.getFoldersByName(contents.folderName);
        if (folders.hasNext()) targetFolder = folders.next();
      }
      if (targetFolder) {
        targetFolder.setTrashed(true);
        return responseJSON({ status: "success", message: "Folder moved to trash" });
      }
      return responseJSON({ status: "notFound", message: "Folder not found" });
    }

    // ACTION 4: Delete file
    if (action === "deleteFile") {
      if (contents.fileId) {
        try {
          var targetFile = DriveApp.getFileById(contents.fileId);
          targetFile.setTrashed(true);
          return responseJSON({ status: "success", message: "File moved to trash" });
        } catch(e) {}
      }
      return responseJSON({ status: "notFound", message: "File not found" });
    }

    return responseJSON({ status: "error", message: "Unknown action" });
  } catch (error) {
    return responseJSON({ status: "error", message: error.toString() });
  }
}

function getOrCreateFolderByName(parentFolder, name) {
  var folders = parentFolder.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(name);
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput("DS Envite Google Drive Cloud Storage Webhook Active! Root: " + ROOT_FOLDER_ID);
}
`;
