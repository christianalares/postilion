import { PostilionP } from '@/components/postilion-p'
import { Button } from '@/components/ui/button'

const Page = () => {
  return (
    <div className="h-full flex gap-36 justify-center items-center">
      <div className="flex-1 flex justify-end items-center">
        <div>
          <h1 className="text-5xl font-mono">Postilion</h1>
          <p className="text-lg font-mono">Inbound email the modern way</p>
          <Button asChild className="mt-4">
            <a href="https://app.postilion.io">Get started</a>
          </Button>
        </div>
      </div>

      <div className="h-full flex-1 flex justify-start items-center">
        <PostilionP />
        {/* <div className="w-full h-full">
        </div> */}
      </div>
    </div>
    // <div className="h-full flex gap-4 items-center">
    //   <div className="flex-1 p-8 flex justify-end">
    //     <div>
    //       <h1 className="text-5xl font-mono">Postilion</h1>
    //       <p className="text-lg font-mono">Inbound email the modern way</p>
    //       <Button asChild className="mt-4">
    //         <a href="https://app.postilion.io">Get started</a>
    //       </Button>
    //     </div>
    //   </div>

    //   <div className="flex-1 p-8 h-full">
    //     <PostilionP />
    //   </div>
    // </div>
  )
}

export default Page
