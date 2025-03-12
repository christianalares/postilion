import type { Metadata } from 'next'
import './globals.css'
import { TRPCProvider } from '@/trpc/client'

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
		<html lang="en">
			<body>
				<TRPCProvider>{children}</TRPCProvider>
			</body>
		</html>
	)
}
