// api/image.js
// Imagen 4 (imagen-4.0-generate-001)

export default async function handler(req, res) {
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
            aspectRatio: '1:1',
            safetyFilterLevel: 'block_few',
            personGeneration: 'dont_allow'
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Imagen4 error:', response.status, errText);
      return res.status(response.status).json({ error: 'Imagen4 API error', detail: errText });
    }

    const data = await response.json();
    const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) return res.status(500).json({ error: 'No image in response', raw: data });

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ b64 });

  } catch (err) {
    console.error('Image generation error:', err);
    return res.status(500).json({ error: err.message });
  }
}
