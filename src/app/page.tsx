"use client";

import Footer from "@/components/footer";
import HeroAi from "@/components/hero";
import { NavBar } from "@/components/navbar";
import WaitlistSignup from "@/components/waitlist";

const Page = () => {
  return (
    <>
      <div className="">
        <NavBar />
        <main className="mt-10">
          <HeroAi />
          <section className="py-20">
            <WaitlistSignup />
          </section>
          <Footer />
        </main>
      </div>
    </>
  );
};

export default Page;
