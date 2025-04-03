import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Spinner } from './spinner'

const buttonVariants = cva(
  // disabled:pointer-events-none
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs [&:not(:disabled)]:hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs [&:not(:disabled)]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-input/20 shadow-xs [&:not(:disabled)]:hover:bg-accent [&:not(:disabled)]:hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs [&:not(:disabled)]:hover:bg-secondary/80',
        ghost:
          '[&:not(:disabled)]:hover:bg-accent [&:not(:disabled)]:hover:text-accent-foreground [&:not(:disabled)]:dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 [&:not(:disabled)]:hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-6',
      },
      loading: {
        true: 'cursor-not-allowed',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  loading,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  if (loading) {
    return (
      <button
        type="button"
        className={cn('relative overflow-hidden', buttonVariants({ variant, size, loading }), className)}
        disabled
        {...props}
      >
        <span className="absolute inset-0 bg-background/70 flex items-center justify-center text-muted-foreground">
          <Spinner className="size-5 text-foreground" />
          <span className="sr-only">Loading</span>
        </span>

        {children}
      </button>
    )
  }

  return (
    <Comp data-slot="button" className={cn(buttonVariants({ variant, size, loading, className }))} {...props}>
      {children}
    </Comp>
  )
}

export { Button, buttonVariants }
