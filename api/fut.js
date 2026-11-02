// 臺指期近月即時報價 Proxy
// 期交所 API 不允許跨網域，由此代理抓取並精簡欄位
//   /api/fut → 目前這一盤的近月台指期；收盤後、開盤前顯示最近一盤的最後報價
// 期交所日盤、夜盤分開查：日盤 MarketType 0、夜盤 MarketType 1；漲跌都是對參考價（前一日結算價）
const QUOTE_LIST = 'https://mis.taifex.com.tw/futures/api/getQuoteList';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  try {
    // 08:45～15:00 優先日盤（13:45 收盤後留著日盤收盤價），其他時間優先夜盤；這一盤還沒成交才查另一盤
    const now = new Date(Date.now() + 8 * 3600e3);
    const minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const first = minutes >= 525 && minutes < 900 ? '0' : '1';
    const quote = (await nearMonth(first)) || (await nearMonth(first === '0' ? '1' : '0'));
    if (!quote) throw new Error('No TXF quote');
    // 快取 5 秒：不管幾個人在看，同一個機房 5 秒最多問期交所一次（問太密整個網站都會回 520，連波動率一起受影響）
    res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=5');
    res.status(200).send(JSON.stringify(quote));
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: err.message });
  }
}

async function nearMonth(marketType) {
  const response = await fetch(QUOTE_LIST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
      Referer: 'https://mis.taifex.com.tw/futures/',
    },
    body: JSON.stringify({ MarketType: marketType, SymbolType: 'F', KindID: '1', CID: 'TXF', ExpireMonth: '', RowSize: '全部', PageNo: '', SortColumn: '', AscDesc: 'A' }),
  });
  if (!response.ok) throw new Error(`TAIFEX ${response.status}`);
  const data = await response.json();
  if (data.RtCode !== '0' || !data.RtData) throw new Error(data.RtMsg || 'Bad TXF response');

  // 清單第一筆是現貨（-S），之後照到期月排，第一筆期貨就是近月
  const row = (data.RtData.QuoteList || []).find(r => /-[FM]$/.test(r.SymbolID));
  const num = v => (v === '' || v == null ? null : Number(v));
  if (!row || num(row.CLastPrice) === null) return null;
  return {
    symbol: row.SymbolID,
    name: row.DispCName,
    session: marketType === '0' ? 'D' : 'N',
    last: num(row.CLastPrice),
    ref: num(row.CRefPrice),
    diff: num(row.CDiff),
    pct: num(row.CDiffRate),
    open: num(row.COpenPrice),
    high: num(row.CHighPrice),
    low: num(row.CLowPrice),
    date: row.CDate || '',
    time: row.CTime || '',
  };
}
