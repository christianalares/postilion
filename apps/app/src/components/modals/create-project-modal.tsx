'use client'

import { Modal, ModalDescription, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useZodForm } from '@/hooks/use-zod-form'
import { trpc } from '@/trpc/client'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'
import { popModal } from '.'
import { Button } from '../ui/button'
import { ErrorMessage } from '../ui/error-message'
import { Input } from '../ui/input'

const formSchema = z.object({
  projectName: z.string().min(3, { message: 'Project name must be at least 3 characters long' }),
})

export const CreateProjectModal = () => {
  const form = useZodForm(formSchema)
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const pathname = usePathname()
  const teamSlug = useTeamSlug()

  const createProjectMutation = trpc.projects.create.useMutation({
    onSuccess: (createdProject) => {
      const newPath = pathname
        .split('/')
        .map((segment) => (segment === projectSlug ? createdProject.slug : segment))
        .join('/')

      popModal('createProjectModal')
      toast.success('Project created successfully')

      router.push(newPath)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = form.handleSubmit((data) => {
    createProjectMutation.mutate({
      name: data.projectName,
      teamSlug: teamSlug,
    })
  })

  return (
    <Modal>
      <ModalHeader>
        <ModalTitle>Create project</ModalTitle>
        <ModalDescription>Create a new project</ModalDescription>
      </ModalHeader>

      <form className="flex flex-col" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2">
          <span>Project name</span>
          <Input placeholder="Enter a project name" {...form.register('projectName')} />
        </label>

        <ErrorMessage message={form.formState.errors.projectName?.message} />

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => popModal('createProjectModal')}
            disabled={createProjectMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" loading={createProjectMutation.isPending}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  )
}
