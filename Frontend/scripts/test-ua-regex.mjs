const crawlerRegex = /.*([wW]hats[aA]pp|[fF]acebookexternalhit|[fF]acebot|[tT]witterbot|[tT]elegram[bB]ot|[lL]inked[iI]n[bB]ot|[sS]lackbot|[dD]iscordbot|[aA]pplebot|[gG]ooglebot|[gG]oogle-[iI]nspection[tT]ool|[bB]ingbot|[yY]ahoo|[iI]a_archiver|[eE]mbedly|[qQ]uora link preview|[oO]utbrain|[rR]ogerbot|[sS]howyoubot|[vV]k[sS]hare|[wW]3c_validator|[rR]edditbot|[iI]framely|developers\.google\.com|[sS]kype[uU]ri[pP]review|[vV]iber|[pP]interest).*/;

const testUAs = [
  'WhatsApp/2.23.20.10 i',
  'WhatsApp/2.21.12.21 N',
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'Facebot',
  'Twitterbot/1.0',
  'TelegramBot (like TwitterBot)',
  'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

testUAs.forEach(ua => {
  const isMatch = crawlerRegex.test(ua);
  console.log(isMatch ? '✓ MATCH:   ' : '✗ NO MATCH:', ua.substring(0, 50));
});
