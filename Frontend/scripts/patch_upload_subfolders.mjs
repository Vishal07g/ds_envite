import fs from 'fs';

const filePath = 'Frontend/src/utils/googleDriveStorage.js';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// 1. In uploadInvitationFileToDrive: Pass subfolder name
const targetWebhookCall = `        body: JSON.stringify({
          action: "uploadFile",
          rootFolderId: GOOGLE_DRIVE_ROOT_FOLDER_ID,
          folderId: invitation?.driveStorage?.folderId || null,
          folderName: folderName,
          categoryName: getCategoryFolderName(config, invitation),
          fileName: fileName,
          previousFileId: previousFileId || null,
          mimeType: file.type || (isVideo ? "video/mp4" : isAudio ? "audio/mpeg" : "image/jpeg"),
          base64Data: base64Data
        })`;

const replWebhookCall = `        body: JSON.stringify({
          action: "uploadFile",
          rootFolderId: GOOGLE_DRIVE_ROOT_FOLDER_ID,
          folderId: invitation?.driveStorage?.folderId || null,
          folderName: folderName,
          categoryName: getCategoryFolderName(config, invitation),
          subfolder: getMediaSubfolderName(category, file),
          fileName: fileName,
          previousFileId: previousFileId || null,
          mimeType: file.type || (isVideo ? "video/mp4" : isAudio ? "audio/mpeg" : "image/jpeg"),
          base64Data: base64Data
        })`;

if (content.includes(targetWebhookCall)) {
  content = content.replace(targetWebhookCall, replWebhookCall);
  console.log('REPLACED_WEBHOOK_CALL_SUBFOLDER');
} else {
  console.log('TARGET_WEBHOOK_CALL_NOT_FOUND');
}

// 2. In OAuth block: upload into subfolder
const targetOAuthUpload = `      const uploaded = await uploadFileToDriveOAuth({
        blob: file,
        fileName: fileName,
        mimeType: file.type || (isVideo ? "video/mp4" : isMedia ? "audio/mpeg" : "image/jpeg"),
        folderId: targetFolderId,
        token: oauthToken
      });`;

const replOAuthUpload = `      const subfolderName = getMediaSubfolderName(category, file);
      let uploadTargetFolderId = targetFolderId;
      try {
        const subfolder = await getOrCreateDriveFolderOAuth(subfolderName, targetFolderId, oauthToken);
        if (subfolder && subfolder.id) {
          uploadTargetFolderId = subfolder.id;
        }
      } catch (subErr) {
        console.warn("Could not create/find subfolder in Drive:", subErr);
      }

      const uploaded = await uploadFileToDriveOAuth({
        blob: file,
        fileName: fileName,
        mimeType: file.type || (isVideo ? "video/mp4" : isMedia ? "audio/mpeg" : "image/jpeg"),
        folderId: uploadTargetFolderId,
        token: oauthToken
      });`;

if (content.includes(targetOAuthUpload)) {
  content = content.replace(targetOAuthUpload, replOAuthUpload);
  console.log('REPLACED_OAUTH_UPLOAD_SUBFOLDER');
} else {
  console.log('TARGET_OAUTH_UPLOAD_NOT_FOUND');
}

fs.writeFileSync(filePath, content, 'utf8');

