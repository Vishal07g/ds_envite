import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root folder ID from environment or default
export const ROOT_FOLDER_ID = process.env.VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID || '1_pdrNFiXcOymZQEby52O3FbvImCU_SW8';

function getServiceAccountKey() {
  // Check if env variable provides it
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    } catch (e) {}
  }
  // Otherwise check local sa-key.json
  const keyPaths = [
    path.resolve(__dirname, '../scripts/sa-key.json'),
    path.resolve(__dirname, 'sa-key.json')
  ];
  for (const kp of keyPaths) {
    if (fs.existsSync(kp)) {
      return JSON.parse(fs.readFileSync(kp, 'utf8'));
    }
  }
  return null;
}

function createJWT(saKey, scopes) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: saKey.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const signInput = `${encode(header)}.${encode(claimSet)}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signInput);
  const signature = sign.sign(saKey.private_key, 'base64url');

  return `${signInput}.${signature}`;
}

let cachedToken = null;
let tokenExpiresAt = 0;

export async function getServiceAccountToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }
  const key = getServiceAccountKey();
  if (!key) {
    throw new Error('Google Service Account key not found. Please ensure sa-key.json is present.');
  }

  const jwt = createJWT(key, ['https://www.googleapis.com/auth/drive']);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to exchange JWT for token: ${errText}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + ((data.expires_in || 3600) * 1000);
  return cachedToken;
}

export async function checkRootFolderPermission() {
  try {
    const token = await getServiceAccountToken();
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${ROOT_FOLDER_ID}?fields=id,name,capabilities`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      return { ok: false, error: await res.text() };
    }
    const data = await res.json();
    return {
      ok: true,
      name: data.name,
      canAddChildren: Boolean(data.capabilities?.canAddChildren),
      canEdit: Boolean(data.capabilities?.canEdit)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function getOrCreateFolder(folderName, parentId = ROOT_FOLDER_ID) {
  const token = await getServiceAccountToken();
  const safeName = folderName.replace(/'/g, "\\'");
  const q = `'${parentId}' in parents and name = '${safeName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,webViewLink)&supportsAllDrives=true`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0];
    }
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    })
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Drive folder "${folderName}": ${errText}`);
  }

  const created = await createRes.json();

  // Make folder publicly viewable
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${created.id}/permissions?supportsAllDrives=true`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    });
  } catch (e) {}

  return created;
}

export async function uploadFileToDrive({
  buffer,
  fileName,
  mimeType,
  folderName = 'General',
  subfolder = 'images'
}) {
  const token = await getServiceAccountToken();

  // 1. Ensure invitation hero folder exists inside ROOT_FOLDER_ID
  const heroFolder = await getOrCreateFolder(folderName, ROOT_FOLDER_ID);

  // 2. Ensure subfolder (images, videos, music, files) exists inside hero folder
  const targetSubfolder = await getOrCreateFolder(subfolder, heroFolder.id);

  // 3. Upload file via multipart upload to targetSubfolder
  const boundary = `-------314159265358979323846`;
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    parents: [targetSubfolder.id]
  };

  const metadataPart = Buffer.from(
    `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`
  );

  const mediaPartHeader = Buffer.from(
    `${delimiter}Content-Type: ${mimeType || 'application/octet-stream'}\r\n\r\n`
  );

  const closePart = Buffer.from(closeDelimiter);

  const multipartBody = Buffer.concat([
    metadataPart,
    mediaPartHeader,
    buffer,
    closePart
  ]);

  const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
      'Content-Length': String(multipartBody.length)
    },
    body: multipartBody
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Drive upload failed: ${errText}`);
  }

  const uploadedFile = await uploadRes.json();
  const fileId = uploadedFile.id;

  // 4. Ensure file has public read permission
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?supportsAllDrives=true`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    });
  } catch (e) {}

  const isVideo = mimeType?.startsWith('video/') || /\.(mp4|webm|mov|m4v|mkv)$/i.test(fileName);
  const isAudio = mimeType?.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac)$/i.test(fileName);

  let directUrl = '';
  if (isVideo) {
    directUrl = `https://drive.google.com/file/d/${fileId}/preview#type=video`;
  } else if (isAudio) {
    directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  } else {
    // High-speed CDN endpoint for images
    directUrl = `https://lh3.googleusercontent.com/d/${fileId}=w2560`;
  }

  return {
    success: true,
    fileId,
    directUrl,
    url: directUrl,
    fileName,
    subfolder,
    folderId: heroFolder.id,
    folderName: heroFolder.name,
    folderUrl: `https://drive.google.com/drive/folders/${heroFolder.id}`
  };
}

