'use client'

import { CheckList } from '@/components/check-list'
import { DemoSection } from '@/components/demo/demo-section'
import { HR } from '@/components/hr'
// import { PostilionP } from '@/components/postilion-p'
// import { ThreeDBox } from '@/components/three-d-box'
// import { Button } from '@/components/ui/button'
import { P } from '@/sections/P'
import { GetStarted } from '@/sections/get-started'

const Page = () => {
  return (
    <div>
      <P />

      <h1 className="font-mono text-2xl sm:text-4xl mt-16 text-center text-balance leading-snug">
        DX focused inbound email service at scale
      </h1>

      <div className="mb-24">
        <CheckList />
      </div>

      <HR />

      <div className="mt-24 mb-24">
        <DemoSection />
      </div>

      <HR />

      <div className="py-32">
        <GetStarted />
      </div>
    </div>
  )
}

export default Page
