import { authClient } from '@/lib/auth/auth-client'
import { trpc } from '@/trpc/client'
import type { RouterOutputs } from '@/trpc/routers/_app'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useProjectSlug } from './use-project-slug'
import { useTeamSlug } from './use-team-slug'

export const useRealtimeMessages = () => {
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()
  const trpcUtils = trpc.useUtils()
  const eventSourceRef = useRef<EventSource | null>(null)

  const [messages] = trpc.messages.getForProject.useSuspenseQuery({ teamSlug, projectSlug })

  useEffect(() => {
    authClient.getSession({
      fetchOptions: {
        onSuccess: (ctx) => {
          const jwt = ctx.response.headers.get('set-auth-jwt')
          if (!jwt) {
            toast.error('Failed to authenticate message stream')
            return
          }

          // Close existing connection if any
          eventSourceRef.current?.close()

          // Create new connection with JWT
          const eventSource = new EventSource(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/sse/${teamSlug}/${projectSlug}?token=${jwt}`,
          )
          eventSourceRef.current = eventSource

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

          eventSource.addEventListener('error', () => {
            toast.error('Failed to connect to the message stream')
          })
        },
        onError: () => {
          toast.error('Failed to authenticate message stream')
        },
      },
    })

    return () => {
      eventSourceRef.current?.close()
    }
  }, [teamSlug, projectSlug, trpcUtils])

  return messages
}
