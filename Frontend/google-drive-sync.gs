/**
 * DS Envite - Google Drive Cloud Storage Web App
 * Automatically creates & renames folders named "{Bride} & {Groom} ({Location})"
 * and saves uploaded invitation files directly inside the Drive folder.
 * 
 * ROOT FOLDER:
 * https://drive.google.com/drive/folders/1_pdrNFiXcOymZQEby52O3FbvImCU_SW8?usp=sharing
 * 
 * SETUP INSTRUCTIONS (Takes ~1 minute):
 * 1. Open Google Drive -> New -> More -> Google Apps Script (or visit https://script.google.com)
 * 2. Paste this entire code into Code.gs
 * 3. Click "Deploy" -> "New deployment" -> Select type "Web app"
 * 4. Configure:
 *    - Description: "DS Envite Storage Webhook"
 *    - Execute as: "Me (your google account)"
 *    - Who has access: "Anyone"
 * 5. Click "Deploy", authorize permissions, and copy the Web App URL (ends with /exec)
 * 6. Add to your Frontend/.env:
 *    VITE_GOOGLE_DRIVE_WEBHOOK_URL=https://script.google.com/macros/s/XXXXX/exec
 */

var ROOT_FOLDER_ID = "1_pdrNFiXcOymZQEby52O3FbvImCU_SW8";

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
    
    // ACTION 3: Delete folder when invitation is deleted
    if (action === "deleteFolder") {
      var folderId = contents.folderId;
      if (folderId) {
        try {
          var targetFolder = DriveApp.getFolderById(folderId);
          targetFolder.setTrashed(true);
          return responseJSON({
            status: "success",
            message: "Folder moved to trash",
            folderId: folderId
          });
        } catch(err) {
          return responseJSON({ status: "error", message: err.toString() });
        }
      }
      return responseJSON({ status: "error", message: "Missing folderId" });
    }

    // ACTION 4: Delete file when asset is removed
    if (action === "deleteFile") {
      var fileId = contents.fileId;
      if (fileId) {
        try {
          var targetFile = DriveApp.getFileById(fileId);
          targetFile.setTrashed(true);
          return responseJSON({
            status: "success",
            message: "File moved to trash",
            fileId: fileId
          });
        } catch(err) {
          return responseJSON({ status: "error", message: err.toString() });
        }
      }
      return responseJSON({ status: "error", message: "Missing fileId" });
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
