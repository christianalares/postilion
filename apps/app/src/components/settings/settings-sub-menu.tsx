'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const SettingsSubMenu = () => {
	const pathname = usePathname()

	return (
		<nav>
			<ul className="flex items-center gap-4">
				<MenuItem
					isActive={pathname === '/settings'}
					href="/settings"
					label="Account"
				/>
				<MenuItem
					isActive={pathname === '/settings/team'}
					href="/settings/team"
					label="Team"
				/>
			</ul>
		</nav>
	)
}

type MenuItemProps = {
	href: string
	label: string
	isActive: boolean
}

const MenuItem = ({ href, label, isActive }: MenuItemProps) => {
	return (
		<li className="relative">
			<Link href={href}>
				<span>{label}</span>
			</Link>

			{isActive && (
				<motion.div
					layoutId="account-sub-nav-underline"
					className="absolute -bottom-1 left-0 w-full h-0.5 bg-muted-foreground"
				/>
			)}
		</li>
	)
}
