import { Header } from '@/components/header'
import { MainMenu } from '@/components/main-menu'
import { HydrateClient, trpc } from '@/trpc/server'

type Props = {
  children: React.ReactNode
}

const AuthorizedLayout = ({ children }: Props) => {
  trpc.users.me.prefetch()

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
