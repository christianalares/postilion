import { LoginButtons } from '@/components/login-buttons'
import z from 'zod'

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
    <div>
      <LoginButtons redirectTo={parsedSearchParams.data?.return_to} />
    </div>
  )
}

export default LoginPage
