import { faker } from '@faker-js/faker'
import { ulid } from 'ulid'
import { prisma } from '../client'

const ENVS = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  TEST_USER_NAME: process.env.TEST_USER_NAME as string,
  TEST_USER_EMAIL: process.env.TEST_USER_EMAIL as string,
  TEST_WEBHOOK_URL: process.env.TEST_WEBHOOK_URL as string,
  TEST_DOMAIN_NAME: process.env.TEST_DOMAIN_NAME as string,
  TEST_DOMAIN_FORWARDEMAIL_ID: process.env.TEST_DOMAIN_FORWARDEMAIL_ID as string,
}

// Required environment variables
Object.entries(ENVS).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`${key} is required`)
  }
})

// Safety check to prevent running in production
if (!ENVS.DATABASE_URL.includes('prod=false')) {
  console.error('❌ ERROR: This script can only be run in non-production environments')
  console.error('Add prod=false to your DATABASE_URL to run this script')
  process.exit(1)
}

const args = process.argv.slice(2)
const isDemo = args.includes('--demo')

// biome-ignore lint/suspicious/noConsoleLog: <explanation>
console.log(`\n🌱 Running ${isDemo ? 'demo' : 'regular'} seed...\n`)

const clearDatabase = async () => {
  // Delete in reverse order of dependencies
  await prisma.webhookLog.deleteMany()
  await prisma.webhook.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.message.deleteMany()
  await prisma.domain.deleteMany()
  await prisma.project.deleteMany()
  await prisma.teamInvite.deleteMany()
  await prisma.userOnTeam.deleteMany()
  await prisma.team.deleteMany()
  await prisma.user.deleteMany()

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log('✅ Database cleared')
}

