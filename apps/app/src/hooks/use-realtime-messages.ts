import { trpc } from '@/trpc/client'
import type { RouterOutputs } from '@/trpc/routers/_app'
import { useEffect } from 'react'
import { useProjectSlug } from './use-project-slug'
import { useTeamSlug } from './use-team-slug'

export const useRealtimeMessages = () => {
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()
  const trpcUtils = trpc.useUtils()

  const [messages] = trpc.messages.getForProject.useSuspenseQuery({ teamSlug, projectSlug })

  useEffect(() => {
    const eventSource = new EventSource(`http://localhost:8787/sse/${teamSlug}/${projectSlug}`, {
      // const eventSource = new EventSource('http://127.0.0.1:8787/message/01JPCPC9DM1XVRQ9X0RA0M0RJW/status', {
      withCredentials: true,
    })

    eventSource.onmessage = (event) => {
      console.log(event)

      if (event.data === 'connected') {
        return
      }

      const incomingMessage = JSON.parse(event.data) as RouterOutputs['messages']['getForProject'][number]

      console.log('incomingMessage', incomingMessage)

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

    eventSource.addEventListener('open', (event) => {
      console.log('open', event)
    })

    eventSource.addEventListener('error', (event) => {
      console.log('error', event)
    })

    return () => {
      eventSource.close()
    }
  }, [teamSlug, projectSlug, trpcUtils])

  return messages
}
