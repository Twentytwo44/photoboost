import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { path } = req.query;
  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  try {
    // Fetch direct download url from tmpfiles.org in the cloud (unblocked DNS)
    const fileUrl = `https://tmpfiles.org/dl/${path}`;
    const response = await fetch(fileUrl);

    if (!response.ok) {
      return res.status(response.status).end(`Failed to fetch image from storage: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

    // Convert body to Buffer and pipe it back to client
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return res.status(200).send(buffer);
  } catch (error: any) {
    console.error('View proxy error:', error);
    return res.status(500).end('Internal server error');
  }
}
