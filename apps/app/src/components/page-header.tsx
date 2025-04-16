import { Button } from './ui/button'
import { Icon, type IconName } from './ui/icon'

type Props = {
  heading: React.ReactNode
  cta?: {
    icon?: IconName
    label: string
    onClick: () => void
  }
}

export const PageHeader = ({ heading, cta }: Props) => {
  return (
    <div className="flex justify-between items-center border-b px-4 h-16">
      {typeof heading === 'string' ? <h1 className="text-xl font-mono">{heading}</h1> : heading}
      {!!cta && (
        <Button size="sm" onClick={cta.onClick}>
          {cta.icon && <Icon name={cta.icon} className="size-4" />}
          <span>{cta.label}</span>
        </Button>
      )}
    </div>
  )
}
