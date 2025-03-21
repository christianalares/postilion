'use client'

import { Input } from '@/components/ui/input'
import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useZodForm } from '@/hooks/use-zod-form'
import { trpc } from '@/trpc/client'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { FormCard, FormCardSkeleton } from '../form-card'
import { Combobox, ComboboxItem } from '../ui/combobox'

const formSchema = z.object({
  projectName: z.string(),
})

export const ConnectedDomainForm = () => {
  // const trpcUtils = trpc.useUtils()

  // const [project] = trpc.projects.getBySlug.useSuspenseQuery({ teamSlug, projectSlug })

  // const updateProjectMutation = trpc.projects.update.useMutation({
  //   onSuccess: () => {
  //     toast.success('Project name updated')
  //     trpcUtils.projects.getBySlug.invalidate({ teamSlug, projectSlug })
  //   },
  //   onError: (error) => {
  //     toast.error('Error updating project name', {
  //       description: error.message,
  //     })
  //   },
  // })

  // const form = useZodForm(formSchema, {
  //   defaultValues: {
  //     projectName: project.name,
  //   },
  // })

  // const handleSubmit = form.handleSubmit(async (values) => {
  //   updateProjectMutation.mutate({
  //     teamSlug,
  //     projectSlug,
  //     data: {
  //       name: values.projectName,
  //     },
  //   })
  // })

  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()

  const [project] = trpc.projects.getBySlug.useSuspenseQuery({ teamSlug, projectSlug })
  const [domains] = trpc.domains.getForTeam.useSuspenseQuery({ teamSlug })
  const updateProjectMutation = trpc.projects.update.useMutation()

  const comboboxItems = domains.map((domain) => ({
    value: domain.id,
    label: domain.domain,
  }))

  const selectedDomainInList = comboboxItems.find((item) => item.value === project.domain?.id)

  const [selectedDomain, setSelectedDomain] = useState<ComboboxItem | undefined>(selectedDomainInList)

  // TODO: Fix a better abstraction of the FormCard component
  return (
    <FormCard
      handleSubmit={() => {
        if (!selectedDomain) {
          return
        }

        updateProjectMutation.mutate({
          teamSlug,
          projectSlug,
          data: {
            domainId: selectedDomain.value,
          },
        })
      }}
      label="Connected domains"
      labelId="connected-domains"
      description="The domain connecteded to this project."
      disabled={!selectedDomain || selectedDomain.value === project.domain?.id}
      loading={updateProjectMutation.isPending}
    >
      {comboboxItems.length === 0 ? (
        <p>You have no domains connected to this project.</p>
      ) : (
        <div className="flex gap-4 w-full">
          <div className="flex-1">
            <Combobox
              searchPlaceholder="Search domain..."
              label="Select domain"
              emptyMessage="No domains found."
              popover={{ content: { align: 'start', style: { width: 'auto' } } }}
              items={comboboxItems}
              selectedItem={selectedDomain}
              onSelect={(item) => {
                setSelectedDomain(item)
              }}
            />
          </div>
        </div>
      )}
    </FormCard>
  )
}

export const ConnectedDomainFormSkeleton = () => {
  return (
    <FormCardSkeleton
      label="Connected domains"
      labelId="connected-domains"
      description="The domain connecteded to this project."
    />
  )
}
