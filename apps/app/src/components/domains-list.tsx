'use client'

import { useTeamSlug } from '@/hooks/use-team-slug'
import { trpc } from '@/trpc/client'
import Link from 'next/link'
import { toast } from 'sonner'
import { DomainDropdown } from './domain-dropdown'
import { Badge } from './ui/badge'
import { Icon } from './ui/icon'

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
    return <p>You don't have any domains yet.</p>
  }

  return (
    <div>
      <ul className="flex flex-wrap gap-4">
        {domains.map((domain) => {
          const isVerified = !!(domain.forward?.has_mx_record && domain.forward?.has_txt_record)

          return (
            <li
              key={domain.id}
              className="flex flex-col gap-4 p-4 border has-[.domain-link:hover]:border-accent-foreground/30 group"
            >
              <div className="flex justify-between items-center gap-16">
                {isVerified ? (
                  <Badge label="DNS:" variant="success">
                    Verified
                  </Badge>
                ) : (
                  <Badge label="DNS:" variant="warning">
                    Not started
                  </Badge>
                )}

                <DomainDropdown domain={{ id: domain.id, projectName: domain.project?.name }} />
              </div>

              <Link
                href={`/${teamSlug}/settings/domains/${domain.domain}`}
                className="domain-link w-max hover:[&:has(*)]:border-accent-foreground/30"
              >
                <span className="font-mono">{domain.domain}</span>
              </Link>

              {!!domain.project && (
                <Link
                  href={`/${teamSlug}/${domain.project.slug}`}
                  className="flex items-center gap-2 font-mono text-xs group"
                >
                  <Icon name="home" className="size-4" strokeWidth={1} />
                  <span className="group-hover:underline underline-offset-4 text-muted-foreground">
                    {domain.project.name}
                  </span>
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
