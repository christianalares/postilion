import { EmailForm, EmailFormSkeleton } from '@/components/forms/email-form'
import { FullNameForm, FullNameFormSkeleton } from '@/components/forms/full-name-form'
import { prefetch, trpc } from '@/trpc/server'
import { Suspense } from 'react'
import { AccountHeader } from './_header'

export const dynamic = 'force-dynamic'

const AccountPage = () => {
  prefetch(trpc.users.me.queryOptions())

  return (
    <>
      <AccountHeader />

      <div className="max-w-4xl space-y-4">
        <Suspense fallback={<FullNameFormSkeleton />}>
          <FullNameForm />
        </Suspense>

        <Suspense fallback={<EmailFormSkeleton />}>
          <EmailForm />
        </Suspense>
      </div>
    </>
  )
}

export default AccountPage
