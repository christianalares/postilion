'use client'

import { useTeamSlug } from '@/hooks/use-team-slug'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { pushModal } from './modals'
import { PendingInvites } from './pending-invites'
import { TeamMembers } from './team-members'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

export const TeamManagement = () => {
  const trpc = useTRPC()
  const teamSlug = useTeamSlug()

  const { data: me } = useQuery(trpc.users.me.queryOptions())
  const { data: team } = useQuery(trpc.teams.getBySlug.queryOptions({ teamSlug }))

  const isOwner = team?.members.some((member) => member.user_id === me?.id && member.role === 'OWNER')

  return (
    <Card>
      <Tabs defaultValue="members">
        <CardHeader>
          <div className="flex justify-between h-8">
            <CardTitle>Team members</CardTitle>

            {isOwner && (
              <Button variant="outline" size="sm" onClick={() => pushModal('inviteMemberModal')}>
                Invite member
              </Button>
            )}
          </div>

          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="invites">Invites</TabsTrigger>
          </TabsList>
        </CardHeader>

        <CardContent className="mt-4">
          <TabsContent value="members">
            <TeamMembers />
          </TabsContent>

          <TabsContent value="invites">
            <PendingInvites />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
