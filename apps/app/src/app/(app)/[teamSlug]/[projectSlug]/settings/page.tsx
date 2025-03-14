import { EmailForm, EmailFormSkeleton } from '@/components/settings/email-form'
import { FullNameForm, FullNameFormSkeleton } from '@/components/settings/full-name-form'
import { Suspense } from 'react'

const SettingsPage = () => {
  return (
    <div className="space-y-8">
      <Suspense fallback={<FullNameFormSkeleton />}>
        <FullNameForm />
      </Suspense>

      <Suspense fallback={<EmailFormSkeleton />}>
        <EmailForm />
      </Suspense>
    </div>
  )
}

export default SettingsPage
