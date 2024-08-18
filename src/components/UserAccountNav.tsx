import { getUserSubscriptionPlan } from "@/lib/stripe";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Gem, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server";

interface userNavProps {
  name: string | undefined;
  email: string;
  imageUrl: string;
}

// eslint-disable-next-line @next/next/no-async-client-component
const UserAccountNav = async ({ name, email, imageUrl }: userNavProps) => {
  const subscriptionPlan = await getUserSubscriptionPlan();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="overflow-visible border-2">
        <Avatar className="relative w-8 h-8 hover:cursor-pointer border-blue-500 hover:border-2">
          {/* {imageUrl ? (
            <div className="relative aspect-square h-full w-full">
              <Image
                fill
                src={imageUrl}
                alt="profile picture"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : ( */}
          <AvatarFallback className="text-gray-500">
            <span className="sr-only text-gray-600">{name}</span>
            <User className="h-4 w-4 text-zinc-900" />
          </AvatarFallback>
          {/* )} */}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-center gap-2 p-2">
          <div className="flex flex-col space-x-0.5 leading-none">
            {name && <p className="font-medium text-sm text-black">{name}</p>}
            {email && (
              <p className="w-[200px] truncate text-xs text-slate-700">
                {email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard"> Dashboard</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          {subscriptionPlan?.isSubscribed ? (
            <Link href="/dashboard/billing">Manage Subscription</Link>
          ) : (
            <Link href="/pricing">
              Upgrade <Gem className="text-blue-600 h-4 w-4 ml-1.5" />{" "}
            </Link>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <LogoutLink>Log out</LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;
