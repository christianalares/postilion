'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Icon } from '../ui/icon'
import { Skeleton } from '../ui/skeleton'
import { Spinner } from '../ui/spinner'

interface Message {
  key: string
  status: 'SUCCESS' | 'PENDING'
  layout: {
    headers: string[]
    lines: string[]
  }
}

let messageCounter = 6 // Start after initial messages

const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const getRandomWidth = () => {
  const widths = ['w-1/5', 'w-2/5', 'w-3/5', 'w-4/5'] as const
  return widths[Math.floor(Math.random() * widths.length)]!
}

const getRandomHeaderWidth = () => {
  const widths = ['w-12', 'w-16', 'w-20', 'w-24', 'w-28'] as const
  return widths[Math.floor(Math.random() * widths.length)]!
}

const generateRandomLayout = () => {
  return {
    headers: [getRandomHeaderWidth(), getRandomHeaderWidth(), getRandomHeaderWidth()],
    lines: ['w-full', getRandomWidth()],
  }
}

const initialMessages: Message[] = [
  {
    key: '1',
    status: 'SUCCESS',
    layout: {
      headers: ['w-16', 'w-20', 'w-24'],
      lines: ['w-full', 'w-3/5'],
    },
  },
  {
    key: '2',
    status: 'SUCCESS',
    layout: {
      headers: ['w-20', 'w-24', 'w-16'],
      lines: ['w-full', 'w-4/5'],
    },
  },
  {
    key: '3',
    status: 'SUCCESS',
    layout: {
      headers: ['w-24', 'w-16', 'w-20'],
      lines: ['w-full', 'w-2/5'],
    },
  },
  {
    key: '4',
    status: 'SUCCESS',
    layout: {
      headers: ['w-16', 'w-24', 'w-20'],
      lines: ['w-full', 'w-3/5'],
    },
  },
  {
    key: '5',
    status: 'SUCCESS',
    layout: {
      headers: ['w-20', 'w-16', 'w-24'],
      lines: ['w-full', 'w-4/5'],
    },
  },
]

const getNewItems = (prevItems: typeof initialMessages) => {
  messageCounter += 1

  const newItems = [
    {
      key: messageCounter.toString(),
      status: 'PENDING' as const,
      layout: generateRandomLayout(),
    },
    ...prevItems.slice(0, -1),
  ]

  return newItems
}

export const RealTimeMonitoring = () => {
  const [messages, setMessages] = useState(initialMessages)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prev) => {
        const newItems = getNewItems(prev)

        const latestAdded = newItems[0]!

        setTimeout(
          () => {
            setMessages((current) => {
              return current.map((item) => (item.key === latestAdded.key ? { ...item, status: 'SUCCESS' } : item))
            })
          },
          getRandomInt(1000, 2000),
        )

        return newItems
      })
    }, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="p-4">
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.key}
              className="border p-4 bg-background"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.3,
                layout: {
                  duration: 0.3,
                },
              }}
            >
              <div className="flex items-center gap-4">
                {message.layout.headers.map((width, i) => (
                  <Skeleton
                    key={`${message.key}-header-${i}`}
                    className={cn('h-6 rounded-none', width, message.status === 'SUCCESS' && 'animate-none')}
                  />
                ))}

                {message.status === 'PENDING' ? (
                  <Spinner className="text-orange-400 size-5 ml-auto" />
                ) : (
                  <Icon name="checkCircle" className="text-green-400 size-5 ml-auto" />
                )}
              </div>

              <div className="mt-4 space-y-2">
                {message.layout.lines.map((width, i) => (
                  <Skeleton
                    key={`${message.key}-line-${i}`}
                    className={cn('h-3 rounded-none', width, message.status === 'SUCCESS' && 'animate-none')}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
