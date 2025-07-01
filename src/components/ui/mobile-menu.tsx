"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useTheme } from "next-themes";
import { MoonStar, Sun } from "lucide-react";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-md hover:bg-secondary-300/10"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[300px] flex-col justify-between sm:w-[400px]"
      >
        <div>
          <SheetHeader className="mb-4">
            <SheetTitle className="text-center">OneKey</SheetTitle>
          </SheetHeader>
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>Identity verification platform</p>
            <p className="text-sm mt-2">Coming soon...</p>
          </div>
        </div>
        <div className="width-full space-y-4 pb-6">
          <div className="width-full">
            {mounted ? (
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? (
                  <>
                    <Sun strokeWidth={1} className="h-5 w-5 mr-2" />
                    Light
                  </>
                ) : (
                  <>
                    <MoonStar strokeWidth={1} className="h-5 w-5 mr-2" />
                    Dark
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
