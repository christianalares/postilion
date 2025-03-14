import { ThemeProvider } from '@/components/theme-provider'
import { TRPCProvider } from '@/trpc/client'
import type { Metadata } from 'next'
import './globals.css'

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
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{children}
					</ThemeProvider>
				</TRPCProvider>
			</body>
		</html>
	)
}
