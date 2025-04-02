import { trpc } from '@/trpc/server'
import { IdentifyComponent } from '@postilion/analytics/identify-component'

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await trpc.users.me()

  return (
    <>
      <IdentifyComponent user={user} />
      {children}
    </>
  )
}

export default AppLayout
