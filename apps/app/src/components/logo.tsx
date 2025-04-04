import { cn } from '@/lib/utils'

type Props = {
  className?: string
}

export const Logo = ({ className }: Props) => {
  return (
    <div className={cn('aspect-square flex items-center justify-center', className)}>
      <p className="font-bold border-2 border-foreground size-8 flex items-center justify-center rounded-full">P</p>
    </div>
  )
}