const feedbackMessages = [
  {
    subject: 'Feature Request: Dark Mode Support',
    body_raw: `
      <!DOCTYPE html>
      <html>
      <body>
        <p>Hi team,</p>
        <p>I've been using your product for a few months now and absolutely love it! However, I'd really appreciate if you could add a dark mode option. As someone who works late hours, this would be a game-changer for my eyes.</p>
        <p>I've noticed that many of your competitors already offer this feature, and it would really help with accessibility too.</p>
        <p>Thanks for considering!</p>
        <p>Best regards,<br>Sarah Johnson</p>
      </body>
      </html>
    `,
    body_text:
      "Hi team, I've been using your product for a few months now and absolutely love it! However, I'd really appreciate if you could add a dark mode option. As someone who works late hours, this would be a game-changer for my eyes. I've noticed that many of your competitors already offer this feature, and it would really help with accessibility too. Thanks for considering! Best regards, Sarah Johnson",
    body_stripped:
      "Hi team, I've been using your product for a few months now and absolutely love it! However, I'd really appreciate if you could add a dark mode option. As someone who works late hours, this would be a game-changer for my eyes. I've noticed that many of your competitors already offer this feature, and it would really help with accessibility too. Thanks for considering! Best regards, Sarah Johnson",
    body_ai_summary: 'User requests dark mode feature for better accessibility and eye comfort during late hours.',
  },
  {
    subject: 'Bug Report: Dashboard Loading Issue',
    body_raw: `
      <!DOCTYPE html>
      <html>
      <body>
        <p>Hello Support Team,</p>
        <p>I'm experiencing an issue with the dashboard loading. When I try to access it, I get a blank screen with a loading spinner that never stops. This started happening after the latest update.</p>
        <p>Steps to reproduce:</p>
        <ol>
          <li>Log in to the platform</li>
          <li>Click on Dashboard in the main menu</li>
          <li>Observe the infinite loading spinner</li>
        </ol>
        <p>Browser: Chrome 120.0.6099.130<br>
        OS: Windows 11<br>
        Account: enterprise@example.com</p>
        <p>Please let me know if you need any additional information.</p>
        <p>Regards,<br>Michael Chen</p>
      </body>
      </html>
    `,
    body_text:
      "Hello Support Team, I'm experiencing an issue with the dashboard loading. When I try to access it, I get a blank screen with a loading spinner that never stops. This started happening after the latest update. Steps to reproduce: 1. Log in to the platform 2. Click on Dashboard in the main menu 3. Observe the infinite loading spinner Browser: Chrome 120.0.6099.130 OS: Windows 11 Account: enterprise@example.com Please let me know if you need any additional information. Regards, Michael Chen",
    body_stripped:
      "Hello Support Team, I'm experiencing an issue with the dashboard loading. When I try to access it, I get a blank screen with a loading spinner that never stops. This started happening after the latest update. Steps to reproduce: 1. Log in to the platform 2. Click on Dashboard in the main menu 3. Observe the infinite loading spinner Browser: Chrome 120.0.6099.130 OS: Windows 11 Account: enterprise@example.com Please let me know if you need any additional information. Regards, Michael Chen",
    body_ai_summary:
      'User reports dashboard loading issue with infinite spinner after latest update, including detailed reproduction steps and system information.',
  },
  {
    subject: 'Amazing Customer Support Experience',
    body_raw: `
      <!DOCTYPE html>
      <html>
      <body>
        <p>Dear Team,</p>
        <p>I just wanted to take a moment to express my appreciation for your outstanding customer support. Last week, I had an issue with our account settings, and your support team resolved it within minutes!</p>
        <p>The representative (Emma) was not only knowledgeable but also incredibly patient and helpful. She walked me through the solution step by step and even followed up to ensure everything was working correctly.</p>
        <p>This level of service is what keeps us as loyal customers. Keep up the great work!</p>
        <p>Warm regards,<br>David Rodriguez<br>CTO, TechCorp Inc.</p>
      </body>
      </html>
    `,
    body_text:
      'Dear Team, I just wanted to take a moment to express my appreciation for your outstanding customer support. Last week, I had an issue with our account settings, and your support team resolved it within minutes! The representative (Emma) was not only knowledgeable but also incredibly patient and helpful. She walked me through the solution step by step and even followed up to ensure everything was working correctly. This level of service is what keeps us as loyal customers. Keep up the great work! Warm regards, David Rodriguez CTO, TechCorp Inc.',
    body_stripped:
      'Dear Team, I just wanted to take a moment to express my appreciation for your outstanding customer support. Last week, I had an issue with our account settings, and your support team resolved it within minutes! The representative (Emma) was not only knowledgeable but also incredibly patient and helpful. She walked me through the solution step by step and even followed up to ensure everything was working correctly. This level of service is what keeps us as loyal customers. Keep up the great work! Warm regards, David Rodriguez CTO, TechCorp Inc.',
    body_ai_summary:
      'Customer praises exceptional support experience, highlighting quick resolution and helpful representative.',
  },
  {
    subject: 'API Integration Feedback',
    body_raw: `
      <!DOCTYPE html>
      <html>
      <body>
        <p>Hi there,</p>
        <p>I'm working on integrating your API into our system and have some feedback about the documentation and implementation process.</p>
        <p>Pros:</p>
        <ul>
          <li>Well-structured API endpoints</li>
          <li>Clear authentication process</li>
          <li>Good error handling</li>
        </ul>
        <p>Areas for improvement:</p>
        <ul>
          <li>More code examples in different languages</li>
          <li>Rate limiting documentation could be clearer</li>
          <li>Webhook retry mechanism needs better explanation</li>
        </ul>
        <p>Overall, it's been a positive experience, but these improvements would make it even better.</p>
        <p>Best,<br>Alex Thompson<br>Senior Developer</p>
      </body>
      </html>
    `,
    body_text:
      "Hi there, I'm working on integrating your API into our system and have some feedback about the documentation and implementation process. Pros: - Well-structured API endpoints - Clear authentication process - Good error handling Areas for improvement: - More code examples in different languages - Rate limiting documentation could be clearer - Webhook retry mechanism needs better explanation Overall, it's been a positive experience, but these improvements would make it even better. Best, Alex Thompson Senior Developer",
    body_stripped:
      "Hi there, I'm working on integrating your API into our system and have some feedback about the documentation and implementation process. Pros: - Well-structured API endpoints - Clear authentication process - Good error handling Areas for improvement: - More code examples in different languages - Rate limiting documentation could be clearer - Webhook retry mechanism needs better explanation Overall, it's been a positive experience, but these improvements would make it even better. Best, Alex Thompson Senior Developer",
    body_ai_summary:
      'Developer provides detailed feedback on API integration experience, highlighting strengths and suggesting documentation improvements.',
  },
  {
    subject: 'Mobile App Navigation Feedback',
    body_raw: `
      <!DOCTYPE html>
      <html>
      <body>
        <p>Hello,</p>
        <p>I've been using your mobile app for a while now and have some thoughts about the navigation experience.</p>
        <p>The current hamburger menu is hard to reach on larger phones, and some important features are buried too deep in the menu structure. I'd suggest:</p>
        <ul>
          <li>Moving frequently used actions to a bottom navigation bar</li>
          <li>Adding gesture-based navigation (swipe to go back)</li>
          <li>Implementing a search function that's always accessible</li>
        </ul>
        <p>These changes would significantly improve the user experience, especially for power users like myself.</p>
        <p>Thanks for listening!<br>Lisa Park<br>UX Designer</p>
      </body>
      </html>
    `,
    body_text:
      "Hello, I've been using your mobile app for a while now and have some thoughts about the navigation experience. The current hamburger menu is hard to reach on larger phones, and some important features are buried too deep in the menu structure. I'd suggest: - Moving frequently used actions to a bottom navigation bar - Adding gesture-based navigation (swipe to go back) - Implementing a search function that's always accessible These changes would significantly improve the user experience, especially for power users like myself. Thanks for listening! Lisa Park UX Designer",
    body_stripped:
      "Hello, I've been using your mobile app for a while now and have some thoughts about the navigation experience. The current hamburger menu is hard to reach on larger phones, and some important features are buried too deep in the menu structure. I'd suggest: - Moving frequently used actions to a bottom navigation bar - Adding gesture-based navigation (swipe to go back) - Implementing a search function that's always accessible These changes would significantly improve the user experience, especially for power users like myself. Thanks for listening! Lisa Park UX Designer",
    body_ai_summary:
      'UX designer provides specific suggestions for improving mobile app navigation, focusing on accessibility and user experience.',
  },
  {
    subject: 'Performance Issues on Large Datasets',
    body_raw: `
      <!DOCTYPE html>
      <html>
      <body>
        <p>Hi Support Team,</p>
        <p>We're experiencing significant performance issues when working with large datasets in the analytics dashboard. Specifically:</p>
        <ul>
          <li>Loading times exceed 30 seconds for reports with >100k records</li>
          <li>Filtering operations cause the browser to become unresponsive</li>
          <li>Exporting large datasets fails consistently</li>
        </ul>
        <p>Our current dataset size: ~500k records<br>
        Browser: Firefox 121.0<br>
        Plan: Enterprise</p>
        <p>This is impacting our daily operations. Could you please look into optimizing these operations?</p>
        <p>Regards,<br>James Wilson<br>Data Analyst</p>
      </body>
      </html>
    `,
    body_text:
      "Hi Support Team, We're experiencing significant performance issues when working with large datasets in the analytics dashboard. Specifically: - Loading times exceed 30 seconds for reports with >100k records - Filtering operations cause the browser to become unresponsive - Exporting large datasets fails consistently Our current dataset size: ~500k records Browser: Firefox 121.0 Plan: Enterprise This is impacting our daily operations. Could you please look into optimizing these operations? Regards, James Wilson Data Analyst",
    body_stripped:
      "Hi Support Team, We're experiencing significant performance issues when working with large datasets in the analytics dashboard. Specifically: - Loading times exceed 30 seconds for reports with >100k records - Filtering operations cause the browser to become unresponsive - Exporting large datasets fails consistently Our current dataset size: ~500k records Browser: Firefox 121.0 Plan: Enterprise This is impacting our daily operations. Could you please look into optimizing these operations? Regards, James Wilson Data Analyst",
    body_ai_summary:
      'User reports performance issues with large datasets, including specific metrics and impact on operations.',
  },
  {
    subject: 'Documentation Update Request',
    body_raw: `
      <!DOCTYPE html>
      <html>
      <body>
        <p>Hello Documentation Team,</p>
        <p>I've noticed several outdated sections in your documentation that need updating:</p>
        <ol>
          <li>The API version 2 endpoints are not documented</li>
          <li>The webhook configuration guide is missing the new retry policy</li>
          <li>The authentication section still references the old OAuth flow</li>
        </ol>
        <p>Additionally, it would be helpful to have:</p>
        <ul>
          <li>More troubleshooting guides</li>
          <li>Video tutorials for complex features</li>
          <li>Search functionality in the docs</li>
        </ul>
        <p>Thanks for your attention to this matter.</p>
        <p>Best,<br>Maria Garcia<br>Technical Writer</p>
      </body>
      </html>
    `,
    body_text:
      "Hello Documentation Team, I've noticed several outdated sections in your documentation that need updating: 1. The API version 2 endpoints are not documented 2. The webhook configuration guide is missing the new retry policy 3. The authentication section still references the old OAuth flow Additionally, it would be helpful to have: - More troubleshooting guides - Video tutorials for complex features - Search functionality in the docs Thanks for your attention to this matter. Best, Maria Garcia Technical Writer",
    body_stripped:
      "Hello Documentation Team, I've noticed several outdated sections in your documentation that need updating: 1. The API version 2 endpoints are not documented 2. The webhook configuration guide is missing the new retry policy 3. The authentication section still references the old OAuth flow Additionally, it would be helpful to have: - More troubleshooting guides - Video tutorials for complex features - Search functionality in the docs Thanks for your attention to this matter. Best, Maria Garcia Technical Writer",
    body_ai_summary:
      'Technical writer identifies outdated documentation sections and suggests improvements for better user experience.',
  },
]

