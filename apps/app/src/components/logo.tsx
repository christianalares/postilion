import { cn } from '@/lib/utils'

type Props = {
  className?: string
}

export const Logo = ({ className }: Props) => {
  return (
    <div className={cn('aspect-squareflex items-center justify-center', className)}>
      <p className="text-2xl font-bold border-2 border-foreground size-10 flex items-center justify-center rounded-full">
        P
      </p>
    </div>
  )
}
