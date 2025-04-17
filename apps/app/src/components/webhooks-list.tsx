'use client'
import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Badge } from './ui/badge'
import { CopyToClipboardButton } from './ui/copy-to-clipboard-button'
import { Icon } from './ui/icon'
import { WebhookDropdown } from './webhook-dropdown'

const obfuscateSecret = (secret: string) => {
  const visibleChars = 4
  return `${secret.slice(0, visibleChars)}${'•'.repeat(secret.length - visibleChars * 2)}${secret.slice(-visibleChars)}`
}

export const WebhooksList = () => {
  const trpc = useTRPC()
  const projectSlug = useProjectSlug()
  const teamSlug = useTeamSlug()
  const { data: webhooks } = useSuspenseQuery(trpc.webhooks.getForProject.queryOptions({ projectSlug, teamSlug }))

  if (webhooks.length === 0) {
    return <p>You don't have any webhooks yet.</p>
  }

  return (
    <ul className="space-y-4">
      {webhooks.map((webhook) => (
        <li key={webhook.id} className="border p-4 flex justify-between items-center gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge label={webhook.method} />
              <p className="text-sm font-mono">{webhook.url}</p>
              <CopyToClipboardButton text={webhook.url} />
            </div>

            <div className="flex items-center gap-2">
              <Icon name="key" className="size-4" />
              <p className="font-mono text-sm text-muted-foreground">{obfuscateSecret(webhook.signing_key)}</p>
              <CopyToClipboardButton text={webhook.signing_key} />
            </div>
          </div>

          <div>
            <WebhookDropdown webhook={webhook} />
          </div>
        </li>
      ))}
    </ul>
  )
}
