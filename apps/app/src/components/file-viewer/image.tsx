'use client'

import type { RouterOutputs } from '@/trpc/routers/_app'
import { Icon } from '../ui/icon'

type Props = {
  file: RouterOutputs['messages']['getById']['attachments'][number]
}

export const Image = ({ file }: Props) => {
  const openImageInNewWindow = () => {
    try {
      const binaryString = window.atob(file.content)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const imageBlob = new Blob([bytes], { type: file.mime_type })
      const imageUrl = URL.createObjectURL(imageBlob)

      const imageWindow = window.open()
      if (!imageWindow) {
        alert('Please allow popups to view the image')
        return
      }

      const sanitizedFilename = file.filename.replace(/[<>]/g, '')

      imageWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${sanitizedFilename}</title>
            <style>
              body, html { 
                margin: 0; 
                padding: 0; 
                height: 100%; 
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #f5f5f5;
              }
              img { 
                max-width: 100%;
                max-height: 100vh;
                object-fit: contain;
              }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" alt="${sanitizedFilename}" />
          </body>
        </html>
      `)

      imageWindow.onload = () => {
        URL.revokeObjectURL(imageUrl)
      }
    } catch (error) {
      console.error('Error opening image:', error)
      alert('Error opening image. Please try again.')
    }
  }

  return (
    <button
      type="button"
      className="font-mono text-xs flex items-center gap-2 hover:underline underline-offset-4"
      onClick={openImageInNewWindow}
    >
      <Icon name="image" className="size-4" />
      {file.filename}
    </button>
  )
}
