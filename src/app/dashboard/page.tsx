import Dashboard from "@/components/Dashboard";
import { db } from "@/db";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { constructMetadata } from "@/lib/utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export const metadata = constructMetadata({
  title: "Dashboard",
});

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();
  const subscriptionPlan = await getUserSubscriptionPlan();

  if (!user || !user.id) redirect("/auth-callback?orgin=dashboard");

  const dbUser = await db.user.findFirst({
    where: {
      id: user.id,
    },
  });

  console.log("DB USER FOUND ", dbUser?.email);

  if (!dbUser) redirect("/auth-callback?orgin=dashboard");

  return <Dashboard isSubscribed={subscriptionPlan.isSubscribed} />;
};

export default Page;
