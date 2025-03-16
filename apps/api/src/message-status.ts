import { Hono } from 'hono'

export class MessageStatus {
  private connections: Set<ReadableStreamDefaultController>
  private state: DurableObjectState
  private env: Env
  private app: Hono<{ Bindings: Env }>

  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.env = env
    this.connections = new Set()
    this.app = new Hono<{ Bindings: Env }>()

    // SSE endpoint
    this.app.get('/sse', async (c) => {
      const encoder = new TextEncoder()

      const body = new ReadableStream({
        start: (controller) => {
          // Add this controller to our persistent connections
          this.connections.add(controller)

          // Send initial message
          controller.enqueue(encoder.encode('data: connected\n\n'))

          // Cleanup on connection close
          c.req.raw.signal.addEventListener('abort', () => {
            this.connections.delete(controller)
            controller.close()
          })
        },
      })

      return new Response(body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': 'true',
        },
      })
    })

    // Broadcast endpoint
    this.app.post('/broadcast', async (c) => {
      const update = await c.req.json()
      const encoder = new TextEncoder()

      // Keep track of dead connections to remove
      const deadConnections = new Set<ReadableStreamDefaultController>()

      // Broadcast to all stored connections
      for (const controller of this.connections) {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`))
        } catch (error) {
          // If we can't enqueue, the connection is probably dead
          deadConnections.add(controller)
        }
      }

      // Clean up dead connections
      for (const deadController of deadConnections) {
        this.connections.delete(deadController)
      }

      return c.json({
        success: true,
        connectionsCount: this.connections.size,
        cleanedConnections: deadConnections.size,
      })
    })
  }

  async fetch(request: Request) {
    return this.app.fetch(request)
  }
}
