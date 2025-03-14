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
