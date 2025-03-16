import { useParams } from 'next/navigation'

export const useMessageId = () => {
  const { messageId } = useParams<{ messageId: string }>()

  return messageId
}
