import { ModalProvider } from '@/components/modals'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { TRPCProvider } from '@/trpc/client'
import type { Metadata } from 'next'
import './globals.css'
import { AlertProvider } from '@/components/alerts'

// Allow custom CSS properties in React
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}

export const metadata: Metadata = {
  title: 'Postilion',
  description: 'Postilion',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full">
        <TRPCProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}

            <ModalProvider />
            <AlertProvider />

            <Toaster
              position="bottom-left"
              toastOptions={{
                classNames: {
                  error: '!border-red-400 dark:!border-red-700',
                },
              }}
            />
          </ThemeProvider>
        </TRPCProvider>
      </body>
    </html>
  )
}
