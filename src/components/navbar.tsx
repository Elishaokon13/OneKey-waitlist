"use client";

import Link from "next/link";
import Image from "next/image";

import { ModeToggle } from "./moon";
import MobileMenu from "./ui/mobile-menu";
export function NavBar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 p-4 transition-all duration-300 ease-in-out">
      <div className="mx-auto max-w-[1024px] ">
        <nav
          className="rounded-2xl border-[1.5px]  border-gray-200 bg-background px-2 transition-all duration-300 ease-in-out dark:border-neutral-700"
          aria-label="Main navigation"
        >
          <div className="flex h-12 items-center justify-between   ">
            <div className="flex items-center">
              <Link
                href="/"
                className="flex flex-shrink-0 items-center"
                aria-label="OneKey Home"
              >
                <Image src="/growify.svg" width={30} height={30} alt="Devlly" />
                <div className="ml-2 text-2xl font-inter font-bold">OneKey</div>
              </Link>
              <nav className="ml-4 hidden md:block" aria-label="Main menu">
                {/* <NavigationMenu>
                  <NavigationMenuList className="font-poppins flex items-center text-neutral-700 dark:text-neutral-300 ">
                    <NavItem href="/scroll">SCROLL</NavItem>
                    <NavItem href="/gig">GIG</NavItem>
                    <NavItem href="/pitchroom">PITCHROOM</NavItem>
                  </NavigationMenuList>
                </NavigationMenu> */}
              </nav>
            </div>

            <div className="hidden items-center space-x-4 lg:flex">
              <ModeToggle />
            </div>
            <div className="lg:hidden">
              <MobileMenu />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
