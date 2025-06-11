import React from "react";
import { Background, Companies, Connect, Container, CTA, Features, Hero, Roadmap, Pricing, Reviews, Wrapper } from "@/components";
import { Spotlight } from "@/components/ui/spotlight";
import Blog from "@/components/marketing/blog";
import Perks from "../../components/marketing/perks";

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
                    <Companies />
                </Container>
                {/* <Connect /> */}
                <Features />
                <Perks />
                {/* <Pricing /> */}
                <Reviews />
                <Blog />
                <CTA />
            </Wrapper>
        </Background>
    )
};

export default HomePage
