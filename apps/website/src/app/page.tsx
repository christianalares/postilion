'use client'

import { PostilionP } from '@/components/postilion-p'
import { ThreeDBox } from '@/components/three-d-box'
import { Button } from '@/components/ui/button'

const Page = () => {
  return (
    <div className="flex flex-col items-center gap-4 px-4 mt-8">
      <div className="w-full animate-blur">
        <PostilionP />
      </div>

      <div className="px-4">
        <ThreeDBox>
          <div className="px-4 sm:px-16 py-8">
            <h1 className="text-3xl sm:text-5xl font-mono animate-wiggle">Postilion</h1>
            <p className="text-lg font-mono mt-2">Inbound email the modern way</p>
            <Button asChild className="mt-8" size="lg">
              <a href="https://app.postilion.ai">Get started</a>
            </Button>
          </div>
        </ThreeDBox>
      </div>
    </div>
  )
}

export default Page
