async function checkFacebookScraper() {
  const target = 'https://ds-envite.vercel.app/invite/vishal-suman';
  const apiUrl = `https://graph.facebook.com/?id=${encodeURIComponent(target)}&scrape=true`;
  console.log('Querying Facebook Graph Scraper API...');
  try {
    const res = await fetch(apiUrl, { method: 'POST' });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Facebook Scraper Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error querying Facebook Graph:', e);
  }
}
checkFacebookScraper();
