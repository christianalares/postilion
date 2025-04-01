'use client'

import { createPushModal } from 'pushmodal'
import { AddDomainModal } from './add-domain-modal'
import { CreateProjectModal } from './create-project-modal'
import { CreateTeamModal } from './create-team-modal'
import { CreateWebhookModal } from './create-webhook-modal'
import { EditWebhookModal } from './edit-webhook-modal'
import { InviteMemberModal } from './invite-member-modal'

export const { pushModal, popModal, ModalProvider } = createPushModal({
  modals: {
    createTeamModal: CreateTeamModal,
    createProjectModal: CreateProjectModal,
    addDomainModal: AddDomainModal,
    createWebhookModal: CreateWebhookModal,
    editWebhookModal: EditWebhookModal,
    inviteMemberModal: InviteMemberModal,
  },
})
