import { Resend } from 'resend'
import InviteUserEmail from './emails/invite-user'

type Email = {
  type: 'invite-user'
  to: string
  props: Parameters<typeof InviteUserEmail>[0]
}

export class EmailClient {
  private client: Resend

  constructor(apiKey: string) {
    this.client = new Resend(apiKey)
  }

  async send(email: Email) {
    if (email.type === 'invite-user') {
      return this.client.emails.send({
        from: 'Postilion <christian@postilion.ai>',
        to: email.to,
        subject: 'Test',
        react: InviteUserEmail(email.props),
      })
    }
  }
}
