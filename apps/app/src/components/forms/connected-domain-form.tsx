'use client'

import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useZodForm } from '@/hooks/use-zod-form'
import { trpc } from '@/trpc/client'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Combobox, type ComboboxItem } from '../ui/combobox'

const formSchema = z.object({
  domainId: z.string().optional(),
})

export const ConnectedDomainForm = () => {
  const trpcUtils = trpc.useUtils()

  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()

  const [project] = trpc.projects.getBySlug.useSuspenseQuery({ teamSlug, projectSlug })
  const [domains] = trpc.domains.getForTeam.useSuspenseQuery({ teamSlug })
  const updateProjectMutation = trpc.projects.update.useMutation({
    onSuccess: (updatedProject) => {
      trpcUtils.projects.getBySlug.invalidate({ teamSlug, projectSlug })
      trpcUtils.domains.getForTeam.invalidate({ teamSlug })

      form.reset({
        domainId: updatedProject.domain?.id,
      })

      toast.success('Project updated', {
        description: `${updatedProject.domain?.domain} was connected to ${updatedProject.name}`,
      })
    },
  })

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
          <CardDescription>The domain connecteded to this project.</CardDescription>
        </CardHeader>

        <CardContent className="flex gap-4">
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
