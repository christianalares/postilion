'use client'

import { useMessageId } from '@/hooks/use-message-id'
import { cn } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { FileViewer } from './file-viewer/file-viewer'
import { Badge, badgeLabelVariants } from './ui/badge'
import { Icon } from './ui/icon'
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
        {message.webhook_logs.length > 0 && (
          <div className="border p-2 bg-muted/50 items-center gap-1 space-y-2">
            <p className={badgeLabelVariants()}>Webhook calls:</p>
            <ul className="space-y-2">
              {message.webhook_logs.map((log) => {
                const wasSuccess = log.status === 'SUCCESS'
                const wasFailed = log.status === 'FAILED'

                return (
                  <li key={log.id} className="flex items-center gap-2">
                    <Icon
                      name={wasSuccess ? 'checkCircle' : wasFailed ? 'xCircle' : 'circleAlert'}
                      className={cn('size-4', {
                        'text-green-400': wasSuccess,
                        'text-destructive': wasFailed,
                      })}
                    />
                    <span className="text-xs font-mono">{log.url}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

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
            {message.attachments
              .filter(
                (attachment) => attachment.mime_type.startsWith('image/') || attachment.mime_type === 'application/pdf',
              )
              .map((attachment) => {
                return (
                  <li key={attachment.id}>
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/attachments/${attachment.r2_key}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-mono text-xs flex items-center gap-1 hover:underline underline-offset-4"
                    >
                      <Icon
                        name={attachment.mime_type === 'application/pdf' ? 'document' : 'image'}
                        className="size-4"
                        strokeWidth={1}
                      />
                      {attachment.filename}
                    </a>
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
