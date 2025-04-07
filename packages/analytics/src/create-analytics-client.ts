import { OpenPanel, type OpenPanelOptions, type TrackProperties } from '@openpanel/sdk'
import { waitUntil } from '@vercel/functions'

type EventNames =
  | 'team_updated'
  | 'team_created'
  | 'default_team_created'
  | 'project_created'
  | 'project_updated'
  | 'user_created'
  | 'user_updated'
  | 'domain_created'
  | 'domain_verified'
  | 'webhook_created'
  | 'webhook_updated'
  | 'webhook_deleted'
  | 'invite_created'
  | 'invite_deleted'
  | 'invite_accepted'

type AnalyticsClientOptions = {
  profileId?: string
} & Pick<OpenPanelOptions, 'clientId' | 'clientSecret'>

export const createAnalyticsClient = (options: AnalyticsClientOptions) => {
  const opClient = new OpenPanel({
    ...options,
  })

  const track = (event: EventNames, properties: TrackProperties) => {
    if (process.env.NODE_ENV !== 'production') {
      // biome-ignore lint/suspicious/noConsoleLog: <explanation>
      console.log('openpanelClient.track', event, properties)
      return null
    }

    return waitUntil(
      opClient.track(event, {
        ...properties,
        profileId: options.profileId,
      }),
    )
  }

  return {
    ...opClient,
    track,
  }
}
