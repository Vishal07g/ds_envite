const API_KEY = 'AIzaSyAhL9djLkD2-aZQ6YFIrQ8TOGJRwTCxt20';
const ROOT = '1F06tPPDFApqdxQL4SnqwN8b48CD7McHP';

async function testUpload() {
  console.log('Testing upload using Google Drive API key...');
  
  // Step 1: Try creating a folder
  const folderMetadata = {
    name: 'Suman & Vishal (Snehalata Marriage Hall, Neamatpur, WB)',
    mimeType: 'application/vnd.google-apps.folder',
    parents: [ROOT]
  };

  const res1 = await fetch(`https://www.googleapis.com/drive/v3/files?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(folderMetadata)
  });

  console.log('Folder creation response status:', res1.status, res1.statusText);
  const data1 = await res1.json();
  console.log('Response body:', JSON.stringify(data1, null, 2));
}

testUpload().catch(console.error);
