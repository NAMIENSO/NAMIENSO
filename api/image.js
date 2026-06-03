// api/image.js
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '1:1'
          }
        })
      }
    );

    const text = await response.text();
    console.log('Imagen API status:', response.status);
    console.log('Imagen API response:', text);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Imagen API error', detail: text });
    }

    const data = JSON.parse(text);
    const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) return res.status(500).json({ error: 'No image in response', raw: data });

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ b64 });

  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: err.message });
  }
};
