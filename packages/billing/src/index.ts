import { Polar } from '@polar-sh/sdk'
import type { Subscription } from '@polar-sh/sdk/models/components/subscription.js'

type ClientArgs = {
  accessToken: string
  server: 'production' | 'sandbox'
}

export class PolarClient {
  private polar: Polar

  constructor(args: ClientArgs) {
    this.polar = new Polar({
      accessToken: args.accessToken,
      server: args.server,
    })
  }

  #normalizeSubscription(subscription: Subscription) {
    return {
      id: subscription.id,
      teamId: subscription.metadata.teamId as string,
      createdAt: subscription.createdAt,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      productId: subscription.productId,
      endsAt: subscription.endsAt,
    }
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

  async getSubscription({ subscriptionId }: { subscriptionId: string }) {
    const subscription = await this.polar.subscriptions.get({ id: subscriptionId })

    return this.#normalizeSubscription(subscription)
  }

  async updateSubscription({ subscriptionId, productId }: { subscriptionId: string; productId: string }) {
    const subscription = await this.polar.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: {
        productId,
        cancelAtPeriodEnd: true,
        revoke: null,
      },
    })

    return this.#normalizeSubscription(subscription)
  }

  async cancelSubscription({ subscriptionId }: { subscriptionId: string }) {
    try {
      const cancelledSubscription = await this.polar.subscriptions.update({
        id: subscriptionId,
        subscriptionUpdate: {
          cancelAtPeriodEnd: true,
          revoke: null,
        },
      })

      return this.#normalizeSubscription(cancelledSubscription)
    } catch (error) {
      // If the subscription is already canceled, just return the subscription
      if (error instanceof Error && error.name === 'AlreadyCanceledSubscription') {
        return this.getSubscription({ subscriptionId })
      }

      throw error
    }
  }

  async reactivateSubscription({ subscriptionId }: { subscriptionId: string }) {
    const reactivatedSubscription = await this.polar.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: {
        cancelAtPeriodEnd: false,
        revoke: null,
      },
    })

    return this.#normalizeSubscription(reactivatedSubscription)
  }
}
