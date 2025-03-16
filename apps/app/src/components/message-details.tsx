'use client'

import { useMessageId } from '@/hooks/use-message-id'
import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { trpc } from '@/trpc/client'
import { Badge } from './ui/badge'

export const MessageDetails = () => {
  const trpcUtils = trpc.useUtils()
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()

  const messageId = useMessageId()

  const [message] = trpc.messages.getById.useSuspenseQuery({ messageId })

  return (
    <article>
      <div className="flex items-center gap-2">
        <Badge label="From:">{message.from}</Badge>
        <Badge label="Subject:">{message.subject}</Badge>
        <Badge label="Created at:">{new Date(message.created_at).toLocaleDateString()}</Badge>
      </div>

      <hr className="my-4" />

      <div className="space-y-4">
        <div className="border p-2 bg-muted/50 items-center gap-1 space-y-2">
          <p className="text-muted-foreground font-mono text-xs">AI summary:</p>
          <p className="text-sm">{message.body_ai_summary}</p>
        </div>

        <div className="border p-2 bg-muted/50 items-center gap-1 space-y-2">
          <p className="text-muted-foreground font-mono text-xs">Stripped body:</p>
          <p className="text-sm">{message.body_stripped}</p>
        </div>

        <div className="border p-2 bg-muted/50 items-center gap-1 space-y-2">
          <p className="text-muted-foreground font-mono text-xs">Raw body:</p>
          <p className="text-sm font-mono">{message.body_raw}</p>
        </div>
      </div>
    </article>
  )
}
