export const validateRequest = async (req: Request, signingKey: string) => {
  const signature = req.headers.get('X-Postilion-Signature')

  if (!signature) {
    throw new Error('Missing X-Postilion-Signature header')
  }

  // For GET/DELETE requests, the URL is used as the payload
  if (req.method === 'GET' || req.method === 'DELETE') {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(signingKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const expectedSignature = await crypto.subtle.sign('HMAC', key, encoder.encode(req.url))
    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    if (signature !== expectedSignatureHex) {
      throw new Error('Invalid signature')
    }

    return true
  }

  // For POST/PUT requests, the request body is used as the payload
  if (req.method === 'POST' || req.method === 'PUT') {
    const body = await req.text()

    if (!body) {
      throw new Error('Missing request body')
    }

    const encoder = new TextEncoder()

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(signingKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )

    const expectedSignature = await crypto.subtle.sign('HMAC', key, encoder.encode(body))

    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    if (signature !== expectedSignatureHex) {
      throw new Error('Invalid signature')
    }
    return true
  }

  throw new Error(`Unsupported HTTP method: ${req.method}`)
}
