import fs from 'fs';

const filePath = 'Frontend/src/components/AdminSidebar.jsx';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// 1. Update video thumbnail preview in COVER DESIGN
const targetVidPreview = `                      {isVideoUrl(config.heroImage) ? (
                        extractDriveFileId(config.heroImage) ? (
                          <iframe 
                            src={\`https://drive.google.com/file/d/\${extractDriveFileId(config.heroImage)}/preview\`} 
                            className="w-full h-full border-0 pointer-events-none scale-125" 
                          />
                        ) : (
                          <video 
                            src={formatDriveDirectUrl(config.heroImage, "video")} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover" 
                          />
                        )
                      ) : (`;

const replVidPreview = `                      {isVideoUrl(config.heroImage) ? (
                        extractDriveFileId(config.heroImage) ? (
                          <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                            <iframe 
                              src={\`https://drive.google.com/file/d/\${extractDriveFileId(config.heroImage)}/preview\`} 
                              className="w-full h-full border-0 pointer-events-none scale-125" 
                            />
                            <div className="absolute inset-0 bg-transparent" />
                          </div>
                        ) : (
                          <video 
                            key={config.heroImage}
                            src={formatDriveDirectUrl(config.heroImage, "video")} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover bg-black" 
                          />
                        )
                      ) : (`;

if (content.includes(targetVidPreview)) {
  content = content.replace(targetVidPreview, replVidPreview);
  console.log('REPLACED_VID_PREVIEW_SIDEBAR');
} else {
  console.log('VID_PREVIEW_TARGET_NOT_FOUND');
}

fs.writeFileSync(filePath, content, 'utf8');

