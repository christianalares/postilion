import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'
import {
  SheetDescription as ShadSheetDescription,
  SheetFooter as ShadSheetFooter,
  SheetHeader as ShadSheetHeader,
  SheetTitle as ShadSheetTitle,
  SheetContent,
} from './sheet-primitive'

type Props = ComponentProps<typeof SheetContent>

export const Sheet = ({ children, className, ...restProps }: Props) => {
  return (
    <SheetContent className={cn('w-[95vw]', className)} {...restProps}>
      {children}
    </SheetContent>
  )
}

export const SheetHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <ShadSheetHeader className={cn('mb-4', className)}>{children}</ShadSheetHeader>
}

export const SheetTitle = ({ children }: { children: React.ReactNode }) => {
  return <ShadSheetTitle className="text-left">{children}</ShadSheetTitle>
}

export const SheetDescription = ({ children }: { children: React.ReactNode }) => {
  return <ShadSheetDescription className="text-left">{children}</ShadSheetDescription>
}

export const SheetFooter = ({ children }: { children: React.ReactNode }) => {
  return <ShadSheetFooter>{children}</ShadSheetFooter>
}
