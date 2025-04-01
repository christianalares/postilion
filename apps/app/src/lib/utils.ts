import type { MESSAGE_STATUS_ENUM, TEAM_ROLE_ENUM } from '@postilion/db'
import { type ClassValue, clsx } from 'clsx'
import { customAlphabet } from 'nanoid'
import slugify from 'slugify'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const createSlug = (str: string) => {
  return slugify(str, {
    lower: true,
    strict: true,
    locale: 'en',
  })
}

export const createShortId = () => {
  const createId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8)

  return createId()
}

export const formatMessageStatus = (status: MESSAGE_STATUS_ENUM) => {
  switch (status) {
    case 'PENDING':
      return 'Pending'
    case 'PROCESSING':
      return 'Processing'
    case 'COMPLETED':
      return 'Completed'
    case 'FAILED':
      return 'Failed'
    default: {
      const exhaustiveCheck: never = status
      return exhaustiveCheck
    }
  }
}

export const teamRoleEnumToLabel = (role: TEAM_ROLE_ENUM) => {
  switch (role) {
    case 'OWNER':
      return 'Owner'
    case 'MEMBER':
      return 'Member'
    default: {
      const exhaustiveCheck: never = role
      return exhaustiveCheck
    }
  }
}
