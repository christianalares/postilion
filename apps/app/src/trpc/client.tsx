'use client'

import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider, isServer } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import { useState } from 'react'
import superjson from 'superjson'
import { makeQueryClient } from './query-client'
import type { AppRouter } from './routers/_app'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()

let browserQueryClient: QueryClient

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient()
  }

  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) browserQueryClient = makeQueryClient()

  return browserQueryClient
}

export function getUrl() {
  if (process.env.NEXT_PUBLIC_URL) {
    console.log('1 getUrl', process.env.NEXT_PUBLIC_URL)
    return process.env.NEXT_PUBLIC_URL
  }

  if (process.env.VERCEL_ENV === 'preview') {
    console.log('2 getUrl', process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}`
  }

  console.log('3 getUrl', 'http://localhost:3000')
  return 'http://localhost:3000'
}

export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode
  }>,
) {
  const queryClient = getQueryClient()

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${getUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

// export function TRPCProvider(
//   props: Readonly<{
//     children: React.ReactNode
//   }>,
// ) {
//   const queryClient = getQueryClient()

//   const [trpcClient] = useState(() =>
//     createTRPCClient<AppRouter>({
//       links: [
//         httpBatchLink({
//           transformer: superjson,
//           url: getUrl(),
//         }),
//       ],
//     }),
//   )

//   return (
//     <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
//       <QueryClientProvider client={queryClient}>
//         {props.children}
//         <ReactQueryDevtools />
//       </QueryClientProvider>
//     </TRPCProvider>
//   );
// }
