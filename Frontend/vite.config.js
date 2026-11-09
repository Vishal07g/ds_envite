import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { uploadFileToDrive, checkRootFolderPermission } from './server/driveService.js'

function googleDriveDevServerPlugin() {
  return {
    name: 'google-drive-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        // 1. Health check & folder permission status
        if (url === '/api/drive-status' && req.method === 'GET') {
          try {
            const status = await checkRootFolderPermission();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(status));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: err.message }));
          }
          return;
        }

        // 2. Direct upload to Google Drive via Service Account
        if (url === '/api/drive-upload' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const { fileName, mimeType, base64Data, folderName, subfolder } = data;

              if (!base64Data) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'No base64Data provided' }));
                return;
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

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err) {
              console.error('Error in /api/drive-upload:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), googleDriveDevServerPlugin()],
})
