import React from "react";
import { Background, Connect, Container, CTA, Features, Hero, Pricing, Reviews, Wrapper } from "@/components";
import Partners from "../../components/marketing/companies";
import { Spotlight } from "@/components/ui/spotlight";
import Blog from "@/components/marketing/blog";
import Perks from "@/components/marketing/perks";
import HowItWorks from "@/components/marketing/how-it-works";
import SecurityBadges from "@/components/marketing/security-badges";
import UseCases from "@/components/marketing/use-cases";
import DeveloperPreview from "@/components/marketing/developer-preview";
import ComparisonTable from "@/components/marketing/comparison-table";

const HomePage = () => {
    return (
        <Background>
            <Wrapper className="py-20 relative">
                <Container className="relative">
                    <Spotlight
                        className="-top-40 left-0 md:left-60 md:-top-20"
                        fill="rgba(255, 255, 255, 0.5)"
                    />
                    <Hero />
                </Container>
                <Container className="py-8 lg:py-20">
                    <Partners />
                </Container>
                {/* <Connect /> */}
                <Features />
                <HowItWorks />
                <SecurityBadges />
                <UseCases />
                <DeveloperPreview />
                <ComparisonTable />
                {/* <Pricing /> */}
                <Reviews />
                <Blog />
                <CTA />
            </Wrapper>
        </Background>
    )
};

export default HomePage
