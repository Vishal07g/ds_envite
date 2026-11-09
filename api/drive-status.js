import { checkRootFolderPermission } from '../Frontend/server/driveService.js';

export default async function handler(req, res) {
  try {
    const status = await checkRootFolderPermission();
    return res.status(200).json(status);
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

