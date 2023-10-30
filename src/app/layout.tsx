import "./globals.css";
import { Inter } from "next/font/google";
import { cn, constructMetadata } from "@/lib/utils";
import NavBar from "@/components/NavBar";
import Providers from "@/components/Prividers";
import "react-loading-skeleton/dist/skeleton.css";
import "simplebar-react/dist/simplebar.min.css";
import { Toaster } from "@/components/ui/toaster";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <Providers>
        <body
          className={cn(
            "min-h-screen font-sans antialiased grainy",
            inter.className
          )}
        >
          <NextTopLoader showSpinner={false} />
          <Toaster />
          <NavBar />
          {children}
        </body>
      </Providers>
    </html>
  );
}
