'use client'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Icon } from './icon'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'
import { TooltipProvider } from './tooltip'

export type ComboboxItem = {
  value: string
  label: string
  disabled?: boolean | string
}

type Props = {
  items: ComboboxItem[]
  selectedItem?: ComboboxItem
  onSelect: (item: ComboboxItem) => void
  label?: string
  emptyMessage?: string
  searchPlaceholder?: string
  loading?: boolean
  popover?: {
    content?: React.ComponentProps<typeof PopoverContent>
  }
}

export function Combobox({
  items,
  selectedItem: incomingSelectedItem,
  onSelect,
  label,
  searchPlaceholder,
  emptyMessage,
  loading,
  popover,
}: Props) {
  const [open, setOpen] = useState(false)
  const [internalSelectedItem, setInternalSelectedItem] = useState<ComboboxItem | undefined>()
  const [inputValue, setInputValue] = useState('')

  const selectedItem = incomingSelectedItem ?? internalSelectedItem
  const filteredItems = items.filter((item) => item.label.toLowerCase().includes(inputValue.toLowerCase()))

  if (items.length === 0) {
    return (
      <div className="text-sm h-9 flex items-center justify-between bg-popover text-popover-foreground w-full border px-3 shadow-md outline-hidden">
        [Empty list]
        <Icon name="chevronsUpDown" className="ml-2 size-4 shrink-0 opacity-50" />
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          // biome-ignore lint/a11y/useSemanticElements: <explanation>
          role="combobox"
          variant="outline"
          aria-expanded={open}
          className="w-full justify-between"
          loading={loading}
        >
          {selectedItem?.label ?? label ?? 'Select item'}
          {/* {value ? items.find((item) => item.value === value)?.label : (label ?? 'Select item')} */}
          <Icon name="chevronsUpDown" className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        {...popover?.content}
        className={cn('p-0 min-w-52', popover?.content?.className)}
        style={{
          width: 'var(--radix-popover-trigger-width)',
          ...popover?.content?.style,
        }}
      >
        <Command loop shouldFilter={false}>
          <CommandInput
            value={inputValue}
            onValueChange={setInputValue}
            placeholder={searchPlaceholder ?? 'Select item...'}
          />
          <CommandList>
            <CommandEmpty className="py-2 text-muted-foreground">{emptyMessage ?? 'No items found.'}</CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item) => {
                const isSelected = selectedItem?.value === item.value

                return (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    className={cn('flex justify-between', {
                      'opacity-50 cursor-default': !!item.disabled,
                    })}
                    // disabled={!!item.disabled}
                    onSelect={(currentValue) => {
                      if (item.disabled) {
                        return
                      }

                      const foundItem = items.find((item) => item.value === currentValue)

                      if (!foundItem) {
                        return
                      }

                      onSelect(foundItem)
                      setInternalSelectedItem(foundItem)
                      setOpen(false)
                    }}
                  >
                    <div
                      className={cn(
                        'flex-1 flex items-center justify-between gap-8',
                        item.disabled ? 'cursor-default' : 'cursor-pointer',
                      )}
                    >
                      {item.label}
                      <Icon name="check" className={cn('size-5', isSelected ? 'opacity-100' : 'opacity-0')} />
                    </div>

                    {typeof item.disabled === 'string' && !isSelected && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help">
                              <Icon name="circleAlert" className="size-5" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent showArrow>
                            <p>{item.disabled}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
