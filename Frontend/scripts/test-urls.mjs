async function test() {
  const r1 = await fetch('https://drive.google.com/uc?export=download&id=1ScEGe8HiEjdTdhbYh2R_6rTJMjHfsNu6');
  console.log('Starting music status:', r1.status, r1.headers.get('content-type'));

  const r2 = await fetch('https://lh3.googleusercontent.com/d/1brJdMaSjflXO8OeJ6cAzVj5cklst48jr');
  console.log('Hero image status:', r2.status, r2.headers.get('content-type'));
}
test().catch(console.error);
