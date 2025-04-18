import { Webhook } from 'standardwebhooks'

type ValidateRequestOptions = {
  body?: string
  headers: Record<string, string>
  secret: string
}

export const validateRequest = ({ body = '{}', headers, secret }: ValidateRequestOptions) => {
  const base64Secret = Buffer.from(secret, 'utf-8').toString('base64')
  const webhook = new Webhook(base64Secret)
  const parsed = webhook.verify(body, headers)

  return parsed
}
