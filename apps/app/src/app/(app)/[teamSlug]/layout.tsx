import { Header } from '@/components/header'
import { MainMenu } from '@/components/main-menu'
import { HydrateClient, trpc } from '@/trpc/server'
import { notFound } from 'next/navigation'

type Params = Promise<{
  teamSlug: string
}>

type Props = {
  children: React.ReactNode
  params: Params
}

const AuthorizedLayout = async ({ children, params }: Props) => {
  const { teamSlug } = await params

  trpc.users.me.prefetch()
  trpc.teams.getBySlug.prefetch({ slug: teamSlug })
  trpc.teams.getForUser.prefetch()

  // Can we do this a better way?
  // await trpc.teams.getBySlug({ slug: teamSlug }).catch((e) => {
  // 	notFound()
  // })

  return (
    <HydrateClient>
      <div className="flex h-full">
        <div className="flex flex-col border-r">
          <div className="size-16 flex items-center justify-center border-b">
            <p className="text-2xl font-bold border-2 border-foreground size-10 flex items-center justify-center rounded-full">
              P
            </p>
          </div>

          <aside>
            <MainMenu />
          </aside>
        </div>

        <div className="flex-1">
          <Header />

          <main className="p-8">{children}</main>
        </div>
      </div>
    </HydrateClient>
  )
}

export default AuthorizedLayout
