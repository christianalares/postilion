import { AlertProvider } from '@/components/alerts'
import { ModalProvider } from '@/components/modals'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { TRPCProvider } from '@/trpc/client'
import { AnalyticsProvider } from '@postilion/analytics/provider'
import type { Metadata } from 'next'
import './globals.css'

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
        <AnalyticsProvider
          clientId={process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID!}
          clientSecret={process.env.OPENPANEL_CLIENT_SECRET!}
          apiUrl="/api/openpanel"
          disabled={process.env.NODE_ENV !== 'production'}
        />

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
