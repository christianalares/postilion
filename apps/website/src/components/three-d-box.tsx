import { cn } from '@/lib/utils'

type Props = React.ComponentProps<'div'>

export const ThreeDBox = ({ children, className, ...props }: Props) => {
  return (
    <div
      className={cn(
        'border p-8 bg-background relative after:absolute after:inset-0 after:translate-3 after:border after:border-border after:bg-foreground/2 after:z-[-1]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
