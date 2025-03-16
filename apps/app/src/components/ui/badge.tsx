import { cn } from '@/lib/utils'

type Props = {
  label?: string
} & React.ComponentProps<'div'>

export const Badge = ({ className, children, label, ...restProps }: Props) => {
  return (
    <div
      className={cn('border py-1 px-2 bg-muted/50 text-xs inline-flex items-center gap-1', className)}
      {...restProps}
    >
      {label && <span className="text-muted-foreground font-mono">{label}</span>}
      {children}
    </div>
  )
}
