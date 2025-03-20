'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Button } from './button'
import { Icon } from './icon'
import { TooltipContent, TooltipTrigger } from './tooltip'
import { Tooltip } from './tooltip'
import { TooltipProvider } from './tooltip'

type Props = {
  text: string
}

const MotionIcon = motion.create(Icon)

export const CopyToClipboardButton = ({ text }: Props) => {
  const [isCopied, setIsCopied] = useState(false)

  const handleClick = () => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)

    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="secondary" size="icon-sm" onClick={handleClick} className="rounded-sm">
            <AnimatePresence mode="popLayout" initial={false}>
              <MotionIcon
                key={isCopied.toString()}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                name={isCopied ? 'check' : 'clipboard'}
                className={cn('absolute', isCopied ? 'text-success' : 'text-muted-foreground')}
              />
            </AnimatePresence>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" showArrow>
          <p>{isCopied ? 'Copied' : 'Copy to clipboard'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
