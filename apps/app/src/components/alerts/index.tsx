'use client'

import { createPushModal } from 'pushmodal'
import { AlertDialog } from '../ui/alert-dialog'
import { CannotDeleteDomainAlert } from './cannot-delete-domain-alert'
import { ConfirmDeleteDomainAlert } from './confirm-delete-domain-alert'
import { ConfirmDeleteWebhookAlert } from './confirm-delete-webhook-alert'

export const {
  pushModal: pushAlert,
  popModal: popAlert,
  ModalProvider: AlertProvider,
} = createPushModal({
  modals: {
    confirmDeleteDomain: {
      Component: ConfirmDeleteDomainAlert,
      Wrapper: (props) => <AlertDialog {...props} />,
    },
    cannotDeleteDomain: {
      Component: CannotDeleteDomainAlert,
      Wrapper: (props) => <AlertDialog {...props} />,
    },
    confirmDeleteWebhook: {
      Component: ConfirmDeleteWebhookAlert,
      Wrapper: (props) => <AlertDialog {...props} />,
    },
  },
})
