import { uploadFileToDrive, checkRootFolderPermission } from '../Frontend/server/driveService.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, mimeType, base64Data, folderName, subfolder } = req.body || {};

    if (!base64Data) {
      return res.status(400).json({ success: false, error: 'No base64Data provided' });
    }

    const base64Str = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    const buffer = Buffer.from(base64Str, 'base64');

    const result = await uploadFileToDrive({
      buffer,
      fileName: fileName || `file_${Date.now()}`,
      mimeType: mimeType || 'application/octet-stream',
      folderName: folderName || 'General',
      subfolder: subfolder || 'images'
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('Vercel API drive-upload error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

