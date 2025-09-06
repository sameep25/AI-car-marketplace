import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { ArrowLeft, CarFront, Heart, Layout } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";

const Header = async ({ isAdminPage = false }) => {
  const user = await checkUser(); //checks if the user is presnt in db,if not creates a new user in db
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="fixed top-0 w-full bg-white/80  backdrop-blur-md z-50 border-b">
      <nav className="mx-auto px-4 py-4 flex items-center justify-between">
        {/* CarLogo */}
        <Link href={isAdminPage ? "/admin" : "/"} className="flex">
          <Image
            src={"/logo.png"}
            alt="vehiql_logo"
            width={100}
            height={60}
            className="object-contain h-12 w-auto"
          />
          {isAdminPage ? (
            <span className="text-xs font-extralight">Admin</span>
          ) : (
            <></>
          )}
        </Link>

        <div className="flex items-center space-x-4">
          {isAdminPage ? (
            <Link href="/">
              <Button variant="outline" className="flex items-center ">
                <ArrowLeft size={18} />
                <span className="hidden md:inline">Back to App</span>
              </Button>
            </Link>
          ) : (
            <SignedIn>
              {isAdmin ? (
                <></>
              ) : (
                <>
                  <Link href="/saved-cars">
                    <Button className="cursor-pointer">
                      <CarFront size={18} />
                      <span className="hidden md:inline">Saved Cars</span>
                    </Button>
                  </Link>
                </>
              )}

              {/* Reservations and Admin */}
              {isAdmin ? (
                <Link href="/admin">
                  <Button variant="outline" className="cursor-pointer">
                    <Layout size={18} />
                    <span className="hidden md:inline">Admin Portal</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/reservations">
                  <Button variant="outline">
                    <Heart size={18} />
                    <span className="hidden md:inline">My Reservations</span>
                  </Button>
                </Link>
              )}

              {/* User button */}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-15 h-15",
                  },
                }}
              />
            </SignedIn>
          )}

          {/* show login button when logout out */}
          <SignedOut>
            <SignInButton>
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
};

export default Header;
