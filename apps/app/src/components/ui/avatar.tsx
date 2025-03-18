'use client'

import * as AvatarPrimitive from '@radix-ui/react-avatar'

import { cn } from '@/lib/utils'

function ShadcnAvatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image data-slot="avatar-image" className={cn('aspect-square size-full', className)} {...props} />
  )
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn('bg-muted flex size-full items-center justify-center rounded-full', className)}
      {...props}
    />
  )
}

type Props = {
  imageUrl?: string
  name: string
  className?: string
  fallbackClassName?: string
}

export const Avatar = ({ imageUrl, name, className, fallbackClassName }: Props) => {
  const fullnameParts = name.split(' ')
  // @ts-ignore
  let initials = fullnameParts[0].charAt(0).toUpperCase()

  if (fullnameParts.length >= 2) {
    // @ts-ignore
    initials = (fullnameParts[0].charAt(0) + fullnameParts[fullnameParts.length - 1].charAt(0)).toUpperCase()
  }

  if (fullnameParts.length === 1) {
    // @ts-ignore
    initials = `${fullnameParts[0].charAt(0).toUpperCase()}${fullnameParts[0].charAt(1).toUpperCase()}`
  }

  return (
    <ShadcnAvatar className={cn(className)}>
      <AvatarImage src={imageUrl} />
      <AvatarFallback className={cn(fallbackClassName)}>{initials}</AvatarFallback>
    </ShadcnAvatar>
  )
}
