// api/tide.js
// 潮汐の実データを tide736 API からサーバー側で取得して返す。
// 返すのは波円相で使う分だけ：港名・潮名・月齢・満潮/干潮の時刻と潮位・毎時の潮位。
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const pc = String((req.query && req.query.pc) || '14');
  const hc = String((req.query && req.query.hc) || '3');
  if (!/^\d{1,2}$/.test(pc) || !/^\d{1,3}$/.test(hc)) {
    return res.status(400).json({ error: 'invalid port code' });
  }

  let dateStr = String((req.query && req.query.date) || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const nowJst = new Date(Date.now() + 9 * 3600 * 1000);
    dateStr = nowJst.toISOString().slice(0, 10);
  }
  const [yr, mn, dy] = dateStr.split('-').map((v) => String(parseInt(v, 10)));

  const url = `https://api.tide736.net/get_tide.php?pc=${pc}&hc=${hc}&yr=${yr}&mn=${mn}&dy=${dy}&rg=day`;

  try {
    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ error: 'tide api error', status: r.status });
    const data = await r.json();
    const chart = data && data.tide && data.tide.chart && data.tide.chart[dateStr];
    if (!chart) return res.status(502).json({ error: 'no chart data for date' });

    res.status(200).json({
      port: data.tide.port.harbor_namej,
      date: dateStr,
      moonAge: chart.moon ? chart.moon.age : null,
      tideName: chart.moon ? chart.moon.title : null,
      flood: chart.flood || [],
      edd: chart.edd || [],
      hourly: (chart.tide || []).map((t) => ({ time: t.time, cm: t.cm })),
      sun: chart.sun ? { rise: chart.sun.rise, set: chart.sun.set } : null,
      moon: chart.moon ? { rise: chart.moon.rise, set: chart.moon.set } : null,
    });
  } catch (e) {
    res.status(502).json({ error: 'tide fetch failed', detail: String(e) });
  }
};
