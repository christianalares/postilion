import { SettingsSubMenu } from '@/components/settings-sub-menu'

type Props = {
  children: React.ReactNode
}

const TeamSettingsLayout = ({ children }: Props) => {
  return (
    <div>
      <SettingsSubMenu />
      {children}
    </div>
  )
}

export default TeamSettingsLayout
