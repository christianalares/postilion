'use client'

import { useDomain } from '@/hooks/use-domain'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
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
        <h1 className="text-2xl font-bold font-mono">{domain.domain}</h1>

        {!isVerified && (
          <Button
            onClick={() => {
              verifyMutation.mutate({
                domain: domain.domain,
              })
            }}
            loading={verifyMutation.isPending}
          >
            Verify
          </Button>
        )}
      </div>
      <Table className="mt-4">
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
            <TableCell className="font-mono">mx1.forwardemail.net</TableCell>
            <TableCell>
              {domain.has_mx_record ? <Badge className="bg-green-500/20">Verified</Badge> : <Badge>Not started</Badge>}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono">{dnsValue}</TableCell>
            <TableCell className="font-medium">MX</TableCell>
            <TableCell>10</TableCell>
            <TableCell className="font-mono">mx2.forwardemail.net</TableCell>
            <TableCell>
              {domain.has_mx_record ? <Badge className="bg-green-500/20">Verified</Badge> : <Badge>Not started</Badge>}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono">{dnsValue}</TableCell>
            <TableCell className="font-medium">TXT</TableCell>
            <TableCell />
            <TableCell className="font-mono">{`forward-email-site-verification=${domain.verification_record}`}</TableCell>
            <TableCell>
              {domain.has_txt_record ? <Badge className="bg-green-500/20">Verified</Badge> : <Badge>Not started</Badge>}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
