'use client'
import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useTRPC } from '@/trpc/client'
import { Badge } from './ui/badge'
import { CopyToClipboardButton } from './ui/copy-to-clipboard-button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { WebhookDropdown } from './webhook-dropdown'

import { useSuspenseQuery } from '@tanstack/react-query'

export const WebhooksList = () => {
  const trpc = useTRPC()
  const projectSlug = useProjectSlug()
  const teamSlug = useTeamSlug()
  const { data: webhooks } = useSuspenseQuery(trpc.webhooks.getForProject.queryOptions({ projectSlug, teamSlug }))

  if (webhooks.length === 0) {
    return <p>You don't have any webhooks yet.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Method</TableHead>
          <TableHead>URL</TableHead>
          <TableHead align="right">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {webhooks.map((webhook) => (
          <TableRow key={webhook.id}>
            <TableCell>
              <Badge>{webhook.method}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm whitespace-normal">{webhook.url}</p>
                <CopyToClipboardButton text={webhook.url} />
              </div>
            </TableCell>
            <TableCell align="right">
              <WebhookDropdown webhook={webhook} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
