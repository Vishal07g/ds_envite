async function check() {
  const res = await fetch('https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app/saas_data.json');
  const db = await res.json();
  const presets = Array.isArray(db.presets) ? db.presets : Object.values(db.presets || {});
  console.log('Total presets:', presets.length);
  let presetBase64 = 0;
  presets.forEach((p, i) => {
    const cfg = p.config || {};
    for (const [k, v] of Object.entries(cfg)) {
      if (typeof v === 'string' && v.startsWith('data:')) {
        presetBase64++;
        console.log(`  Preset [${i}] (${p.id}): cfg.${k} has base64 (${v.length} chars)`);
      }
    }
  });
  console.log('Total base64 found in presets:', presetBase64);

  const orders = Array.isArray(db.orders) ? db.orders : Object.values(db.orders || {});
  console.log('Total orders:', orders.length);
  let orderBase64 = 0;
  orders.forEach((o, i) => {
    const photos = o.details?.photos || [];
    photos.forEach((photo, pIdx) => {
      if (typeof photo === 'string' && photo.startsWith('data:')) {
        orderBase64++;
        console.log(`  Order [${i}] (${o.id}): photos[${pIdx}] has base64 (${photo.length} chars)`);
      }
    });
  });
  console.log('Total base64 found in orders:', orderBase64);
}

check();
