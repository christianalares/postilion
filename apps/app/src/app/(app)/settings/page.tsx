import { EmailForm } from '@/components/settings/email-form'
import { FullNameForm } from '@/components/settings/full-name-form'

const SettingsPage = () => {
  return (
    <div className="space-y-8">
      <FullNameForm />
      <EmailForm />
    </div>
  )
}

export default SettingsPage
