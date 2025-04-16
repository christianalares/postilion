'use client'

import { createPushModal } from 'pushmodal'
import { MobileMenuSheet } from './mobile-menu-sheet'

export const {
  pushModal: pushSheet,
  popModal: popSheet,
  ModalProvider: SheetProvider,
} = createPushModal({
  modals: {
    mobileMenuSheet: MobileMenuSheet,
  },
})
