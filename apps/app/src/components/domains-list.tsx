'use client'

import { useTeamSlug } from '@/hooks/use-team-slug'
import { trpc } from '@/trpc/client'
import Link from 'next/link'
import { toast } from 'sonner'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

export const DomainsList = () => {
  const trpcUtils = trpc.useUtils()
  const teamSlug = useTeamSlug()

  const [domains] = trpc.domains.getForTeam.useSuspenseQuery({ teamSlug })

  const createDomainMutation = trpc.domains.create.useMutation({
    onSuccess: (createdDomain) => {
      trpcUtils.domains.getForTeam.invalidate({ teamSlug })
      toast.success(`Domain \"${createdDomain.domain}\" created`)
    },
  })

  if (domains.length === 0) {
    return (
      <div className="space-y-4">
        <p>You don't have any domains yet.</p>
        <Button
          onClick={() => {
            createDomainMutation.mutate({
              domain: 'seventy-seven.app',
              teamSlug,
            })
          }}
          loading={createDomainMutation.isPending}
        >
          Add Domain
        </Button>
      </div>
    )
  }

  return (
    <div>
      <ul className="flex flex-wrap gap-4">
        {domains.map((domain) => {
          const isVerified = !!(domain.forward?.has_mx_record && domain.forward?.has_txt_record)

          return (
            <li key={domain.id}>
              <Link
                href={`/${teamSlug}/settings/domains/${domain.domain}`}
                className="relative px-8 h-32 flex flex-col justify-center border hover:border-accent-foreground/30"
              >
                {isVerified ? (
                  <Badge className="absolute top-2 left-2 bg-green-500/20">Verified</Badge>
                ) : (
                  <Badge className="absolute top-2 left-2 bg-destructive/20">Not completed</Badge>
                )}
                {domain.domain}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
