'use client'

import dynamic from 'next/dynamic'

const ThemeSwitcher = dynamic(() => import('@/components/theme-switcher').then(({ ThemeSwitcher }) => ThemeSwitcher), {
  ssr: false,
  // loading: () => <Skeleton className="w-36 h-8" />,
})

export const ThemeSwitcherWrapper = () => {
  return <ThemeSwitcher />
}
