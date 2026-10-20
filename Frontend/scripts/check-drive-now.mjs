const API_KEY = 'AIzaSyAhL9djLkD2-aZQ6YFIrQ8TOGJRwTCxt20';
const ROOT = '1F06tPPDFApqdxQL4SnqwN8b48CD7McHP';

async function main() {
  const url = `https://www.googleapis.com/drive/v3/files?q='${ROOT}'+in+parents+and+trashed=false&key=${API_KEY}&fields=files(id,name,mimeType,webContentLink,webViewLink)`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('Root children count:', (data.files || []).length);
  for (const f of (data.files || [])) {
    console.log(`Found: [${f.mimeType}] ${f.name} (id: ${f.id})`);
    if (f.mimeType === 'application/vnd.google-apps.folder') {
      const subUrl = `https://www.googleapis.com/drive/v3/files?q='${f.id}'+in+parents+and+trashed=false&key=${API_KEY}&fields=files(id,name,mimeType,webContentLink,webViewLink)`;
      const subRes = await fetch(subUrl);
      const subData = await subRes.json();
      console.log(`  Inside "${f.name}": ${(subData.files || []).length} files`);
      for (const sf of (subData.files || [])) {
        console.log(`    - ${sf.name} (id: ${sf.id})`);
      }
    }
  }
}

main().catch(console.error);
