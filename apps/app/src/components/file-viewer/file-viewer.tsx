import type { RouterOutputs } from '@/trpc/routers/_app'
import { Image } from './image'
import { PDF } from './pdf'
type Props = {
  file: RouterOutputs['messages']['getById']['attachments'][number]
}

export const FileViewer = ({ file }: Props) => {
  if (file.mime_type === 'application/pdf') {
    return <PDF file={file} />
  }

  if (file.mime_type?.startsWith('image/')) {
    return <Image file={file} />
  }

  return null
}
