// api/image.js
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
      },
    });

    const b64 = response.generatedImages?.[0]?.image?.imageBytes;
    if (!b64) return res.status(500).json({ error: 'No image in response' });

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ b64 });

  } catch (err) {
    console.error('Image generation error:', err);
    return res.status(500).json({ error: err.message });
  }
}
