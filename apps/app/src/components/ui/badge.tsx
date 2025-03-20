import { cn } from '@/lib/utils'
import { type VariantProps, cva } from 'class-variance-authority'

export const badgeVariants = cva('border py-1 px-2 text-xs inline-flex items-center gap-1', {
  variants: {
    variant: {
      default: 'bg-muted/50',
      success: 'bg-success/20 text-success',
      warning: 'bg-warning/20 text-warning',
      destructive: 'bg-destructive/20 text-destructive',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export const badgeLabelVariants = cva('font-mono text-xs', {
  variants: {
    variant: {
      default: 'text-primary/70',
      success: 'text-success/70',
      warning: 'text-warning/70',
      destructive: 'text-destructive/70',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type Props = {
  label?: string
} & VariantProps<typeof badgeVariants> &
  React.ComponentProps<'div'>

export const Badge = ({ className, children, label, variant, ...restProps }: Props) => {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...restProps}>
      {label && <span className={badgeLabelVariants({ variant })}>{label}</span>}
      {children}
    </div>
  )
}
