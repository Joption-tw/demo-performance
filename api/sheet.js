export default async function handler(req, res) {
  const SHEET_ID = '1AsY4_MJipaMp_cNLpyeXTpFGnG0FD4vWJu-SDRdvtME';
  const GID = '1823639969';
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}&t=${Date.now()}`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch sheet' });
    }

    const text = await response.text();

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
