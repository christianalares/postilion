'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authClient } from '@/lib/auth/auth-client'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Avatar } from './ui/avatar'

import { useSuspenseQuery } from '@tanstack/react-query'

const ThemeSwitcher = dynamic(() => import('@/components/theme-switcher').then(({ ThemeSwitcher }) => ThemeSwitcher), {
  ssr: false,
})

type Props = {
  className?: string
}
export const UserDropdown = ({ className }: Props) => {
  const trpc = useTRPC()
  const router = useRouter()
  const { data: me } = useSuspenseQuery(trpc.users.me.queryOptions())

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn('rounded-full', className)}>
        <Avatar name={me.name} imageUrl={me.image ?? undefined} />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          {me.name}
          <p className="text-muted-foreground text-xs font-normal">{me.email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link prefetch href="/account">
            Account
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="flex flex-row justify-between items-center px-2 py-1">
          <p className="text-sm">Theme</p>
          <ThemeSwitcher />
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
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
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
