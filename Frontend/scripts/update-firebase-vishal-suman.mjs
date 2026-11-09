async function updateFirebase() {
  const url = 'https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data.json';
  const res = await fetch(url);
  const data = await res.json();
  if (!data) {
    console.error('Could not fetch saas_data');
    return;
  }

  // 1. Update users
  const users = Array.isArray(data.users) ? data.users : Object.values(data.users || {});
  const custUser = users.find(u => u.id === 'user-customer');
  if (custUser) {
    custUser.displayName = 'Vishal & Suman';
  } else {
    users.push({
      id: 'user-customer',
      username: 'customer',
      password: 'customer123',
      displayName: 'Vishal & Suman',
      role: 'customer'
    });
  }

  // 2. Update invitations
  const invs = Array.isArray(data.invitations) ? data.invitations : Object.values(data.invitations || {});
  
  // Find or update invite-1792299417819
  const inv1 = invs.find(i => i.id === 'invite-1792299417819');
  if (inv1) {
    console.log('Updating invite-1792299417819...');
    inv1.title = "Vishal & Suman's Wedding Invitation";
    inv1.slug = "vishal-suman";
    inv1.customSlug = "vishal-suman";
    inv1.customerId = "user-customer";
    inv1.isPaid = true;
    inv1.status = "published";
    inv1.shareText = "We are thrilled to invite you to our wedding celebration! View our digital invitation here: {url} - Vishal & Suman";
    if (!inv1.config) inv1.config = {};
    inv1.config.coupleCardsOrder = "groomFirst";
    inv1.config.weddingTitle = "Vishal & Suman";
    inv1.config.envelopeNamesText = "Vishal & Suman";
    inv1.config.envelopeInitials = "V & S";
    if (inv1.driveStorage) {
      inv1.driveStorage.folderName = "Vishal & Suman (Snehalata Marriage Hall, Neamatpur, WB)";
    }
  }

  // Find or update invite-1792423053258
  const inv2 = invs.find(i => i.id === 'invite-1792423053258');
  if (inv2) {
    console.log('Updating invite-1792423053258...');
    inv2.title = "Vishal & Suman — Wedding Invitation";
    inv2.slug = "vishal-suman-1792423053258";
    inv2.customSlug = "vishal-suman-1792423053258";
    inv2.customerId = "user-customer";
    inv2.isPaid = true;
    inv2.status = "published";
    inv2.shareText = "We are thrilled to invite you to our wedding celebration! View our digital invitation here: {url} - Vishal & Suman";
    if (!inv2.config) inv2.config = {};
    inv2.config.coupleCardsOrder = "groomFirst";
    inv2.config.weddingTitle = "Vishal & Suman";
    inv2.config.envelopeNamesText = "Vishal & Suman";
    inv2.config.envelopeInitials = "V 👑 S";
  }

  // Save back to Firebase
  data.users = users;
  data.invitations = invs;

  const putRes = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (putRes.ok) {
    console.log('Successfully updated Firebase saas_data with Vishal & Suman branding and paid status!');
  } else {
    console.error('Failed to update Firebase:', putRes.status, await putRes.text());
  }
}

updateFirebase().catch(console.error);

