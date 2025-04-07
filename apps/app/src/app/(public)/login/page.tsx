import { LoginButtons } from '@/components/login-buttons'
import { Logo } from '@/components/logo'
import z from 'zod'
import { ThemeSwitcherWrapper } from './theme-switcher-wrapper'

const searchParamsSchema = z
  .object({
    return_to: z.string().optional(),
  })
  .optional()

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

type Props = {
  searchParams: SearchParams
}

const LoginPage = async ({ searchParams }: Props) => {
  const parsedSearchParams = searchParamsSchema.safeParse(await searchParams)

  return (
    <div className="h-full grid grid-rows-[auto_1fr]">
      <header className="flex items-center justify-between p-8">
        <Logo className="size-10" />

        <ThemeSwitcherWrapper />
      </header>

      <main className="flex items-center justify-center">
        <LoginButtons redirectTo={parsedSearchParams.data?.return_to} />
      </main>
    </div>
  )
}

export default LoginPage
