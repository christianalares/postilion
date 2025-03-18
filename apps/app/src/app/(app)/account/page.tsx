import { EmailForm, EmailFormSkeleton } from '@/components/settings/email-form'
import { FullNameForm, FullNameFormSkeleton } from '@/components/settings/full-name-form'
import { trpc } from '@/trpc/server'
import { Suspense } from 'react'

const AccountPage = () => {
  trpc.users.me.prefetch()

  return (
    <div className="max-w-4xl space-y-4">
      <Suspense fallback={<FullNameFormSkeleton />}>
        <FullNameForm />
      </Suspense>

      <Suspense fallback={<EmailFormSkeleton />}>
        <EmailForm />
      </Suspense>
    </div>
  )
}

export default AccountPage
