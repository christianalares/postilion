'use client'

import { ThemeSwitcherWrapper } from '@/app/(public)/login/theme-switcher-wrapper'
import { CreateTeamForm } from '@/components/forms/create-team-form'
import { Logo } from '@/components/logo'
import { ThreeDBox } from '@/components/ui/three-d-box'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const CreateTeamPage = () => {
  const trpc = useTRPC()
  const router = useRouter()

  const createTeamMutation = useMutation(
    trpc.teams.create.mutationOptions({
      onSuccess: (createdTeam) => {
        toast.success('Team created successfully')

        router.push(`/${createdTeam.slug}`)
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }),
  )

  return (
    <div className="h-full grid grid-rows-[auto_1fr]">
      <header className="flex items-center justify-between p-8">
        <Logo className="size-10" />

        <ThemeSwitcherWrapper />
      </header>

      <main className="flex items-center justify-center">
        <ThreeDBox>
          <h1 className="font-mono">Create a team</h1>

          <p className="text-muted-foreground mt-2">In order to use Postilion, you need to have a team.</p>

          <CreateTeamForm
            className="mt-8"
            hideCancelButton
            isLoading={createTeamMutation.isPending}
            onSubmit={(values) => {
              createTeamMutation.mutate({
                name: values.teamName,
              })
            }}
          />
        </ThreeDBox>
      </main>
    </div>
  )
}

export default CreateTeamPage
