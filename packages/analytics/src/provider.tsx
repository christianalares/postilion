import { OpenPanelComponent, type TrackHandlerPayload } from '@openpanel/nextjs'

const filter = ((_event: TrackHandlerPayload) => {
  return process.env.NODE_ENV === 'production'
}).toString()

type Props = React.ComponentProps<typeof OpenPanelComponent>

export const AnalyticsProvider = ({ ...props }: Props) => {
  return (
    <>
      <OpenPanelComponent {...props} filter={filter} trackScreenViews trackOutgoingLinks />
    </>
  )
}
