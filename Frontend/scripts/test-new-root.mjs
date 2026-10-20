const API_KEY = 'AIzaSyDQTB_jBNM85-QwmJtVSfxne1V4BmoOe6Y';
const NEW_ROOT = '1_pdrNFiXcOymZQEby52O3FbvImCU_SW8';

async function testNewRoot() {
  const url = `https://www.googleapis.com/drive/v3/files/${NEW_ROOT}?key=${API_KEY}&fields=id,name,mimeType,owners,capabilities`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('New Folder Status:', res.status, res.statusText);
  console.log('Folder Details:', JSON.stringify(data, null, 2));

  // Also query children of this new folder
  const childrenUrl = `https://www.googleapis.com/drive/v3/files?q='${NEW_ROOT}'+in+parents+and+trashed=false&key=${API_KEY}&fields=files(id,name,mimeType)`;
  const childrenRes = await fetch(childrenUrl);
  const childrenData = await childrenRes.json();
  console.log('Children count:', (childrenData.files || []).length);
  if (childrenData.files) {
    childrenData.files.forEach(f => console.log(`  - [${f.mimeType}] ${f.name} (${f.id})`));
  }
}

testNewRoot().catch(console.error);
