'use client'

import { pushModal } from './modals'
import { PendingInvites } from './pending-invites'
import { TeamMembers } from './team-members'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

export const TeamManagement = () => {
  return (
    <Card>
      <Tabs defaultValue="members">
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle>Team members</CardTitle>

            <Button variant="outline" size="sm" onClick={() => pushModal('inviteMemberModal')}>
              Invite member
            </Button>
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
