import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

interface VercelInviteUserEmailProps {
  invitedBy: {
    name: string
    avatar: string | null | undefined
    email: string
  }
  team: {
    name: string
  }
  code: string
  email: string
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : ''

const baseImageUrl = process.env.NODE_ENV === 'development' ? '' : 'https://app.postilion.ai/public'

export const InviteUserEmail = ({ invitedBy, team, code, email }: VercelInviteUserEmailProps) => {
  const inviteLink = `${baseUrl}/api/invite/${code}`

  return (
    <Html>
      <Head />
      <Preview>You've been invited! 🎉</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-mono px-2">
          <Container className="mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`${baseImageUrl}/static/postilion-logo.jpg`}
                width="40"
                height="37"
                alt="Vercel"
                className="my-0 mx-auto"
              />
            </Section>

            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              You've been invited! 🎉
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">
              <strong>{invitedBy.name}</strong> ({invitedBy.email}) invited you to join the team{' '}
              <strong>{team.name}</strong> on <strong>Postilion</strong>.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={inviteLink}
              >
                Join the team
              </Button>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              or copy and paste this URL into your browser:{' '}
              <Link href={inviteLink} className="text-blue-600 no-underline">
                {inviteLink}
              </Link>
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This invitation was intended for <span className="text-black">{email}</span>. This invite was sent from{' '}
              <span className="text-black">{invitedBy.email}</span>. If you were not expecting this invitation, you can
              ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

InviteUserEmail.PreviewProps = {
  invitedBy: {
    name: 'Scrooge McDuck',
    avatar: 'https://i.pravatar.cc/150?img=1',
    email: 'scrooge.mcduck@duckberg.com',
  },
  team: {
    name: 'Duckberg',
  },
  code: 'abc123',
  email: 'donald.duck@duckberg.com',
} as VercelInviteUserEmailProps

export default InviteUserEmail
