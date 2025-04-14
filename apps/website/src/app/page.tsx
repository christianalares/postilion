'use client'

import { PostilionP } from '@/components/postilion-p'
import { ThreeDBox } from '@/components/three-d-box'
import { Button } from '@/components/ui/button'
import { motion } from 'motion/react'

const Page = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <PostilionP />
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{
            backdropFilter: 'blur(30px)',
          }}
          animate={{
            backdropFilter: 'blur(0px)',
          }}
          transition={{
            duration: 4,
            ease: 'easeInOut',
          }}
        />
      </div>

      <ThreeDBox className="p-16">
        <h1 className="text-5xl font-mono">Postilion</h1>
        <p className="text-lg font-mono mt-2">Inbound email the modern way</p>
        <Button asChild className="mt-8" size="lg">
          <a href="https://app.postilion.ai">Get started</a>
        </Button>
      </ThreeDBox>
    </div>
  )
}

export default Page
