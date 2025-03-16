'use client'

import { useRealtimeMessages } from '@/hooks/use-realtime-messages'
import type { MESSAGE_STATUS_ENUM } from '@postilion/db'
import { AnimatePresence, motion } from 'motion/react'
import { Icon } from './ui/icon'
import { Skeleton } from './ui/skeleton'
import { Spinner } from './ui/spinner'

export const MessagesList = () => {
  const messages = useRealtimeMessages()

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
  return (
    <motion.li layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <button
        type="button"
        className="border p-4 bg-background relative text-left hover:border-accent-foreground/30 w-full"
      >
        <div className="flex gap-2 grow-0 items-center">
          <div className="border py-1 px-2 bg-muted/50 text-xs">
            <span className="text-muted-foreground font-mono">From:</span>
            <span className="ml-1">{message.from}</span>
          </div>

          <div className="border py-1 px-2 bg-muted/50 text-xs">
            <span className="text-muted-foreground font-mono">Subject:</span>
            <span className="ml-1">{message.subject}</span>
          </div>

          <div className="ml-auto">
            <StatusIcon status={message.status} />
          </div>
        </div>

        <div className="border p-2 bg-muted/50 text-xs mt-4 font-mono">
          {message.body_ai_summary ? <p>{message.body_ai_summary}</p> : <SummarySkeleton />}
        </div>
      </button>
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
