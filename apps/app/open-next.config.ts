import { defineCloudflareConfig } from '@opennextjs/cloudflare/config'
import kvIncrementalCache from '@opennextjs/cloudflare/kv-cache'

type OpenNextConfig = ReturnType<typeof defineCloudflareConfig>

const config: OpenNextConfig = defineCloudflareConfig({
	incrementalCache: kvIncrementalCache,
})

export default config
