'use client'

import { createPushModal } from 'pushmodal'
import { AlertDialog } from '../ui/alert-dialog'
import { ConfirmDeleteDomainAlert } from './confirm-delete-domain'

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
  },
})
