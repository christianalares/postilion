'use client'

import { createPushModal } from 'pushmodal'
import { AddDomainModal } from './add-domain-modal'
import { CreateProjectModal } from './create-project-modal'
import { CreateTeamModal } from './create-team-modal'

export const { pushModal, popModal, ModalProvider } = createPushModal({
  modals: {
    createTeamModal: CreateTeamModal,
    createProjectModal: CreateProjectModal,
    addDomainModal: AddDomainModal,
  },
})
