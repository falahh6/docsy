import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";
import UserAccountNav from "./UserAccountNav";
import MobileNav from "./MobileNav";
import { getUserSubscriptionPlan } from "@/lib/stripe";

const NavBar = async () => {
  const { getUser } = getKindeServerSession();
  const user = getUser();
  const subscriptionPlan = await getUserSubscriptionPlan();

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 item-center justify-between border-b border-zinc-200 max-sm:w-[85%] max-sm:mx-auto">
          <Link
            href={"/"}
            className="flex z-40 justify-between items-center font-semibold"
          >
            <span>docsy.</span>
          </Link>

          <MobileNav user={user} subscription={subscriptionPlan} />

          <div className="hidden items-center space-x-4 sm:flex max-sm:overscroll-y-none">
            {!user ? (
              <>
                <Link
                  href="/pricing"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Pricing
                </Link>

                <LoginLink
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Sign In
                </LoginLink>
                <RegisterLink
                  className={buttonVariants({
                    size: "sm",
                  })}
                >
                  Get Started <ArrowRight className="ml-1 h-5 w-5" />
                </RegisterLink>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Dashboard
                </Link>
                <UserAccountNav
                  name={
                    !user.family_name && !user.given_name
                      ? "Your account"
                      : `${user.given_name} ${user.family_name}`
                  }
                  imageUrl={user.picture ?? ""}
                  email={user.email ?? ""}
                />
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default NavBar;
