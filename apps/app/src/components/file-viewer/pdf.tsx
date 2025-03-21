'use client'

import type { RouterOutputs } from '@/trpc/routers/_app'
import { Icon } from '../ui/icon'

type Props = {
  file: RouterOutputs['messages']['getById']['attachments'][number]
}

export const PDF = ({ file }: Props) => {
  const openPdfInNewWindow = () => {
    try {
      const binaryString = window.atob(file.content)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const pdfBlob = new Blob([bytes], { type: 'application/pdf' })
      const pdfUrl = URL.createObjectURL(pdfBlob)

      const pdfWindow = window.open()
      if (!pdfWindow) {
        alert('Please allow popups to view the PDF')
        return
      }

      const sanitizedFilename = file.filename.replace(/[<>]/g, '')

      pdfWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${sanitizedFilename}</title>
            <style>
              body, html { margin: 0; padding: 0; height: 100%; }
              iframe { width: 100%; height: 100%; border: none; }
            </style>
          </head>
          <body>
            <iframe src="${pdfUrl}"></iframe>
            <script>
              document.querySelector('iframe').onerror = function() {
                alert('PDF viewing is not supported. Downloading file instead.');
                const link = document.createElement('a');
                link.href = '${pdfUrl}';
                link.download = '${sanitizedFilename}';
                link.click();
                window.close();
              };
            </script>
          </body>
        </html>
      `)

      pdfWindow.onload = () => {
        URL.revokeObjectURL(pdfUrl)
      }
    } catch (error) {
      console.error('Error opening PDF:', error)
      alert('Error opening PDF. Please try again.')
    }
  }

  return (
    <button
      type="button"
      className="font-mono text-xs flex items-center gap-1 hover:underline underline-offset-4"
      onClick={openPdfInNewWindow}
    >
      <Icon name="document" className="size-4" strokeWidth={1} />
      {file.filename}
    </button>
  )
}
