'use client'

import { FormCard } from '../form-card'
import { Input } from '../ui/input'

export const DeleteTeamForm = () => {
  return (
    <FormCard
      handleSubmit={() => {}}
      label="Delete team"
      labelId="delete-team"
      description="Permanently delete your team and all associated data."
      variant="destructive"
      ctaText="Delete team"
    >
      <Input id="full-name" /* {...form.register('fullName')} */ placeholder="John Doe" />
    </FormCard>
  )
}
