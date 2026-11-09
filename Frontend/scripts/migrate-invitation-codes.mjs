// Migration Script: Assign unique 10-char codes to all invitations
// and initialize isolated /saas_data/invitation_codes in Firebase.

import { generateInvitationCode, isValidInvitationCode } from '../src/utils/invitationCode.js';

async function migrateCodes() {
  const url = 'https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data.json';
  const res = await fetch(url);
  const data = await res.json();
  if (!data) {
    console.error('Could not fetch saas_data');
    return;
  }

  const invs = Array.isArray(data.invitations) ? data.invitations : Object.values(data.invitations || {});
  if (!data.invitation_codes) data.invitation_codes = {};

  console.log(`Checking codes for ${invs.length} invitations...`);

  for (const inv of invs) {
    if (!inv.code || !isValidInvitationCode(inv.code)) {
      let candidate = generateInvitationCode(10);
      while (data.invitation_codes[candidate]) {
        candidate = generateInvitationCode(10);
      }
      inv.code = candidate;
      data.invitation_codes[candidate] = inv.id;
      console.log(`Assigned new code [${candidate}] to invitation "${inv.title}" (id: ${inv.id})`);
    } else {
      data.invitation_codes[inv.code] = inv.id;
      console.log(`Preserved existing code [${inv.code}] for invitation "${inv.title}"`);
    }
  }

  data.invitations = invs;

  const putRes = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (putRes.ok) {
    console.log('Successfully saved unique invitation codes to Firebase!');
  } else {
    console.error('Failed to update Firebase:', putRes.status, await putRes.text());
  }
}

migrateCodes().catch(console.error);

