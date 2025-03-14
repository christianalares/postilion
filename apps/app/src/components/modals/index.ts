'use client'

import { createPushModal } from 'pushmodal'
import { CreateTeamModal } from './create-team-modal'

export const { pushModal, popModal, ModalProvider } = createPushModal({
  modals: {
    createTeamModal: CreateTeamModal,
  },
})
