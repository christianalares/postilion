import { pushAlert } from './alerts'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Icon } from './ui/icon'

type Props = {
  domain: {
    id: string
    projectName?: string
  }
}

export const DomainDropdown = ({ domain }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icon name="dotsVertical" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            if (domain.projectName) {
              pushAlert('cannotDeleteDomain', {
                reason: (
                  <>
                    This domain is already connected to{' '}
                    <span className="font-bold text-muted-foreground">{domain.projectName}</span>.<br />
                    If you want to delete it, you need to disconnect it from the project first.
                  </>
                ),
              })
            } else {
              pushAlert('confirmDeleteDomain', { domainId: domain.id })
            }
          }}
        >
          <Icon name="trash" />
          <span>Remove domain</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
