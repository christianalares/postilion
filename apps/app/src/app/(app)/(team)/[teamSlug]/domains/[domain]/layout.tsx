import { Icon } from '@/components/ui/icon'
import Link from 'next/link'

type Params = Promise<{
  teamSlug: string
}>

type Props = {
  children: React.ReactNode
  params: Params
}

const DomainSettingsLayout = async ({ children, params }: Props) => {
  const { teamSlug } = await params

  return (
    <div>
      <Link href={`/${teamSlug}/domains`} className="inline-flex items-center gap-2 group text-muted-foreground">
        <Icon name="arrowLeft" className="group-hover:-translate-x-1 transition-transform duration-500" />
        Back to domains
      </Link>

      <div className="mt-8">{children}</div>
    </div>
  )
}

export default DomainSettingsLayout
