import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  ChevronsUpDown,
  CircleAlert,
  CircleCheck,
  Clipboard,
  FileText,
  Globe,
  Home,
  Image,
  LayoutDashboard,
  Loader2,
  type LucideProps,
  MessageCircle,
  Monitor,
  Moon,
  MoreVertical,
  Pencil,
  Plus,
  Settings,
  Sun,
  Trash2,
  User,
  Webhook,
  XCircle,
} from 'lucide-react'

const Github = (props: React.ComponentProps<'svg'>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" fill="none" {...props}>
      <title>Github</title>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M11.21.22C5.412.22.71 5.038.71 10.984c0 4.757 3.009 8.792 7.18 10.216.525.1.718-.234.718-.518 0-.257-.01-1.105-.014-2.005-2.921.652-3.538-1.27-3.538-1.27-.477-1.244-1.165-1.575-1.165-1.575-.953-.668.071-.655.071-.655 1.055.076 1.61 1.11 1.61 1.11.936 1.646 2.456 1.17 3.056.895.094-.696.366-1.171.666-1.44-2.332-.272-4.784-1.195-4.784-5.32 0-1.176.41-2.136 1.082-2.89-.109-.271-.468-1.366.102-2.85 0 0 .882-.288 2.888 1.105a9.833 9.833 0 0 1 2.628-.363 9.857 9.857 0 0 1 2.63.363c2.005-1.393 2.885-1.104 2.885-1.104.572 1.483.212 2.578.103 2.849.674.754 1.08 1.714 1.08 2.89 0 4.135-2.455 5.045-4.794 5.312.377.334.712.989.712 1.993 0 1.44-.011 2.6-.011 2.955 0 .286.188.622.72.516 4.17-1.425 7.175-5.459 7.175-10.214 0-5.946-4.7-10.766-10.5-10.766Z"
        clipRule="evenodd"
      />
      <path
        fill="currentColor"
        d="M4.687 15.677c-.023.053-.105.07-.18.033-.076-.036-.119-.109-.094-.162.023-.055.105-.07.18-.034.077.035.12.109.094.163Zm.425.486c-.05.047-.148.025-.214-.05-.069-.075-.082-.176-.03-.224.05-.047.146-.025.214.05.07.076.083.176.03.224Zm.414.62c-.064.046-.17.003-.234-.093-.065-.096-.065-.21.001-.257.065-.046.17-.004.235.09.064.098.064.213-.002.26Zm.568.599c-.058.065-.18.047-.27-.041-.092-.087-.117-.21-.06-.275.058-.066.182-.047.272.04.091.087.119.211.058.276Zm.782.348c-.026.084-.143.122-.262.087-.12-.037-.197-.136-.173-.221.025-.085.143-.125.263-.087.119.037.197.135.172.22Zm.86.064c.002.09-.098.163-.223.164-.126.003-.228-.069-.229-.156 0-.09.099-.162.224-.165.125-.002.228.07.228.157Zm.799-.139c.015.086-.072.175-.196.199-.122.023-.235-.03-.25-.116-.015-.09.073-.178.195-.201.124-.022.235.03.25.118Z"
      />
    </svg>
  )
}

const Google = (props: React.ComponentProps<'svg'>) => {
  return (
    <svg viewBox="0 0 256 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" {...props}>
      <title>Google</title>
      <path
        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
        fill="#4285F4"
      />
      <path
        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
        fill="#34A853"
      />
      <path
        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
        fill="#FBBC05"
      />
      <path
        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
        fill="#EB4335"
      />
    </svg>
  )
}

const icons = {
  home: Home,
  github: Github,
  google: Google,
  settings: Settings,
  moon: Moon,
  sun: Sun,
  monitor: Monitor,
  plus: Plus,
  chevronDown: ChevronDown,
  chevronsUpDown: ChevronsUpDown,
  arrowLeft: ArrowLeft,
  check: Check,
  loader: Loader2,
  pencil: Pencil,
  circleAlert: CircleAlert,
  message: MessageCircle,
  checkCircle: CircleCheck,
  xCircle: XCircle,
  user: User,
  calendar: Calendar,
  webhook: Webhook,
  globe: Globe,
  clipboard: Clipboard,
  dotsVertical: MoreVertical,
  trash: Trash2,
  document: FileText,
  image: Image,
  dashboard: LayoutDashboard,
}

export type IconName = keyof typeof icons

type IconProps = {
  name: IconName
  className?: string
} & LucideProps

export const Icon = ({ name, className, ...restProps }: IconProps) => {
  const IconComponent = icons[name]

  return <IconComponent className={cn(className)} {...restProps} />
}
