import fs from 'fs';
import crypto from 'crypto';

const key = JSON.parse(fs.readFileSync('d:/Website/ds_envite/Frontend/scripts/sa-key.json', 'utf8'));

function createJWT(saKey, scopes) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: saKey.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const signInput = `${encode(header)}.${encode(claimSet)}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signInput);
  const signature = sign.sign(saKey.private_key, 'base64url');
  return `${signInput}.${signature}`;
}

async function getAccessToken() {
  const jwt = createJWT(key, ['https://www.googleapis.com/auth/drive']);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });
  const data = await res.json();
  return data.access_token;
}

export async function checkDrivePermission() {
  const saToken = await getAccessToken();
  const folderId = '1_pdrNFiXcOymZQEby52O3FbvImCU_SW8';
  const checkRes = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,capabilities`, {
    headers: { 'Authorization': `Bearer ${saToken}` }
  });
  if (!checkRes.ok) return { ok: false, error: await checkRes.text() };
  const data = await checkRes.json();
  return {
    ok: true,
    name: data.name,
    canAddChildren: data.capabilities?.canAddChildren,
    canEdit: data.capabilities?.canEdit
  };
}

const status = await checkDrivePermission();
console.log('Permission status:', JSON.stringify(status, null, 2));

