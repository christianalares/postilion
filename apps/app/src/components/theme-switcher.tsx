import { Icon, type IconName } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { useTheme } from 'next-themes'

type Theme = 'light' | 'dark' | 'system'

export const ThemeSwitcher = () => {
	return (
		<div className="flex items-center gap-px border rounded-full p-1">
			<ThemeButton themeName="light" />
			<ThemeButton themeName="dark" />
			<ThemeButton themeName="system" />
		</div>
	)
}

const iconMap: Record<Theme, IconName> = {
	light: 'sun',
	dark: 'moon',
	system: 'monitor',
}

type ThemeButtonProps = {
	themeName: Theme
}

const ThemeButton = ({ themeName }: ThemeButtonProps) => {
	const { theme, setTheme, resolvedTheme } = useTheme()

	const isActive = themeName === theme

	return (
		<button
			type="button"
			className="relative"
			onClick={() => setTheme(themeName)}
		>
			{isActive && (
				<motion.div
					layoutId="selected"
					className="absolute inset-0 bg-foreground rounded-full"
					transition={{
						type: 'spring',
						bounce: 0.35,
					}}
				/>
			)}

			<Icon
				name={iconMap[themeName]}
				className={cn(
					'relative z-10 size-7 p-1.5 mix-blend-exclusion transition-opacity',
					resolvedTheme === 'dark' ? 'text-foreground' : 'text-background',
					{
						'opacity-70 hover:opacity-100': !isActive,
					},
				)}
			/>
		</button>
	)
}
