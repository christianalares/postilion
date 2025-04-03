import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { teamRoleEnumToLabel } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import type { RouterOutputs } from '@/trpc/routers/_app'
import { ENUMS } from '@postilion/db/enums'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type Props = {
  team: RouterOutputs['teams']['getBySlug']
  member: RouterOutputs['teams']['getBySlug']['members'][number]
}

export const RoleSelect = ({ team, member }: Props) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const editRoleMutation = useMutation(
    trpc.teams.editRole.mutationOptions({
      onMutate: (values) => {
        const previousData = queryClient.getQueryData(trpc.teams.getBySlug.queryKey({ slug: team.slug }))

        queryClient.setQueryData(trpc.teams.getBySlug.queryKey({ slug: team.slug }), (old) => {
          if (!old) {
            return old
          }

          return {
            ...old,
            members: old.members.map((m) => (m.user_id === member.user_id ? { ...m, role: values.role } : m)),
          }
        })

        return { previousData }
      },
      onSuccess: (editedUserOnTeam) => {
        toast.success('User role updated', {
          description: `${editedUserOnTeam.user.name} is now ${teamRoleEnumToLabel(editedUserOnTeam.role)} of this team`,
        })
      },
      onError: (error, _postedData, context) => {
        toast.error('Failed to update user role', {
          description: error.message,
        })

        // Revert the role to the previous value
        queryClient.setQueryData(trpc.teams.getBySlug.queryKey({ slug: team.slug }), context?.previousData)
      },
    }),
  )
  return (
    <Select
      disabled={editRoleMutation.isPending}
      value={member.role}
      onValueChange={(role: keyof typeof ENUMS.TEAM_ROLE_ENUM) => {
        // No need to update if the role doesn't change
        if (member.role === role) {
          return
        }

        editRoleMutation.mutate({
          role,
          teamSlug: team.slug,
          userId: member.user_id,
        })
      }}
    >
      <SelectTrigger size="sm" className="w-28 text-xs font-mono" isLoading={editRoleMutation.isPending}>
        <SelectValue placeholder="Role" />
      </SelectTrigger>

      <SelectContent>
        {Object.values(ENUMS.TEAM_ROLE_ENUM).map((role) => (
          <SelectItem key={role} value={role} className="text-xs font-mono">
            {teamRoleEnumToLabel(role)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
