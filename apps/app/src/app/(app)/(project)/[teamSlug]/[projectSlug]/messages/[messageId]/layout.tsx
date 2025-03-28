import { Icon } from '@/components/ui/icon'
import Link from 'next/link'

type Params = Promise<{
  teamSlug: string
  projectSlug: string
}>
type Props = {
  children: React.ReactNode
  params: Params
}

const MessageLayout = async ({ children, params }: Props) => {
  const { teamSlug, projectSlug } = await params

  return (
    <div>
      <Link href={`/${teamSlug}/${projectSlug}/messages`} className="inline-flex items-center gap-2 group">
        <Icon
          name="arrowLeft"
          className="text-foreground group-hover:-translate-x-1 transition-transform duration-500"
        />
        <span className="text-muted-foreground">Back to messages</span>
      </Link>

      <div className="mt-8">{children}</div>
    </div>
  )
}

export default MessageLayout
