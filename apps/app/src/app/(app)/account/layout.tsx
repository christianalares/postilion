import { AccountTeamsDropdown } from '@/components/account-teams-dropdown'
import { Header } from '@/components/header'
import { TeamsDropdownSkeleton } from '@/components/teams-dropdown'
import { HydrateClient, trpc } from '@/trpc/server'
import { Suspense } from 'react'

type Props = {
  children: React.ReactNode
}

const AccountLayout = async ({ children }: Props) => {
  trpc.users.me.prefetch()
  trpc.teams.getForUser.prefetch()

  return (
    <HydrateClient>
      <div className="grid grid-rows-[auto_1fr] h-full">
        <Header>
          <div className="flex gap-2 items-center">
            <Suspense fallback={<TeamsDropdownSkeleton />}>
              <AccountTeamsDropdown />
            </Suspense>
          </div>
        </Header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </HydrateClient>
  )
}

export default AccountLayout
