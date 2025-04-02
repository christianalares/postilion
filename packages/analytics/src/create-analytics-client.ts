import { OpenPanel, type OpenPanelOptions, type TrackProperties } from '@openpanel/sdk'
import { waitUntil } from '@vercel/functions'

type AnalyticsClientOptions<TEventNames extends string> = {
  eventNames: readonly TEventNames[]
  profileId?: string
} & Pick<OpenPanelOptions, 'clientId' | 'clientSecret'>

export const createAnalyticsClient = <TEventNames extends string>(options: AnalyticsClientOptions<TEventNames>) => {
  const opClient = new OpenPanel({
    ...options,
  })

  const track = (event: TEventNames | (string & {}), properties: TrackProperties) => {
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
