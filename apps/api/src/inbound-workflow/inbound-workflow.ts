import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers'
import { createPrismaClient } from '@postilion/db/edge'
import { customAlphabet } from 'nanoid'
import { StepFactory } from './steps/step-factory'

export const generateShortId = () => {
  const createId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8)

  return createId()
}

function _isTextTooLong(text: string, maxTokens = 7000): boolean {
  // Rough estimation: 1 token ≈ 4 characters for English text
  // Using a conservative estimate to account for special characters and formatting
  return text.length > maxTokens * 3
}

// User-defined params passed to your workflow
export type WorkflowParams = {
  from: string
  to: string
  subject: string
  content: string
  contentText?: string
  attachments: Array<{
    filename: string
    mimeType: string
    content: string
  }>
}

export class InboundEmailWorkflow extends WorkflowEntrypoint<Env, WorkflowParams> {
  async run(event: WorkflowEvent<WorkflowParams>, step: WorkflowStep) {
    const stepFactory = new StepFactory(this.env, event)

    const getProjectStep = stepFactory.getProject()
    const project = await step.do(getProjectStep.description, getProjectStep.fn())

    const createMessageStep = stepFactory.createMessage({ project })
    const createdMessage = await step.do(createMessageStep.description, createMessageStep.fn())

    const stripBodyStep = stepFactory.stripBody({ createdMessage })
    const strippedBody = await step.do(stripBodyStep.description, stripBodyStep.fn())

    const processAttachmentsStep = stepFactory.processAttachments({ createdMessage, project })
    await step.do(processAttachmentsStep.description, processAttachmentsStep.fn())

    const generateSummaryStep = stepFactory.generateSummary({ strippedBody, createdMessage, project })
    await step.do(generateSummaryStep.description, generateSummaryStep.fn())

    const getAssociatedWebhooksStep = stepFactory.getAssociatedWebhooks({ project, createdMessage })
    const { webhooks, message } = await step.do(getAssociatedWebhooksStep.description, getAssociatedWebhooksStep.fn())

    for (const webhook of webhooks) {
      const processWebhookStep = stepFactory.processWebhook({ webhook, message })
      await step
        .do(
          processWebhookStep.description,
          {
            retries: {
              limit: 3,
              delay: this.env.DEV ? '2 seconds' : '30 seconds',
              backoff: 'exponential',
            },
          },
          processWebhookStep.fn(),
        )
        .catch(async (error) => {
          const prisma = createPrismaClient(this.env.DATABASE_URL)

          await prisma.webhookLog.create({
            data: {
              status: 'FAILED',
              message_id: message.id,
              url: webhook.url,
              method: webhook.method,
            },
          })

          console.error(`Webhook ${webhook.url} failed after retries:`, error)
        })
    }

    const finalizeMessageStatusStep = stepFactory.finalizeMessageStatus({ createdMessage, webhooks, message, project })
    await step.do(finalizeMessageStatusStep.description, finalizeMessageStatusStep.fn())
  }
}
