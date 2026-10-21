async function checkFirebase() {
  const res = await fetch('https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data.json');
  const data = await res.json();
  const invs = Array.isArray(data?.invitations) ? data.invitations : Object.values(data?.invitations || {});
  console.log('Firebase Invitations count:', invs.length);
  invs.forEach((inv, i) => {
    console.log(`\nInv [${i}] ID: ${inv.id}, Title: ${inv.title}`);
    console.log('  heroImage:', inv.config?.heroImage);
    console.log('  musicUrl:', inv.config?.musicUrl);
    console.log('  startingMusicUrl:', inv.config?.startingMusicUrl);
    console.log('  folderName:', inv.driveStorage?.folderName);
    console.log('  folderUrl:', inv.driveStorage?.folderUrl);
  });
}
checkFirebase().catch(console.error);
