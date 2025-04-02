import { trpc } from '@/trpc/client'
import type { RouterOutputs } from '@/trpc/routers/_app'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useProjectSlug } from './use-project-slug'
import { useTeamSlug } from './use-team-slug'

export const useRealtimeMessages = () => {
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()
  const trpcUtils = trpc.useUtils()

  const [messages] = trpc.messages.getForProject.useSuspenseQuery({ teamSlug, projectSlug })

  useEffect(() => {
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sse/${teamSlug}/${projectSlug}`, {
      withCredentials: true,
    })

    eventSource.onmessage = (event) => {
      if (event.data === 'connected') {
        return
      }

      const incomingMessage = JSON.parse(event.data) as RouterOutputs['messages']['getForProject'][number]

      trpcUtils.messages.getForProject.setData({ teamSlug, projectSlug }, (prev) => {
        if (!prev) {
          return prev
        }

        // If message exists, update it
        if (prev.some((msg) => msg.id === incomingMessage.id)) {
          return prev.map((msg) => (msg.id === incomingMessage.id ? incomingMessage : msg))
        }

        // If new message, prepend it
        return [incomingMessage, ...prev]
      })
    }

    eventSource.addEventListener('error', (event) => {
      // biome-ignore lint/suspicious/noConsoleLog: <explanation>
      console.log(event)
      toast.error('Failed to connect to the message stream')
    })

    return () => {
      eventSource.close()
    }
  }, [teamSlug, projectSlug, trpcUtils])

  return messages
}
