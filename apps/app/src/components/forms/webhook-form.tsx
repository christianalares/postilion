import { useZodForm } from '@/hooks/use-zod-form'
import { ENUMS } from '@postilion/db/enums'
import { Controller, type DefaultValues } from 'react-hook-form'
import { z } from 'zod'
import { popModal } from '../modals'
import { Button } from '../ui/button'
import { ErrorMessage } from '../ui/error-message'
import { Icon } from '../ui/icon'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const formSchema = z.object({
  url: z.string().url(),
  method: z.nativeEnum(ENUMS.WEBHOOK_REQUEST_METHOD_ENUM),
})

type Props = {
  onSubmit: (values: z.infer<typeof formSchema>) => void
  isLoading?: boolean
  defaultValues?: DefaultValues<z.infer<typeof formSchema>>
  ctaText: string
}

export const WebhookForm = ({ onSubmit, isLoading, defaultValues, ctaText }: Props) => {
  const form = useZodForm(formSchema, { defaultValues })

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values)
  })

  return (
    <form className="flex flex-col mt-8" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2">
        <span>URL</span>

        <div className="flex items-center gap-2">
          <Input placeholder="https://example.com/webhook/{handle}?subject={subject}" {...form.register('url')} />

          <Controller
            control={form.control}
            name="method"
            render={({ field }) => {
              return (
                <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Request method" />
                  </SelectTrigger>

                  <SelectContent>
                    {Object.values(ENUMS.WEBHOOK_REQUEST_METHOD_ENUM).map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            }}
          />
        </div>
      </label>

      <ErrorMessage message={form.formState.errors.url?.message} />

      {(form.watch('method') === 'DELETE' || form.watch('method') === 'GET') && (
        <p className="text-sm mt-2 flex items-center gap-2 bg-warning/10 border border-warning/20 p-2">
          <Icon name="circleAlert" className="size-4 text-warning" />
          When using GET or DELETE, the request will not include the body.
        </p>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            popModal('createWebhookModal')
            popModal('editWebhookModal')
          }}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {ctaText}
        </Button>
      </div>
    </form>
  )
}
