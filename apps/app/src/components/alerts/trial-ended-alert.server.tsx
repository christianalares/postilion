import { getQueryClient, trpc } from '@/trpc/server'
import { TrialEndedAlert } from './trial-ended-alert'

type Props = {
  teamSlug: string
}

export const TrialEndedAlertServer = async ({ teamSlug }: Props) => {
  const queryClient = getQueryClient()
  const team = await queryClient.fetchQuery(trpc.teams.checkTrialEnded.queryOptions({ teamSlug }))

  return <TrialEndedAlert needsSubscription={team.needs_subscription} teamSlug={team.slug} />
}
