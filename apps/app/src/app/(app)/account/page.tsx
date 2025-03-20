import { EmailForm, EmailFormSkeleton } from '@/components/forms/email-form'
import { FullNameForm, FullNameFormSkeleton } from '@/components/forms/full-name-form'
import { trpc } from '@/trpc/server'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

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
