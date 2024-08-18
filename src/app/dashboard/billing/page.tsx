import BillingForm from "@/components/BillingForm";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "Billing | docsy",
});
const Page = async () => {
  const subscriptionPlan = await getUserSubscriptionPlan();

  console.log(subscriptionPlan);

  return <BillingForm subscriptionPlan={subscriptionPlan} />;
};

export default Page;
