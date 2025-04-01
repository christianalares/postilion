'use server'

import { cookies } from 'next/headers'

export const setInviteCookie = async (inviteCode: string) => {
  const cookieStore = await cookies()

  cookieStore.set('invite-code', inviteCode)
}
