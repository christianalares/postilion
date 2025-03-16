'use client'

import { createPushModal } from 'pushmodal'
import { CreateProjectModal } from './create-project-modal'
import { CreateTeamModal } from './create-team-modal'

export const { pushModal, popModal, ModalProvider } = createPushModal({
  modals: {
    createTeamModal: CreateTeamModal,
    createProjectModal: CreateProjectModal,
  },
})
