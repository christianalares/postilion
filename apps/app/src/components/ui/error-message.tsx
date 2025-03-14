import { AnimatePresence, motion } from 'motion/react'
import { Icon } from './icon'

type Props = {
  message?: string
}
export const ErrorMessage = ({ message }: Props) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <p className="text-destructive text-xs mt-2 flex items-center gap-2">
            <Icon name="circleAlert" className="w-4 h-4" />
            {message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
