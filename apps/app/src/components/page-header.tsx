import { Button } from './ui/button'
import { Icon, type IconName } from './ui/icon'

type Props = {
  heading: string
  cta?: {
    icon?: IconName
    label: string
    onClick: () => void
  }
}

export const PageHeader = ({ heading, cta }: Props) => {
  return (
    <div className="flex justify-between items-center h-12 mb-6 pb-4 border-b">
      <h1 className="text-xl font-mono">{heading}</h1>
      {!!cta && (
        <Button size="sm" onClick={cta.onClick}>
          {cta.icon && <Icon name={cta.icon} className="size-4" />}
          <span>{cta.label}</span>
        </Button>
      )}
    </div>
  )
}
