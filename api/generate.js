// api/generate.js
// Gemini（テキスト生成）への中継。APIキーはサーバー側だけに置き、クライアントには渡さない。
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  const { contents, generationConfig } = req.body || {};
  if (!contents) return res.status(400).json({ error: 'contents is required' });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig }),
      }
    );
    const text = await response.text();
    res.status(response.status);
    res.setHeader('Content-Type', 'application/json');
    return res.send(text);
  } catch (e) {
    return res.status(502).json({ error: 'Gemini fetch failed', detail: String(e) });
  }
};
