'use client'

import { useEffect } from 'react'

export const Events = () => {
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:8787/sse/01JPCPC9DM1XVRQ9X0RA0M0RJW', {
      // const eventSource = new EventSource('http://127.0.0.1:8787/message/01JPCPC9DM1XVRQ9X0RA0M0RJW/status', {
      withCredentials: true,
    })

    eventSource.onmessage = (event) => {
      console.log(event)
    }

    eventSource.addEventListener('open', (event) => {
      console.log('open', event)
    })

    eventSource.addEventListener('error', (event) => {
      console.log('error', event)
    })

    return () => {
      eventSource.close()
    }
  }, [])

  return (
    <div className="p-4 border rounded">
      <p>SSE Events Listener Active</p>
      <p className="text-sm text-gray-500">Check browser console for logs</p>
    </div>
  )
}
