import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Webhook received:', {
      method: req.method,
      headers: req.headers,
      body: req.body
    });

    // Forward the webhook to Convex
    const response = await fetch('https://brainy-mole-762.convex.cloud/payments/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward important headers
        'x-polar-signature': req.headers['x-polar-signature'] as string || '',
        'x-polar-event': req.headers['x-polar-event'] as string || '',
        'x-polar-webhook-id': req.headers['x-polar-webhook-id'] as string || '',
      },
      body: JSON.stringify(req.body),
    });

    const result = await response.text();
    console.log('Convex response:', response.status, result);

    if (!response.ok) {
      console.error('Convex webhook error:', result);
      return res.status(response.status).send(result);
    }

    return res.status(200).send(result);
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}