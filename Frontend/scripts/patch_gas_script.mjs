import fs from 'fs';

const filePath = 'Frontend/src/utils/googleDriveStorage.js';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// Update Apps Script template to support subfolder hierarchy:
// folderName -> subfolder (images / videos / music / files) -> file
const oldUploadBlock = `    // ACTION 2: Upload file directly inside the invitation folder
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
    }`;

const newUploadBlock = `    // ACTION 2: Upload file directly inside the invitation folder & subfolder (images/videos/music/files)
    if (action === "uploadFile") {
      var invFolder;
      if (contents.folderId) {
        try {
          invFolder = DriveApp.getFolderById(contents.folderId);
        } catch(e) {}
      }
      if (!invFolder && contents.folderName) {
        var parentFolder = root;
        if (contents.categoryName) {
          parentFolder = getOrCreateFolderByName(root, contents.categoryName);
        }
        invFolder = getOrCreateFolderByName(parentFolder, contents.folderName);
      }
      if (!invFolder) {
        invFolder = root;
      }
      
      // Strict hierarchy: place into subfolder (images, videos, music, files)
      var targetFolder = invFolder;
      if (contents.subfolder) {
        targetFolder = getOrCreateFolderByName(invFolder, contents.subfolder);
      }
      
      var base64Str = contents.base64Data.indexOf(",") > -1 
        ? contents.base64Data.split(",")[1] 
        : contents.base64Data;
        
      var decodedBytes = Utilities.base64Decode(base64Str);
      var blob = Utilities.newBlob(decodedBytes, contents.mimeType || "image/jpeg", contents.fileName || "photo.jpg");
      var file = targetFolder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      var directUrl = "https://lh3.googleusercontent.com/d/" + file.getId();
      
      return responseJSON({
        status: "success",
        fileId: file.getId(),
        fileUrl: directUrl,
        driveViewUrl: file.getUrl(),
        folderId: invFolder.getId(),
        folderUrl: invFolder.getUrl(),
        subfolderId: targetFolder.getId()
      });
    }`;

if (content.includes(oldUploadBlock)) {
  content = content.replace(oldUploadBlock, newUploadBlock);
  console.log('REPLACED_APPS_SCRIPT_UPLOAD_BLOCK');
} else {
  console.log('APPS_SCRIPT_BLOCK_NOT_FOUND');
}

fs.writeFileSync(filePath, content, 'utf8');

