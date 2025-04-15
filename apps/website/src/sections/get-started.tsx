import { ThreeDBox } from '@/components/three-d-box'
import { Button } from '@/components/ui/button'

export const GetStarted = () => {
  return (
    <div className="flex justify-center">
      <ThreeDBox>
        <div className="px-4 sm:px-16 py-8 flex flex-col">
          <h1 className="text-3xl font-mono animate-wiggle">Try it out</h1>
          <Button asChild className="mt-8" size="lg">
            <a href="https://app.postilion.ai">Get started</a>
          </Button>
        </div>
      </ThreeDBox>
    </div>
  )
}
