import { cn } from '@/lib/utils'
import { Check, CircleCheck, Loader2, type LucideProps } from 'lucide-react'

const icons = {
  check: Check,
  checkCircle: CircleCheck,
  loader: Loader2,
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
