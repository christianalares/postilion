import { ThemeProvider } from '@/components/theme-provider'
import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/header'
import { HR } from '@/components/hr'
import { cn } from '@/lib/utils'

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
          <Header />

          <main>{children}</main>

          <HR />

          <footer className="mt-24">
            <div className="overflow-hidden pb-16">
              <p
                className={cn(
                  'text-center font-mono font-black text-[18dvw] text-background leading-[18dvw]',
                  '[text-shadow:2px_2px_0_theme(colors.muted-foreground)]',
                  'opacity-40',
                )}
              >
                Postilion
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
