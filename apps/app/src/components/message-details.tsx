'use client'

import { useMessageId } from '@/hooks/use-message-id'
import { trpc } from '@/trpc/client'
import { FileViewer } from './file-viewer/file-viewer'
import { Badge, badgeLabelVariants } from './ui/badge'
import { Skeleton } from './ui/skeleton'

export const MessageDetails = () => {
  const messageId = useMessageId()

  const [message] = trpc.messages.getById.useSuspenseQuery({ messageId })

  return (
    <article>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge label="From:">{message.from}</Badge>
        <Badge label="Subject:">{message.subject}</Badge>
        <Badge label="Created at:">{new Date(message.created_at).toLocaleString()}</Badge>
      </div>

      <hr className="my-4" />

      <div className="space-y-4">
        <div className="border p-2 bg-muted/50 items-center gap-1 space-y-2">
          <p className={badgeLabelVariants()}>AI summary:</p>
          <p className="text-xs font-mono">{message.body_ai_summary}</p>
        </div>

        <div className="border p-2 bg-muted/50 items-center gap-1 space-y-2">
          <p className={badgeLabelVariants()}>Stripped body:</p>
          <p className="text-xs font-mono">{message.body_stripped}</p>
        </div>

        <div className="border p-2 bg-muted/50 items-center gap-1 space-y-2">
          <p className={badgeLabelVariants()}>Raw body:</p>
          <p className="text-xs font-mono break-all">{message.body_raw}</p>
        </div>

        <div className="border p-2 bg-muted/50 items-center gap-1 space-y-2">
          <p className={badgeLabelVariants()}>Attachments:</p>
          <ul className="flex items-center gap-4">
            {message.attachments.map((attachment) => {
              return (
                <li key={attachment.id}>
                  <FileViewer file={attachment} />
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </article>
  )
}

export const MessageDetailsSkeleton = () => {
  return (
    <article>
      <div className="flex items-center gap-2">
        <Badge label="From:">
          <Skeleton className="w-28 h-3" />
        </Badge>
        <Badge label="Subject:">
          <Skeleton className="w-40 h-3" />
        </Badge>
        <Badge label="Created at:">
          <Skeleton className="w-28 h-3" />
        </Badge>
      </div>

      <hr className="my-4" />

      <div className="space-y-4">
        <div className="border p-2 bg-muted/50 items-center gap-1 space-y-2">
          <p className="text-muted-foreground font-mono text-xs">AI summary:</p>
          <div className="space-y-2">
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-2/3 h-3" />
          </div>
        </div>

        <div className="border p-2 bg-muted/50 items-center gap-1 space-y-2">
          <p className="text-muted-foreground font-mono text-xs">Stripped body:</p>
          <div className="space-y-2">
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-1/4 h-3" />
          </div>
        </div>

        <div className="border p-2 bg-muted/50 items-center gap-1 space-y-2">
          <p className="text-muted-foreground font-mono text-xs">Raw body:</p>
          <div className="space-y-2">
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-1/4 h-3" />
          </div>
        </div>
      </div>
    </article>
  )
}
