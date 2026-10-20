import fs from 'fs';

async function restore() {
  const full = JSON.parse(fs.readFileSync('d:/Website/ds_envite/Frontend/scripts/suman_full.json', 'utf8'));

  // Suman & Vishal primary invitation
  const primarySuman = {
    ...full,
    id: "invite-1792299417819",
    customerId: "user-customer",
    title: "Suman & Vishal's Wedding Invitation",
    slug: "suman-vishal",
    customSlug: "suman-vishal",
    isCustomSlugManuallySet: true,
    isPaid: true,
    status: "published",
    shareText: "We are thrilled to invite you to our wedding celebration! View our digital invitation here: {url} - Suman & Vishal",
    config: {
      ...full.config,
      brideName: "Suman",
      groomName: "Vishal",
      weddingVenue: "Snehalata Marriage Hall",
      weddingAddress: "Neamatpur, WB",
      weddingDate: "2026-11-24T19:00",
      weddingMapUrl: "https://maps.app.goo.gl/8r1eTfdEMwWu2uS58",
      receptionVenue: "Delight Marriage Hall",
      receptionAddress: "Chinakuri Bazaar, WB",
      receptionDate: "2026-11-29",
      receptionMapUrl: "https://maps.app.goo.gl/dfYzXxKh276PELCd6"
    }
  };

  const res = await fetch('https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data.json');
  const db = await res.json();
  let invs = Array.isArray(db.invitations) ? db.invitations : Object.values(db.invitations || {});

  // Remove the corrupt/stub invitations that had Ananya & Aarav with Vishal's title
  invs = invs.filter(i => {
    if (i.id === "suman-vishal-1792299417819" && i.config?.brideName === "Ananya") return false;
    if (i.id === "invite-1792423053258" && i.config?.brideName === "Ananya") return false;
    if (i.id === "invite-1792299417819") return false; // We'll put our restored primary one in front
    return true;
  });

  // Place primary Suman & Vishal right at the top
  invs.unshift(primarySuman);

  // Update in Firebase
  const updateRes = await fetch('https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data/invitations.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invs)
  });

  console.log('Firebase update status:', updateRes.status);
  console.log('Primary Suman & Vishal invitation restored successfully!');
}

restore().catch(console.error);
