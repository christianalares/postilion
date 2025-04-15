import { motion } from 'motion/react'
import { ThreeDBox } from './three-d-box'
import { Icon } from './ui/icon'

const checkList = [
  'Real time monitoring',
  'Automatic webhook retries',
  'AI powered summarization',
  'Connect your own domain',
]

export const CheckList = () => {
  return (
    <div className="flex justify-center mt-16">
      <ThreeDBox>
        <ul className="space-y-2">
          {checkList.map((item, index) => (
            <CheckListItem key={item} index={index}>
              {item}
            </CheckListItem>
          ))}
        </ul>
      </ThreeDBox>
    </div>
  )
}

const CheckListItem = ({ children, index }: { children: React.ReactNode; index: number }) => {
  return (
    <motion.li
      className="flex items-center gap-2"
      initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ delay: index * 0.2 }}
    >
      <Icon name="check" className="size-4 text-green-400" />
      {children}
    </motion.li>
  )
}
