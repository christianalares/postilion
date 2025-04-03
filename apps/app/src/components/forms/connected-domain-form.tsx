'use client'
import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useZodForm } from '@/hooks/use-zod-form'
import { useTRPC } from '@/trpc/client'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { pushModal } from '../modals'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Combobox, type ComboboxItem } from '../ui/combobox'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

const formSchema = z.object({
  domainId: z.string().optional(),
})

export const ConnectedDomainForm = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()

  const { data: project } = useSuspenseQuery(trpc.projects.getBySlug.queryOptions({ teamSlug, projectSlug }))
  const { data: domains } = useSuspenseQuery(trpc.domains.getForTeam.queryOptions({ teamSlug }))

  const updateProjectMutation = useMutation(
    trpc.projects.update.mutationOptions({
      onSuccess: (updatedProject) => {
        queryClient.invalidateQueries(trpc.projects.getBySlug.queryFilter({ teamSlug, projectSlug }))
        queryClient.invalidateQueries(trpc.domains.getForTeam.queryFilter({ teamSlug }))

        form.reset({
          domainId: updatedProject.domain?.id,
        })

        toast.success('Project updated', {
          description: `${updatedProject.domain?.domain} was connected to ${updatedProject.name}`,
        })
      },
    }),
  )

  const comboboxItems: ComboboxItem[] = domains.map((domain) => ({
    value: domain.id,
    label: domain.domain,
    disabled: domain.project?.name ? `Already connected to "${domain.project.name}"` : false,
  }))

  const form = useZodForm(formSchema, {
    defaultValues: {
      domainId: project.domain?.id,
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    if (!values.domainId) {
      return
    }

    updateProjectMutation.mutate({
      teamSlug,
      projectSlug,
      data: {
        domainId: values.domainId,
      },
    })
  })

  const selectedDomainId = form.watch('domainId')
  const selectedDomain = comboboxItems.find((item) => item.value === selectedDomainId)

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Connected domain</CardTitle>
          <CardDescription>
            {domains.length === 0
              ? "You don't have any domains configured for this team yet"
              : 'The domain connecteded to this project'}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex gap-4">
          {domains.length === 0 ? (
            <>
              <Button type="button" onClick={() => pushModal('addDomainModal')}>
                Add domain
              </Button>
            </>
          ) : (
            <>
              <Controller
                control={form.control}
                name="domainId"
                render={({ field }) => {
                  return (
                    <Combobox
                      searchPlaceholder="Search domain..."
                      label="Select domain"
                      emptyMessage="No domains found."
                      popover={{ content: { align: 'start', style: { width: 'auto' } } }}
                      items={comboboxItems}
                      selectedItem={selectedDomain}
                      onSelect={(item) => {
                        field.onChange(item.value)
                      }}
                    />
                  )
                }}
              />

              <Button
                type="submit"
                disabled={!selectedDomain || selectedDomain.value === project.domain?.id}
                loading={updateProjectMutation.isPending}
              >
                Connect
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </form>
  )
}

export const ConnectedDomainFormSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected domains</CardTitle>
        <CardDescription>The domain connecteded to this project.</CardDescription>
      </CardHeader>

      <CardContent className="flex gap-4">
        <Combobox
          label="Loading..."
          popover={{ content: { align: 'start', style: { width: 'auto' } } }}
          items={[{ value: '', label: '' }]}
          // selectedItem={selectedDomain}
          onSelect={() => {}}
          loading
        />

        <Button type="button" disabled>
          Connect
        </Button>
      </CardContent>
    </Card>
  )
}
