'use client'

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { cn } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { isFuture } from 'date-fns'
import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  messages: {
    label: 'Messages',
    color: 'var(--ring)',
  },
} satisfies ChartConfig

const BY_OPTIONS = ['DAILY', 'WEEKLY', 'MONTHLY'] as const
type ByOption = (typeof BY_OPTIONS)[number]

const getOptionLabel = (option: ByOption) => {
  switch (option) {
    case 'DAILY':
      return 'Daily'
    case 'WEEKLY':
      return 'Weekly'
    case 'MONTHLY':
      return 'Monthly'
  }
}

export const MessagesChart = () => {
  const [by, setBy] = useState<ByOption>('DAILY')
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()

  const [messages] = trpc.dashboard.getStats.useSuspenseQuery({
    teamSlug,
    projectSlug,
    by,
  })

  const data = messages.map((msg) => ({
    date: msg.date.toISOString(),
    messages: msg.messages,
  }))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-2">
          <CardTitle>Messages</CardTitle>
          <CardDescription>Number of incoming messages</CardDescription>
        </div>

        <Select value={by} onValueChange={(value: ByOption) => setBy(value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="By" />
          </SelectTrigger>

          <SelectContent>
            {BY_OPTIONS.map((by) => (
              <SelectItem key={by} value={by}>
                {getOptionLabel(by)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillMessages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-messages)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-messages)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="messages"
              type="monotone"
              fill="url(#fillMessages)"
              stroke="var(--color-messages)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
