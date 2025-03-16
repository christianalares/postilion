import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { Input } from './ui/input'

type Props = {
  handleSubmit: () => void
  label: string
  labelId: string
  description: string
  loading?: boolean
  children: React.ReactNode
  variant?: 'default' | 'destructive'
  ctaText?: string
}

export const FormCard = ({
  handleSubmit,
  label,
  labelId,
  description,
  loading,
  children,
  variant = 'default',
  ctaText = 'Save',
}: Props) => {
  return (
    <form
      onSubmit={handleSubmit}
      className={cn('border p-6', {
        'border-red-400 dark:border-red-700': variant === 'destructive',
      })}
    >
      <label htmlFor={labelId}>{label}</label>
      <p className="text-muted-foreground mt-2">{description}</p>

      <div className="flex items-center gap-4 mt-4">
        {children}
        <Button type="submit" loading={loading} variant={variant}>
          {ctaText}
        </Button>
      </div>
    </form>
  )
}

type FormCardSkeletonProps = Omit<Props, 'handleSubmit' | 'children' | 'loading'>

export const FormCardSkeleton = ({ label, labelId, description }: FormCardSkeletonProps) => {
  return (
    <div className="border p-6">
      <label htmlFor={labelId}>{label}</label>
      <p className="text-muted-foreground mt-2">{description}</p>

      <div className="flex items-center gap-4 mt-4">
        <Input disabled placeholder="Loading..." id={labelId} className="animate-pulse" />
        <Button type="button" disabled className="cursor-not-allowed">
          Save
        </Button>
      </div>
    </div>
  )
}
