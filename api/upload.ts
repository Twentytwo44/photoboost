import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Missing image field' });
    }

    // Extract base64 details
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Prepare FormData for tmpfiles.org
    const formData = new FormData();
    const blob = new Blob([buffer], { type: mimeType });
    formData.append('file', blob, `photobooth-${Date.now()}.png`);

    // Upload server-to-server to bypass local ISP blocks
    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Upload server error: ${errorText}` });
    }

    const result = await response.json();
    if (result.status !== 'success' || !result.data || !result.data.url) {
      return res.status(500).json({ error: result.message || 'Invalid response from tmpfiles.org' });
    }

    // Extract path from tmpfiles.org url
    // E.g. https://tmpfiles.org/12345/filename.png -> 12345/filename.png
    const originalUrl = result.data.url;
    const path = originalUrl.replace('https://tmpfiles.org/', '');

    // Return the proxy URL that points to our local /api/view endpoint
    const host = req.headers.host || 'photoboost-cyan.vercel.app';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    
    // Note: Vercel projects can be hosted on HTTP/HTTPS.
    // If it's localhost, we can use the local dev protocol, but in production it is always https.
    const proxyUrl = `${protocol}://${host}/api/view?path=${path}`;

    return res.status(200).json({ url: proxyUrl });
  } catch (error: any) {
    console.error('Upload proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
