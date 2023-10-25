"use client";

import { Gem, Menu, User, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { usePathname } from "next/navigation";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/server";
import { Avatar, AvatarFallback } from "./ui/avatar";
import Image from "next/image";

interface mobileNavProps {
  user: KindeUser;
  subscription: any;
}

const MobileNav = ({ user, subscription }: mobileNavProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname();

  const togleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (isOpen) togleMenu();
  }, [pathname]);

  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      togleMenu();
    }
  };

  return (
    <div className="sm:hidden flex items-center">
      {isOpen ? (
        <X
          className="h-8 w-8 relative z-50 text-zinc-500"
          onClick={togleMenu}
        />
      ) : (
        <Menu
          className="h-8 w-8 relative z-50 text-zinc-500"
          onClick={togleMenu}
        />
      )}
      {isOpen ? (
        <div className="fixed animate-in slide-in-from-top-5 fade-in-20 slide-out-to-top-0 fade-out-20 inset-0 z-0 w-full ">
          <ul className="absolute bg-white border-b border-zinc-200 shadow-xl flex flex-col gap-4 w-full px-10 pt-20 pb-8 h-screen">
            {!user ? (
              <>
                <li onClick={() => closeOnCurrent("/log-in")}>
                  <Button asChild variant={"outline"} className="w-full">
                    <Link href={"/log-in"}>Log In</Link>
                  </Button>
                </li>
                <li onClick={() => closeOnCurrent("/sign-up")}>
                  <Button asChild variant={"default"} className="w-full">
                    <Link href={"/sign-up"}>Sign Up</Link>
                  </Button>
                </li>
                <Separator className="my-2" />
                <li
                  onClick={() => closeOnCurrent("/pricing")}
                  className="text-lg font-medium"
                >
                  <Button
                    asChild
                    variant={"link"}
                    className="items-start text-lg p-0 m-0 font-medium"
                  >
                    <Link href={"/pricing"} className="m-0 p-0">
                      Pricing
                    </Link>
                  </Button>
                </li>
              </>
            ) : (
              <>
                <li
                  onClick={() => closeOnCurrent("/pricing")}
                  className="text-lg font-medium"
                >
                  <Button
                    asChild
                    variant={"link"}
                    className="items-start text-lg p-0 m-0 font-medium text-black"
                  >
                    <Link
                      href={"/pricing"}
                      className="m-0 p-0 flex items-center justify-between w-full"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex flex-col space-x-0.5 leading-none w-full">
                          {user.family_name && user.given_name && (
                            <p className="font-medium text-lg text-black">
                              {`${user.given_name} ${user.family_name}`}
                            </p>
                          )}
                          {user.email && (
                            <p className="w-fit text-sm text-slate-700">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <Avatar className="relative w-10 h-10">
                        {user.picture ? (
                          <div className="relative aspect-square h-full w-full">
                            <Image
                              fill
                              src={user.picture}
                              alt="profile picture"
                            />
                          </div>
                        ) : (
                          <AvatarFallback>
                            <span className="sr-only"></span>
                            <User className="h-4 w-4 text-zinc-900" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Link>
                  </Button>
                </li>
                <Separator />
                <li>
                  <Link href="/dashboard"> Dashboard</Link>
                </li>
                <Separator />
                <li>
                  {subscription?.isSubscribed ? (
                    <Link href="/dashboard/billing">Manage Subscription</Link>
                  ) : (
                    <Link href="/pricing" className="flex items-center">
                      Upgrade <Gem className="text-blue-600 h-4 w-4 ml-1.5" />{" "}
                    </Link>
                  )}
                </li>
                <Separator />
                <li>
                  <Link href="/log-out">Log out</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default MobileNav;
