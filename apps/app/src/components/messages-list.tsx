'use client'

import { useProjectSlug } from '@/hooks/use-project-slug'
import { useRealtimeMessages } from '@/hooks/use-realtime-messages'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { trpc } from '@/trpc/client'
import { AnimatePresence, motion } from 'motion/react'
import { Icon } from './ui/icon'
import { Spinner } from './ui/spinner'

export const MessagesList = () => {
  const messages = useRealtimeMessages()
  // const teamSlug = useTeamSlug()
  // const projectSlug = useProjectSlug()

  // const [messages] = trpc.messages.getForProject.useSuspenseQuery({ teamSlug, projectSlug })

  return (
    <motion.ul layout="position" transition={{ duration: 0.3, ease: 'easeOut' }} className="space-y-4">
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </motion.ul>
  )
}

type MessageProps = {
  message: ReturnType<typeof useRealtimeMessages>[number]
}

const Message = ({ message }: MessageProps) => {
  return (
    <li className="border p-4">
      <div>From: {message.from}</div>
      <div className="flex items-center gap-2">
        <MessageStatusIcon status={message.status} />
        Status: {message.status}
      </div>
      <div>Subject: {message.subject}</div>
      <div>Body: {message.body_ai_summary}</div>
    </li>
  )
}

const MessageStatusIcon = ({ status }: { status: ReturnType<typeof useRealtimeMessages>[number]['status'] }) => {
  if (status === 'COMPLETED') {
    return <Icon name="checkCircle" className="text-green-500" />
  }

  if (status === 'PROCESSING') {
    return <Spinner className="text-orange-400" />
  }

  return null
}
