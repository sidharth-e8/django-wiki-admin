import { NextApiRequest, NextApiResponse } from 'next';

interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  groq_configured: boolean;
  api_key_required: boolean;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  const response: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    groq_configured: !!process.env.GROQ_API_KEY,
    api_key_required: !!process.env.API_KEY,
  };

  res.status(200).json(response);
}
