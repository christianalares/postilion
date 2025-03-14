'use client'

import { authClient } from '@/lib/auth/auth-client'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
// import { ErrorBoundary } from './error-boundary'
import { TeamsDropdown, TeamsDropdownSkeleton } from './teams-dropdown'

const ThemeSwitcher = dynamic(() => import('@/components/theme-switcher').then(({ ThemeSwitcher }) => ThemeSwitcher), {
  ssr: false,
  // loading: () => <Skeleton className="w-36 h-8" />,
})

export const Header = () => {
  const router = useRouter()

  return (
    <header className="flex justify-between h-16 items-center border-b px-6">
      <Suspense fallback={<TeamsDropdownSkeleton />}>
        <TeamsDropdown />
      </Suspense>

      <div className="flex gap-4 items-center">
        <button
          type="button"
          onClick={() =>
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push('/login')
                },
              },
            })
          }
        >
          Logout
        </button>

        <ThemeSwitcher />
      </div>
    </header>
  )
}
