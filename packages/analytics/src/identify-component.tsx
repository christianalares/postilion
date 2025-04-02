import { IdentifyComponent as OpenPanelIdentifyComponent } from '@openpanel/nextjs'

type Props = {
  user: {
    name: string
    image: string | null
    id: string
    createdAt: Date
    updatedAt: Date
    email: string
    emailVerified: boolean
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
