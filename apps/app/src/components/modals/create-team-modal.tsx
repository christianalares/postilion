'use client'

import { Modal, ModalDescription, ModalHeader, ModalTitle } from '@/components/ui/modal'

export const CreateTeamModal = () => {
  return (
    <Modal>
      <ModalHeader>
        <ModalTitle>Create team</ModalTitle>
        <ModalDescription>Create a new team</ModalDescription>
      </ModalHeader>

      <p>Create team</p>
    </Modal>
  )
}
