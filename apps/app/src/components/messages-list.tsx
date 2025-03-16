'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useProjectSlug } from '@/hooks/use-project-slug'
import { useRealtimeMessages } from '@/hooks/use-realtime-messages'
import { useTeamSlug } from '@/hooks/use-team-slug'
import type { MESSAGE_STATUS_ENUM } from '@postilion/db'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { Badge } from './ui/badge'
import { Icon } from './ui/icon'
import { Skeleton } from './ui/skeleton'
import { Spinner } from './ui/spinner'

export const MessagesList = () => {
  const messages = useRealtimeMessages()

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="border border-dashed p-4">
          <h1 className="text-lg font-bold">There are no received messages yet</h1>
          <p className="text-muted-foreground">When new messages are received, they will appear here in real-time.</p>
        </div>
      </div>
    )
  }

  return (
    <motion.ul className="space-y-4">
      {messages.map((message) => (
        <AnimatePresence key={message.id} initial={false}>
          <Message key={message.id} message={message} />
        </AnimatePresence>
      ))}
    </motion.ul>
  )
}

type MessageProps = {
  message: ReturnType<typeof useRealtimeMessages>[number]
}

const Message = ({ message }: MessageProps) => {
  const projectSlug = useProjectSlug()
  const teamSlug = useTeamSlug()

  return (
    <motion.li layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <Link
        href={`/${teamSlug}/${projectSlug}/messages/${message.id}`}
        className="block border p-4 bg-background relative text-left hover:border-accent-foreground/30 w-full"
      >
        <div className="flex gap-2 grow-0 items-center">
          <Badge label="From:">{message.from}</Badge>
          <Badge label="Subject:">{message.subject}</Badge>
          <Badge label="Created at:">{new Date(message.created_at).toLocaleString()}</Badge>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-auto">
                  <StatusIcon status={message.status} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" sideOffset={8}>
                <p>{message.status}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="border p-2 bg-muted/50 text-xs mt-4 font-mono">
          {message.body_ai_summary ? <p>{message.body_ai_summary}</p> : <SummarySkeleton />}
        </div>
      </Link>
    </motion.li>
  )
}

type StatusIconProps = {
  status: MESSAGE_STATUS_ENUM
}

const StatusIcon = ({ status }: StatusIconProps) => {
  const icons: Record<typeof status, React.ReactNode> = {
    COMPLETED: <Icon name="checkCircle" className="text-green-400 size-5" />,
    PROCESSING: <Spinner className="text-orange-400 size-5" />,
    PENDING: null,
    FAILED: null,
  }

  const badgeIcon = icons[status]

  if (!badgeIcon) {
    return null
  }

  return badgeIcon
}

const SummarySkeleton = () => {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}
