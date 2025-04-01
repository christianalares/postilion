'use client'

import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { trpc } from '@/trpc/client'
import { pushAlert } from '../alerts'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

export const DeleteProjectForm = () => {
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()

  const [me] = trpc.users.me.useSuspenseQuery()
  const [project] = trpc.projects.getBySlug.useSuspenseQuery({ teamSlug, projectSlug })

  const isNotOwner = !project.team.members.some((member) => member.user_id === me.id && member.role === 'OWNER')
  const isLastOwner = !isNotOwner && project.team.members.filter((member) => member.role === 'OWNER').length === 1

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle>Delete project</CardTitle>
        <CardDescription>
          Permanently delete this project and all associated data. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-4">
        {isNotOwner ? (
          <p className="text-muted-foreground">You need to be the owner of the project to delete it.</p>
        ) : isLastOwner ? (
          <p className="text-muted-foreground">
            You are the only owner of this project, please transfer ownership to another user before deleting the
            project.
          </p>
        ) : (
          <Button variant="destructive" type="button" onClick={() => pushAlert('confirmDeleteProject', { project })}>
            Delete project
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export const DeleteProjectFormSkeleton = () => {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle>Delete project</CardTitle>
        <CardDescription>
          Permanently delete this project and all associated data. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-4">
        <Button variant="destructive" type="button" disabled>
          Delete project
        </Button>
      </CardContent>
    </Card>
  )
}
