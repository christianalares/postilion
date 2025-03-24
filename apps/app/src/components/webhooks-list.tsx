'use client'

import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { trpc } from '@/trpc/client'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { WebhookDropdown } from './webhook-dropdown'

export const WebhooksList = () => {
  const projectSlug = useProjectSlug()
  const teamSlug = useTeamSlug()
  const [webhooks] = trpc.webhooks.getForProject.useSuspenseQuery({ projectSlug, teamSlug })

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
              <p className="font-mono text-sm">{webhook.url}</p>
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
