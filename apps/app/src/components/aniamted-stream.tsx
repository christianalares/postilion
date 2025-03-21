'use client'

import { cn } from '@/lib/utils'
import { Inbox, Mail } from 'lucide-react'

type Props = {
  className?: string
}

export const AnimatedStream = ({ className }: Props) => {
  return (
    <div className={cn('w-full max-w-4xl mx-auto overflow-hidden', className)}>
      <svg viewBox="0 0 1000 400" className="w-full h-full">
        <title>Animated Stream</title>
        {/* Server */}
        <g className="server-group" transform="translate(200, 200)">
          <rect
            x="-75"
            y="-75"
            width="150"
            height="150"
            rx="12"
            className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-700 stroke-[1.5]"
          />
          <circle cx="0" cy="0" r="45" className="fill-zinc-200 dark:fill-zinc-800" />
          <foreignObject x="-25" y="-25" width="50" height="50">
            <div className="flex items-center justify-center h-full">
              <Mail className="h-10 w-10 text-zinc-800 dark:text-zinc-200" />
            </div>
          </foreignObject>

          <circle cx="0" cy="0" r="45" className="fill-transparent stroke-zinc-400 dark:stroke-zinc-600 opacity-0">
            <animate attributeName="r" from="45" to="65" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Client */}
        <g className="client-group" transform="translate(800, 200)">
          <rect
            x="-75"
            y="-75"
            width="150"
            height="150"
            rx="12"
            className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-700 stroke-[1.5]"
          />
          <circle cx="0" cy="0" r="45" className="fill-zinc-200 dark:fill-zinc-800" />
          <foreignObject x="-25" y="-25" width="50" height="50">
            <div className="flex items-center justify-center h-full">
              <Inbox className="h-10 w-10 text-zinc-800 dark:text-zinc-200" />
            </div>
          </foreignObject>

          {/* Client pulse effect when receiving */}
          <circle cx="0" cy="0" r="45" className="fill-transparent stroke-zinc-400 dark:stroke-zinc-600 opacity-0">
            <animate attributeName="r" from="45" to="65" dur="2s" begin="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.6" to="0" dur="2s" begin="2.5s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Connection line */}
        <line
          x1="275"
          y1="200"
          x2="725"
          y2="200"
          className="stroke-zinc-400 dark:stroke-zinc-600 stroke-[1.5] stroke-dasharray-4"
          strokeDashoffset={0}
        >
          <animate attributeName="stroke-dashoffset" from="0" to="20" dur="0.5s" repeatCount="indefinite" />
        </line>

        {/* Single envelope with fade effect */}
        <g>
          <path id="motionPath" d="M 275 200 L 725 200" className="hidden" />

          <g className="envelope">
            <animateMotion path="M 275 200 L 725 200" dur="4s" repeatCount="indefinite" rotate="auto" />

            <foreignObject x="-16" y="-16" width="32" height="32">
              <div className="flex items-center justify-center h-full">
                <Mail className="h-8 w-8 text-zinc-800 dark:text-zinc-200" />
              </div>
            </foreignObject>

            {/* Fade in at start */}
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.1;0.8;1"
              dur="4s"
              repeatCount="indefinite"
            />

            {/* Subtle scale effect */}
            <animateTransform
              attributeName="transform"
              type="scale"
              values="0.8;1;1;0.8"
              keyTimes="0;0.1;0.8;1"
              dur="4s"
              repeatCount="indefinite"
            />
          </g>
        </g>
      </svg>
    </div>
  )
}
