import PostalMime from 'postal-mime'
import { Hono } from 'hono'

const app = new Hono<{ Bindings: Env }>()

app.get('/', (c) => {
	return c.text('Hello Cloudflare Workers!')
})

// Define the worker with proper types
export default {
	fetch: app.fetch,
	email: async (message, env, ctx) => {
		// env.EMAIL_QUEUE_BINDING.send({
		//   hello: 'world',
		// })

		const email = await PostalMime.parse(message.raw, {
			attachmentEncoding: 'base64',
		})

		console.log('Email', email)

		ctx.waitUntil(message.forward('christian@hiddenvillage.se'))
	},
	// queue: (message, env, ctx) => {
	//   console.log('Received queue message', message)
	// },
} satisfies ExportedHandler<Env>

// // Define the environment variables interface
// interface Env {
//   // Add any environment variables you're using
//   // For example:
//   // MY_SECRET: string;
//   // EMAIL_QUEUE_BINDING: Queue<{ hello: string }>
// }
