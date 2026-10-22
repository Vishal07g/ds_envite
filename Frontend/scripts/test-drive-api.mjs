const API_KEY = process.env.VITE_GOOGLE_DRIVE_API_KEY || '';
const ROOT_FOLDER_ID = '1F06tPPDFApqdxQL4SnqwN8b48CD7McHP';

async function testApiKey() {
  const url = `https://www.googleapis.com/drive/v3/files/${ROOT_FOLDER_ID}?key=${API_KEY}&fields=id,name,mimeType`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('API Status:', res.status, res.statusText);
  console.log('Response:', JSON.stringify(data, null, 2));
}

testApiKey().catch(console.error);
