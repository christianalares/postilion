import { ThemeProvider } from '@/components/theme-provider'
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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
