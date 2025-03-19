import { TeamSettingsSubMenu } from '@/components/sub-menus/team-settings-sub-menu'

const TeamSettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <TeamSettingsSubMenu />

      <div className="mt-8">{children}</div>
    </div>
  )
}

export default TeamSettingsLayout