export async function demoSeed() {
  await clearDatabase()

  // Create test user
  const testUser = await prisma.user.create({
    data: {
      id: ulid(),
      name: 'Emma Thompson',
      email: ENVS.TEST_USER_EMAIL,
      emailVerified: true,
      image: 'https://i.pravatar.cc/150?img=44',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log('✅ Test user created')

  // Create test user's team with 60 days trial
  const today = new Date()
  const endFreeTrial = new Date(today.setDate(today.getDate() + 60))

  const team = await prisma.team.create({
    data: {
      id: ulid(),
      name: 'Acme Support',
      slug: 'acme-support',
      created_at: new Date(),
      updated_at: new Date(),
      end_free_trial: endFreeTrial,
      members: {
        create: {
          user_id: testUser.id,
          role: 'OWNER',
        },
      },
    },
    include: {
      members: true,
    },
  })

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log('✅ Team created')

  // Create default project
  const project = await prisma.project.create({
    data: {
      id: ulid(),
      name: 'Product Feedback Hub',
      slug: 'product-feedback-hub',
      short_id: faker.string.alphanumeric(10),
      team_id: team.id,
      created_by_user_id: team.members[0]!.user_id,
    },
  })

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log('✅ Default project created')

  // Create webhook
  const webhook = await prisma.webhook.create({
    data: {
      id: ulid(),
      url: ENVS.TEST_WEBHOOK_URL,
      method: 'GET',
      signing_key: faker.string.alphanumeric(32),
      project_id: project.id,
    },
  })

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log('✅ Webhook created')

  // Create messages with realistic feedback content
  const messages = await Promise.all(
    feedbackMessages.map((message) =>
      prisma.message.create({
        data: {
          id: ulid(),
          slug: faker.string.alphanumeric(10),
          subject: message.subject,
          from: faker.internet.email(),
          body_raw: message.body_raw,
          body_text: message.body_text,
          body_stripped: message.body_stripped,
          body_ai_summary: message.body_ai_summary,
          status: 'COMPLETED',
          project_id: project.id,
          handle: faker.string.alphanumeric(8),
          // Each message has 1 webhook, even if it takes multiple attempts
          total_webhooks_count: 1,
        },
      }),
    ),
  )

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(`✅ ${messages.length} feedback messages created`)

  // Create webhook logs for messages
  const _webhookLogs = await Promise.all(
    messages.map(async (message, index) => {
      if (index === 2) {
        // For the third message, create a webhook log that shows a successful retry
        return prisma.webhookLog.create({
          data: {
            id: ulid(),
            message_id: message.id,
            webhook_id: webhook.id,
            status: 'SUCCESS',
            url: ENVS.TEST_WEBHOOK_URL,
            method: 'GET',
            attempts: 2, // Indicates it took 2 attempts
            error: null, // Clear error since it eventually succeeded
          },
        })
      }

      // For all other messages, create a single successful webhook log
      return prisma.webhookLog.create({
        data: {
          id: ulid(),
          message_id: message.id,
          webhook_id: webhook.id,
          status: 'SUCCESS',
          url: ENVS.TEST_WEBHOOK_URL,
          method: 'GET',
          attempts: 1,
        },
      })
    }),
  )

  // All messages should be marked as COMPLETED since all webhooks eventually succeeded
  await Promise.all(
    messages.map((message) =>
      prisma.message.update({
        where: { id: message.id },
        data: { status: 'COMPLETED' },
      }),
    ),
  )

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(`✅ ${messages.length} webhook logs created`)

  // Create domain
  const _domain = await prisma.domain.create({
    data: {
      id: ulid(),
      domain: ENVS.TEST_DOMAIN_NAME,
      forwardemail_id: ENVS.TEST_DOMAIN_FORWARDEMAIL_ID,
      team_id: team.id,
      project_id: project.id,
      created_at: new Date(),
      updated_at: new Date(),
    },
  })

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log('✅ Domain created')

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log('--------------------------------')
}

export async function seed() {
  if (isDemo) {
    await demoSeed()
  }
}
