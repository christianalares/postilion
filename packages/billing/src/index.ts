import { Polar } from '@polar-sh/sdk'

export class PolarClient {
  private polar: Polar

  constructor(accessToken: string) {
    this.polar = new Polar({
      accessToken,
      // TODO: Remove hardcoded sandbox
      server: 'sandbox',
    })
  }

  async getProduct(productId: string) {
    const product = await this.polar.products.get({ id: productId })
    return product
  }

  async getProducts() {
    const products = await this.polar.products.list({
      limit: 100,
      isArchived: false,
      sorting: ['price_amount'],
    })

    const items = products.result.items
      .filter((item) => !item.isArchived)
      .map((item) => {
        const prices = item.prices.filter((price) => !price.isArchived && price.amountType === 'fixed')
        const price = prices[0]

        if (price?.amountType !== 'fixed') {
          return null
        }

        return {
          id: item.id,
          name: item.name,
          description: item.description,
          price: {
            id: price.id,
            amount: price.priceAmount,
            currency: price.priceCurrency,
          },
        }
      })
      .filter((product) => product !== null)

    return items
  }

  async createCheckout({
    productId,
    successUrl,
    customerExternalId,
    customerName,
    customerEmail,
    metadata,
  }: {
    productId: string
    successUrl: string
    customerExternalId: string
    customerName: string
    customerEmail: string
    metadata: {
      teamId: string
      teamName: string
    }
  }) {
    const checkout = await this.polar.checkouts.create({
      productId,
      successUrl,
      customerExternalId,
      customerName,
      customerEmail,
      metadata,
    })

    return checkout
  }

  async createPortal({ customerExternalId }: { customerExternalId: string }) {
    const portal = await this.polar.customerSessions.create({
      customerExternalId,
    })

    return {
      url: portal.customerPortalUrl,
    }
  }

  async getSubscription({ teamId }: { teamId: string }) {
    const subscriptions = await this.polar.subscriptions.list({
      limit: 100,
      active: true,
    })

    const subscriptionForTeam = subscriptions.result.items.filter(
      (subscription) => subscription.customer.externalId === teamId,
    )[0]

    if (!subscriptionForTeam) {
      return null
    }

    return {
      id: subscriptionForTeam.id,
      teamId: subscriptionForTeam.metadata.teamId as string,
      createdAt: subscriptionForTeam.createdAt,
      currentPeriodStart: subscriptionForTeam.currentPeriodStart,
      currentPeriodEnd: subscriptionForTeam.currentPeriodEnd,
      productId: subscriptionForTeam.productId,
    }
  }

  async updateSubscription({ subscriptionId, productId }: { subscriptionId: string; productId: string }) {
    const subscription = await this.polar.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: {
        productId,
        cancelAtPeriodEnd: true,
      },
    })

    return {
      id: subscription.id,
      teamId: subscription.metadata.teamId as string,
      createdAt: subscription.createdAt,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      productId: subscription.productId,
    }
  }
}
