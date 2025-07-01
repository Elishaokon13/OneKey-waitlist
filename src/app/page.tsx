"use client";
import React from "react";
import Footer from "@/components/footer";
import HeroAi from "@/components/hero";
import { NavBar } from "@/components/navbar";

const Page = () => {
  return (
    <>
      <div className="font-space-grotesk">
        <NavBar />
        <main className="mt-10">
          <HeroAi />
          <Footer />
        </main>
      </div>
    </>
  );
};

export default Page;
