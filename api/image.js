export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  const apiKey = process.env.STABILITY_API_KEY;

  try {
    const response = await fetch(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Accept': 'application/json',
        },
        body: (() => {
          const form = new FormData();
          form.append('prompt', prompt);
          form.append('output_format', 'png');
          form.append('aspect_ratio', '1:1');
          return form;
        })()
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    const data = await response.json();
    const base64 = data.image;
    const url = 'data:image/png;base64,' + base64;
    res.status(200).json({ url });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
