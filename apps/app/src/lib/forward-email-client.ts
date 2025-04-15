import { z } from 'zod'

const createDomainResponseSchema = z.object({
  // has_newsletter: z.boolean(),
  // ignore_mx_check: z.boolean(),
  // retention_days: z.number(),
  // has_regex: z.boolean(),
  // has_catchall: z.boolean(),
  // allowlist: z.array(z.string()),
  // denylist: z.array(z.string()),
  // restricted_alias_names: z.array(z.string()),
  // has_adult_content_protection: z.boolean(),
  // has_phishing_protection: z.boolean(),
  // has_executable_protection: z.boolean(),
  // has_virus_protection: z.boolean(),
  // is_catchall_regex_disabled: z.boolean(),
  // has_smtp: z.boolean(),
  // plan: z.string(),
  // max_recipients_per_alias: z.number(),
  // smtp_port: z.string(),
  // members: z.array(
  //   z.object({
  //     user: z.union([
  //       z.string(),
  //       z.object({
  //         id: z.string(),
  //         email: z.string().email().optional(),
  //         plan: z.string().optional(),
  //         display_name: z.string().optional(),
  //       }),
  //     ]),
  //     group: z.enum(['admin', 'user']),
  //     id: z.string().optional(),
  //     object: z.literal('member').optional(),
  //     created_at: z.string().datetime().optional(),
  //     updated_at: z.string().datetime().optional(),
  //   }),
  // ),
  // invites: z.array(z.unknown()),
  // name: z.string(),
  // has_mx_record: z.boolean(),
  // has_txt_record: z.boolean(),
  // verification_record: z.string(),
  // has_recipient_verification: z.boolean(),
  // has_custom_verification: z.boolean(),
  // id: z.string(),
  // object: z.literal('domain'),
  // locale: z.string().optional(),
  // created_at: z.string().datetime(),
  // updated_at: z.string().datetime(),
  // storage_used: z.number().optional(),
  // storage_used_by_aliases: z.number().optional(),
  // storage_quota: z.number().optional(),
  // link: z.string().url(),
  // last_allowlist_sync_at: z.string().datetime().optional(),
  id: z.string(),
})

const getDomainResponseSchema = z.union([
  z.object({
    id: z.string(),
    has_mx_record: z.boolean(),
    has_txt_record: z.boolean(),
    name: z.string(),
    verification_record: z.string(),
  }),
  z.object({
    statusCode: z.literal(404),
    error: z.string(),
    message: z.string(),
  }),
])

const verifyDomainResponseSchema = z.union([
  z.literal("Domain's DNS records have been verified.").transform(() => ({
    success: true,
  })),
  z.object({
    success: z.literal(false),
  }),
])

type RequestArgs<TSchema extends z.ZodType> =
  | {
      endpoint: `/${string}`
      method: 'POST' | 'PUT'
      body: Record<string, any>
      outputSchema: TSchema
    }
  | {
      endpoint: `/${string}`
      method: 'GET'
      outputSchema: TSchema
    }

export class ForwardEmailClient {
  private baseUrl: string

  constructor(private readonly token: string) {
    this.baseUrl = 'https://api.forwardemail.net/v1'
  }

  async request<TSchema extends z.ZodType>(args: RequestArgs<TSchema>): Promise<z.infer<TSchema>> {
    const response = await fetch(`${this.baseUrl}${args.endpoint}`, {
      method: args.method,
      body: args.method === 'POST' || args.method === 'PUT' ? JSON.stringify(args.body) : undefined,
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.token}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    }).catch((error) => {
      throw error
    })

    if (!response.ok) {
      throw new Error(`Failed to request ${args.endpoint}`)
    }

    try {
      const json = await response.json()
      return args.outputSchema.parse(json)
    } catch (_error) {
      if (response.ok) {
        return 'OK'
      }

      const text = await response.text()

      return text
    }
  }

  async createDomain({ domain }: { domain: string }) {
    const createdDomain = await this.request({
      outputSchema: createDomainResponseSchema,
      endpoint: '/domains',
      method: 'POST',
      body: {
        domain,
      },
    })

    // Get all aliases
    const aliases = await this.request({
      outputSchema: z.array(
        z.object({
          id: z.string(),
        }),
      ),
      endpoint: `/domains/${domain}/aliases`,
      method: 'GET',
    })

    // Get the first default created one
    const firstAlias = aliases[0]

    if (!firstAlias) {
      throw new Error('No aliases found')
    }

    // Update the alias to forward to the domain
    await this.request({
      outputSchema: z.array(
        z.object({
          id: z.string(),
        }),
      ),
      endpoint: `/domains/${domain}/aliases/${firstAlias.id}`,
      method: 'PUT',
      body: {
        recipients: 'postilion.ai',
      },
    })

    return createdDomain
  }

  async getDomain({ domain }: { domain: string }) {
    return this.request({
      outputSchema: getDomainResponseSchema,
      endpoint: `/domains/${domain}`,
      method: 'GET',
    })
  }

  async verifyDomain({ domain }: { domain: string }) {
    await this.request({
      outputSchema: verifyDomainResponseSchema,
      endpoint: `/domains/${domain}/verify-records`,
      method: 'GET',
    }).catch((error) => {
      if (error instanceof Error && error.cause === 'Bad Request') {
        return {
          success: false,
        }
      }

      throw error
    })

    return {
      success: true,
    }
  }
}
