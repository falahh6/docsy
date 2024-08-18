import { PLANS } from "@/config/stripe";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2023-10-16",
  typescript: true,
});

export async function getUserSubscriptionPlan() {
  const { getUser } = getKindeServerSession();
  const user = getUser();

  if (!user?.id) {
    return {
      id: "plan_id",
      name: "Dummy Plan",
      description: "This is a placeholder description for a dummy plan.",
      price: {
        currency: "USD",
        amount: 99,
        interval: "month",
        priceIds: {
          test: "price_dummy",
        },
      },
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
      stripeSubscriptionId: "sub_dummy",
      stripeCustomerId: "cus_dummy",
    };
  }

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const isSubscribed = Boolean(
    dbUser.stripePriceId &&
      dbUser.stripeCurrentPeriodEnd &&
      dbUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
  );

  const plan = isSubscribed
    ? PLANS.find((plan) => plan.price.priceIds.test === dbUser.stripePriceId)
    : null;

  let isCanceled = false;
  if (isSubscribed && dbUser.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      dbUser.stripeSubscriptionId
    );
    isCanceled = stripePlan.cancel_at_period_end;
  }

  return {
    id: "plan_id",
    name: "Dummy Plan",
    description: "This is a placeholder description for a dummy plan.",
    price: {
      currency: "USD",
      amount: 99,
      interval: "month",
      priceIds: {
        test: "price_dummy",
      },
    },
    isSubscribed: false,
    isCanceled: false,
    stripeCurrentPeriodEnd: null,
    stripeSubscriptionId: "sub_dummy",
    stripeCustomerId: "cus_dummy",
  };
}
