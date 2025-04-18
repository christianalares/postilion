import { serve } from '@hono/node-server'
import { validateRequest } from '@postilion/sdk'
import { Hono } from 'hono'

const app = new Hono()

// Test secret key (should be replaced with your actual secret key from a .env file)
const secret = 'e81e28cdbf87c89f910352f16a695d2d'

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// GET TEST (no body)
app.get('/webhook-test', async (c) => {
  try {
    const headers = Object.fromEntries(c.req.raw.headers.entries())

    const result = validateRequest({
      headers,
      secret,
    })

    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log('✅ [GET] /webhook-test', result)

    return c.json({
      message: 'Verification successful',
      result,
    })
  } catch (error) {
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log('❌ [GET] /webhook-test', error)

    return c.json(
      {
        message: 'Verification failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      400,
    )
  }
})

// POST TEST (with body)
app.post('/webhook-test', async (c) => {
  try {
    const body = await c.req.text()
    const headers = Object.fromEntries(c.req.raw.headers.entries())

    const result = validateRequest({
      body,
      headers,
      secret,
    })

    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log('✅ [POST] /webhook-test', result)

    return c.json({
      message: 'Verification successful',
      result,
    })
  } catch (error) {
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log('❌ [POST] /webhook-test', error)

    return c.json(
      {
        message: 'Verification failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      400,
    )
  }
})

// PUT TEST (with body)
app.put('/webhook-test', async (c) => {
  try {
    const body = await c.req.text()
    const headers = Object.fromEntries(c.req.raw.headers.entries())

    const result = validateRequest({
      body,
      headers,
      secret,
    })

    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log('✅ [PUT] /webhook-test', result)

    return c.json({
      message: 'Verification successful',
      result,
    })
  } catch (error) {
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log('❌ [PUT] /webhook-test', error)

    return c.json(
      {
        message: 'Verification failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      400,
    )
  }
})

// DELETE TEST (no body)
app.delete('/webhook-test', async (c) => {
  try {
    const headers = Object.fromEntries(c.req.raw.headers.entries())

    const result = validateRequest({
      headers,
      secret,
    })

    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log('✅ [DELETE] /webhook-test', result)

    return c.json({
      message: 'Verification successful',
      result,
    })
  } catch (error) {
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log('❌ [DELETE] /webhook-test', error)

    return c.json(
      {
        message: 'Verification failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      400,
    )
  }
})

serve(
  {
    fetch: app.fetch,
    port: 1337,
  },
  (info) => {
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)
