import { TrialEndedAlertServer } from '@/components/alerts/trial-ended-alert.server'

type Params = Promise<{
  teamSlug: string
}>

type Props = {
  children: React.ReactNode
  params: Params
}

const TeamsLayout = async ({ children, params }: Props) => {
  const { teamSlug } = await params
  return (
    <>
      <TrialEndedAlertServer teamSlug={teamSlug} />
      {children}
    </>
  )
}

export default TeamsLayout
