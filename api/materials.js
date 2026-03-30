export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Cache for 5 minutes, serve stale while revalidating
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1NFwNZiXJGaULuVx6LRsriJM-YUdDyIRof7n9qSQsCvw/export?format=csv&gid=0';

  try {
    const resp = await fetch(SHEET_URL);
    if (!resp.ok) throw new Error('Sheet fetch failed: ' + resp.status);
    const csv = await resp.text();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.status(200).send(csv);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
