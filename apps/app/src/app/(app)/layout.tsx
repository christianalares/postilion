import { getQueryClient, trpc } from '@/trpc/server'
import { IdentifyComponent } from '@postilion/analytics/identify-component'

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient()
  const user = await queryClient.fetchQuery(trpc.users.me.queryOptions())

  return (
    <>
      <IdentifyComponent user={user} />
      {children}
    </>
  )
}

export default AppLayout
