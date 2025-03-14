import { SettingsSubMenu } from '@/components/settings/settings-sub-menu'

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <SettingsSubMenu />

      <div className="max-w-4xl mt-8">{children}</div>
    </div>
  )
}

export default SettingsLayout
