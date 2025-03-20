'use client'

import { useDomain } from '@/hooks/use-domain'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { DomainDropdown } from './domain-dropdown'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { CopyToClipboardButton } from './ui/copy-to-clipboard-button'
import { Icon } from './ui/icon'
import { Skeleton } from './ui/skeleton'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

export const DomainDetails = () => {
  const trpcUtils = trpc.useUtils()
  const domainParam = useDomain()

  const [domain] = trpc.domains.getByDomain.useSuspenseQuery({ domain: domainParam })
  const verifyMutation = trpc.domains.verify.useMutation({
    onSuccess: ({ success }) => {
      trpcUtils.domains.getByDomain.invalidate({ domain: domain.domain })

      if (success) {
        toast.success('Domain verified')
      } else {
        toast.error('Domain verification failed')
      }
    },
    onError: () => {
      toast.error('Domain verification failed')
    },
  })

  const dnsValue = (domain.domain.split('.').length > 2 ? domain.domain.split('.')[0] : '@') ?? ''
  const isVerified = domain.has_mx_record && domain.has_txt_record

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-mono flex items-center gap-2">
          <Icon name="globe" strokeWidth={1} />
          {domain.domain}
        </h1>

        <div className="flex items-center gap-2">
          {!isVerified && (
            <Button
              size="sm"
              onClick={() => {
                verifyMutation.mutate({
                  domain: domain.domain,
                })
              }}
              loading={verifyMutation.isPending}
            >
              Verify DNS records
            </Button>
          )}
          <DomainDropdown domainId={domain.id} />
        </div>
      </div>

      <Table className="mt-8">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-mono">{dnsValue}</TableCell>
            <TableCell className="font-medium">MX</TableCell>
            <TableCell>10</TableCell>
            <TableCell className="font-mono">
              <div className="flex items-center gap-2">
                mx1.forwardemail.net
                <CopyToClipboardButton text="mx1.forwardemail.net" />
              </div>
            </TableCell>
            <TableCell>
              {domain.has_mx_record ? (
                <Badge variant="success">Verified</Badge>
              ) : (
                <Badge variant="warning">Not started</Badge>
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono">{dnsValue}</TableCell>
            <TableCell className="font-medium">MX</TableCell>
            <TableCell>10</TableCell>
            <TableCell className="font-mono">
              <div className="flex items-center gap-2">
                mx2.forwardemail.net
                <CopyToClipboardButton text="mx2.forwardemail.net" />
              </div>
            </TableCell>
            <TableCell>
              {domain.has_mx_record ? (
                <Badge variant="success">Verified</Badge>
              ) : (
                <Badge variant="warning">Not started</Badge>
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono">{dnsValue}</TableCell>
            <TableCell className="font-medium">TXT</TableCell>
            <TableCell />
            <TableCell className="font-mono">
              <div className="flex items-center gap-2">
                {`forward-email-site-verification=${domain.verification_record}`}
                <CopyToClipboardButton text={`forward-email-site-verification=${domain.verification_record}`} />
              </div>
            </TableCell>
            <TableCell>
              {domain.has_txt_record ? (
                <Badge variant="success">Verified</Badge>
              ) : (
                <Badge variant="warning">Not started</Badge>
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

export const DomainDetailsSkeleton = () => {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-mono flex items-center gap-2">
          <Icon name="globe" strokeWidth={1} />
          <Skeleton className="w-48 h-8" />
        </h1>

        <Skeleton className="w-[150px] h-8" />
      </div>

      <Table className="mt-8">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow>
            <TableCell className="h-11">
              <Skeleton className="w-full h-3" />
            </TableCell>

            <TableCell className="h-11">
              <Skeleton className="w-full h-3" />
            </TableCell>

            <TableCell className="h-11">
              <Skeleton className="w-full h-3" />
            </TableCell>

            <TableCell className="h-11">
              <Skeleton className="w-[337px] h-3" />
            </TableCell>

            <TableCell className="h-11">
              <Skeleton className="w-full h-3" />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="h-11">
              <Skeleton className="w-full h-3" />
            </TableCell>

            <TableCell className="h-11">
              <Skeleton className="w-full h-3" />
            </TableCell>

            <TableCell className="h-11">
              <Skeleton className="w-full h-3" />
            </TableCell>

            <TableCell className="h-11">
              <Skeleton className="w-[337px] h-3" />
            </TableCell>

            <TableCell className="h-11">
              <Skeleton className="w-full h-3" />
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="h-11">
              <Skeleton className="w-full h-3" />
            </TableCell>

            <TableCell className="h-11">
              <Skeleton className="w-full h-3" />
            </TableCell>

            <TableCell className="h-11">
              <Skeleton className="w-full h-3" />
            </TableCell>

            <TableCell className="h-11">
              <Skeleton className="w-[337px] h-3" />
            </TableCell>

            <TableCell className="h-11">
              <Skeleton className="w-full h-3" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
