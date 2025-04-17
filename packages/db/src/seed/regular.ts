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

export async function regularSeed() {
  await clearDatabase()

  // Create 10 users including test user
  const users = await Promise.all([
    // Create test user's account first
    prisma.user.create({
      data: {
        id: ulid(),
        name: ENVS.TEST_USER_NAME,
        email: ENVS.TEST_USER_EMAIL,
        emailVerified: true,
        image: faker.image.avatar(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    // Create 9 more random users
    ...Array(9)
      .fill(null)
      .map(() =>
        prisma.user.create({
          data: {
            id: ulid(),
            name: faker.person.fullName(),
            email: faker.internet.email().toLowerCase(),
            emailVerified: true,
            image: faker.image.avatar(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }),
      ),
  ])

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(`✅ ${users.length} users created`)

  // Create teams for each user
  const teams = await Promise.all(
    users.map((user, index) => {
      // Set different trial end dates
      let endFreeTrial: Date | null = null

      if (user.email === ENVS.TEST_USER_EMAIL) {
        // Test user's team gets exactly 60 days from today
        const today = new Date()
        endFreeTrial = new Date(today.setDate(today.getDate() + 60))
      } else if (index === 1) {
        // Second team gets expired trial (yesterday)
        endFreeTrial = new Date(Date.now() - 24 * 60 * 60 * 1000)
      } else {
        // Other teams get random trial periods between 1-30 days
        const days = faker.number.int({ min: 1, max: 30 })
        endFreeTrial = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      }

      return prisma.team.create({
        data: {
          id: ulid(),
          name: `${user.name}'s Team`,
          slug: `${user.name.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
          created_at: new Date(),
          updated_at: new Date(),
          end_free_trial: endFreeTrial,
          members: {
            create: {
              user_id: user.id,
              role: 'OWNER',
            },
          },
        },
        include: {
          members: true,
        },
      })
    }),
  )

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(`✅ ${teams.length} teams created`)

  // Create projects for each team
  const projects = await Promise.all(
    teams.map((team) =>
      prisma.project.create({
        data: {
          id: ulid(),
          name: 'Default',
          slug: 'default',
          short_id: faker.string.alphanumeric(10),
          team_id: team.id,
          created_by_user_id: team.members[0]!.user_id,
        },
      }),
    ),
  )

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(`✅ ${projects.length} default projects created`)

  // Create additional random projects for some teams
  const teamsForAdditionalProjects = faker.helpers.shuffle(teams).slice(0, 3)
  const additionalProjects = await Promise.all(
    teamsForAdditionalProjects.map((team) =>
      prisma.project.create({
        data: {
          id: ulid(),
          name: faker.company.name(),
          slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
          short_id: faker.string.alphanumeric(10),
          team_id: team.id,
          created_by_user_id: team.members[0]!.user_id,
        },
      }),
    ),
  )

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(`✅ ${additionalProjects.length} additional projects created`)

  // Create webhooks only for test user's project
  const webhooks = await Promise.all(
    projects.map((project) => {
      const team = teams.find((t) => t.id === project.team_id)!
      const user = users.find((u) => u.id === team.members[0]!.user_id)!

      // Only create webhook for test user's team
      if (user.email === ENVS.TEST_USER_EMAIL) {
        return prisma.webhook.create({
          data: {
            id: ulid(),
            url: ENVS.TEST_WEBHOOK_URL,
            method: 'GET',
            secret: faker.string.alphanumeric(32),
            project_id: project.id,
          },
        })
      }

      return null
    }),
  ).then((results) => results.filter((webhook): webhook is NonNullable<typeof webhook> => webhook !== null))

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(`✅ ${webhooks.length} webhook created`)

  // Create messages for each project
  const messages = await Promise.all(
    projects.map((project) =>
      prisma.message.create({
        data: {
          id: ulid(),
          slug: faker.string.alphanumeric(10),
          subject: faker.lorem.sentence(),
          from: faker.internet.email(),
          body_raw: faker.lorem.paragraphs(3),
          body_text: faker.lorem.paragraphs(2),
          body_stripped: faker.lorem.paragraphs(2),
          body_ai_summary: faker.lorem.sentence(),
          status: 'COMPLETED',
          project_id: project.id,
          handle: faker.string.alphanumeric(8),
          total_webhooks_count: 1,
        },
      }),
    ),
  )

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(`✅ ${messages.length} messages created`)

  // Create webhook logs only for test user's messages
  const webhookLogs = await Promise.all(
    messages.map((message) => {
      const project = projects.find((p) => p.id === message.project_id)!
      const team = teams.find((t) => t.id === project.team_id)!
      const user = users.find((u) => u.id === team.members[0]!.user_id)!

      // Only create webhook logs for test user's messages
      if (user.email === ENVS.TEST_USER_EMAIL) {
        const status = faker.helpers.arrayElement(['SUCCESS', 'FAILED'])
        return prisma.webhookLog.create({
          data: {
            id: ulid(),
            message_id: message.id,
            webhook_id: webhooks.find((w) => w.project_id === message.project_id)!.id,
            status,
            url: ENVS.TEST_WEBHOOK_URL,
            method: 'GET',
            error: status === 'FAILED' ? faker.lorem.sentence() : null,
            attempts: status === 'FAILED' ? 3 : 1,
          },
        })
      }

      return null
    }),
  ).then((results) => results.filter((log): log is NonNullable<typeof log> => log !== null))

  // Update message status to FAILED if any webhook log failed
  await Promise.all(
    messages.map(async (message) => {
      const messageLogs = webhookLogs.filter((log) => log.message_id === message.id)
      const hasFailed = messageLogs.some((log) => log.status === 'FAILED')
      if (hasFailed) {
        await prisma.message.update({
          where: { id: message.id },
          data: { status: 'FAILED' },
        })
      }
    }),
  )

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(`✅ ${webhookLogs.length} webhook logs created`)

  // Create domains only for test user's project
  const domains = await Promise.all(
    teams.map(async (team) => {
      const user = users.find((u) => u.id === team.members[0]!.user_id)!
      const defaultProject = projects.find((p) => p.team_id === team.id && p.slug === 'default')!

      // Only create domain for test user's team
      if (user.email === ENVS.TEST_USER_EMAIL) {
        return prisma.domain.create({
          data: {
            id: ulid(),
            domain: ENVS.TEST_DOMAIN_NAME,
            forwardemail_id: ENVS.TEST_DOMAIN_FORWARDEMAIL_ID,
            team_id: team.id,
            project_id: defaultProject.id,
            created_at: new Date(),
            updated_at: new Date(),
          },
        })
      }

      return null
    }),
  ).then((results) => results.filter((domain): domain is NonNullable<typeof domain> => domain !== null))

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(`✅ ${domains.length} domain created`)

  // Add test user to two additional teams
  const testUser = users[0]
  const otherTeams = teams.slice(1, 3) // Take two other teams

  // Add test user as OWNER to the first additional team
  await prisma.userOnTeam.create({
    data: {
      user_id: testUser.id,
      team_id: otherTeams[0]!.id,
      role: 'OWNER',
      created_at: new Date(),
      updated_at: new Date(),
    },
  })

  // Add test user as MEMBER to the second additional team
  await prisma.userOnTeam.create({
    data: {
      user_id: testUser.id,
      team_id: otherTeams[1]!.id,
      role: 'MEMBER',
      created_at: new Date(),
      updated_at: new Date(),
    },
  })

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log('✅ Added test user to two additional teams')

  // Add some random invites to a few teams
  const randomTeams = faker.helpers.shuffle(teams).slice(0, 3)
  for (const team of randomTeams) {
    const firstMember = team.members[0]
    if (!firstMember) continue

    await prisma.teamInvite.create({
      data: {
        id: ulid(),
        email: faker.internet.email().toLowerCase(),
        role: faker.helpers.arrayElement(['OWNER', 'MEMBER']),
        team_id: team.id,
        created_by_user_id: firstMember.user_id,
        code: faker.string.alphanumeric(32),
        created_at: new Date(),
      },
    })
  }

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log('✅ Added random invites to teams')

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log('--------------------------------')
}
