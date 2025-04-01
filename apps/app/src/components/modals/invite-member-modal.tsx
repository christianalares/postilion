import { useTeamSlug } from '@/hooks/use-team-slug'
import { useZodForm } from '@/hooks/use-zod-form'
import { teamRoleEnumToLabel } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { ENUMS } from '@postilion/db/enums'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { popModal } from '.'
import { Button } from '../ui/button'
import { ErrorMessage } from '../ui/error-message'
import { Input } from '../ui/input'
import { Modal, ModalDescription, ModalHeader, ModalTitle } from '../ui/modal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  role: z.nativeEnum(ENUMS.TEAM_ROLE_ENUM),
})

export const InviteMemberModal = () => {
  const trpcUtils = trpc.useUtils()
  const teamSlug = useTeamSlug()

  const inviteMutation = trpc.invites.create.useMutation({
    onSuccess: (data) => {
      trpcUtils.invites.getForTeam.invalidate({ teamSlug })
      popModal('inviteMemberModal')

      toast.success('Invite sent', {
        description: `Invite sent to ${data.email}`,
      })
    },
    onError: (error) => {
      if (error.message === 'MEMBER_ALREADY_EXISTS') {
        toast.error('Already a member', {
          description: 'That user is already a member of this team',
        })
      } else if (error.message === 'INVITE_ALREADY_EXISTS') {
        toast.error('Invite already sent', {
          description: 'That user has already been invited to this team',
        })
      } else {
        toast.error(error.message)
      }
    },
  })

  const form = useZodForm(formSchema, {
    defaultValues: {
      role: 'MEMBER',
    },
  })

  const handleSubmit = form.handleSubmit((values) => {
    inviteMutation.mutate({
      teamSlug,
      email: values.email,
      role: values.role,
    })
  })

  return (
    <Modal>
      <ModalHeader>
        <ModalTitle>Invite member</ModalTitle>
        <ModalDescription>Invite a new member to your team</ModalDescription>
      </ModalHeader>

      <form className="flex flex-col" onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <label className="flex flex-col gap-2 flex-1">
            <span>Email</span>
            <Input placeholder="email@example.com" {...form.register('email')} />
          </label>

          <label className="flex flex-col gap-2 w-32">
            <span>Role</span>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>

                  <SelectContent>
                    {Object.values(ENUMS.TEAM_ROLE_ENUM).map((role) => (
                      <SelectItem key={role} value={role}>
                        {teamRoleEnumToLabel(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </label>
        </div>

        <ErrorMessage message={form.formState.errors.email?.message} />

        <div className="flex justify-end gap-2 mt-8">
          <Button
            variant="outline"
            type="button"
            onClick={() => popModal('inviteMemberModal')}
            disabled={inviteMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" loading={inviteMutation.isPending}>
            Send invite
          </Button>
        </div>
      </form>
    </Modal>
  )
}
