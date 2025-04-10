import { IdentifyComponent as OpenPanelIdentifyComponent } from '@openpanel/nextjs'

type Props = {
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    createdAt: Date
    updatedAt: Date
    image?: string | null | undefined
  }
}

export const IdentifyComponent = ({ user }: Props) => {
  return (
    <>
      <OpenPanelIdentifyComponent
        profileId={user.id}
        firstName={user.name}
        email={user.email}
        avatar={user.image ?? undefined}
      />
    </>
  )
}
