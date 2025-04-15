import { cn } from '@/lib/utils'

type Props = {
  className?: string
}
export const HR = ({ className }: Props) => {
  return (
    <div
      className={cn(
        [
          'w-full h-4',
          'bg-[repeating-linear-gradient(-50deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_6px)]',
          'dark:bg-[repeating-linear-gradient(-50deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_6px)]',
        ],
        className,
      )}
    />
  )
}
