export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = process.env;
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    return res.status(500).json({ error: 'Redis not configured' });
  }

  const headers = {
    Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // 台灣時間 (UTC+8)
  const now = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // 同時遞增總計 & 今日計數
    const [totalRes, dailyRes] = await Promise.all([
      fetch(`${UPSTASH_REDIS_REST_URL}/incr/visits:total`, { method: 'POST', headers }),
      fetch(`${UPSTASH_REDIS_REST_URL}/incr/visits:${today}`, { method: 'POST', headers }),
    ]);

    const [totalData, dailyData] = await Promise.all([totalRes.json(), dailyRes.json()]);

    // 今日 key 設定 7 天過期（保留近期每日數據）
    await fetch(`${UPSTASH_REDIS_REST_URL}/expire/visits:${today}/604800`, { method: 'POST', headers });

    return res.status(200).json({
      total: totalData.result ?? 0,
      today: dailyData.result ?? 0,
      date: today,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
