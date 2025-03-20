'use client'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Icon } from './icon'

export type ComboboxItem = {
  value: string
  label: string
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
                    className="flex items-center justify-between cursor-pointer"
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                      const foundItem = items.find((item) => item.value === currentValue)

                      if (!foundItem) {
                        return
                      }

                      onSelect(foundItem)
                      setInternalSelectedItem(foundItem)
                      setOpen(false)
                    }}
                  >
                    {item.label}
                    <Icon name="check" className={cn('size-4', isSelected ? 'opacity-100' : 'opacity-0')} />
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
