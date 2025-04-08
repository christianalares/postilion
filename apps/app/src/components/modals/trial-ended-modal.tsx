import Link from 'next/link'
import { Button } from '../ui/button'
import { Modal, ModalDescription, ModalHeader, ModalTitle, ModalWrapper } from '../ui/modal'

export const TrialEndedModal = () => {
  return (
    <ModalWrapper open>
      <Modal hideCloseButton>
        <ModalHeader>
          <ModalTitle>Trial ended</ModalTitle>
          <ModalDescription>Your trial period has ended. Please upgrade to continue using Postilion.</ModalDescription>
        </ModalHeader>

        <Button asChild>
          <Link href="/settings/billing">Go to billing page</Link>
        </Button>
      </Modal>
    </ModalWrapper>
  )
}
