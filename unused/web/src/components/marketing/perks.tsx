import React from "react";
import { cn } from "../../functions/cn";
import { LucideIcon, ZapIcon, PaletteIcon, WaypointsIcon, ShieldCheckIcon, CalendarDaysIcon, CheckCircle } from "lucide-react";
import Container from "../global/container";
import { SectionBadge } from "../ui/section-bade";

// Define perks for roadmap (4 items)
const PERKS = [
  {
    icon: ZapIcon,
    title: "Launch Fast",
    description: "Roll out quickly with optimized AI tools for content creation.",
  },
  {
    icon: PaletteIcon,
    title: "Customize Easily",
    description: "Tailor tools to fit your unique social media strategy.",
  },
  {
    icon: WaypointsIcon,
    title: "Integrate Seamlessly",
    description: "Connect effortlessly with existing platforms and tools.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Scale Securely",
    description: "Grow confidently with secure and reliable performance.",
  },
];

const ROADMAP = [
  {
    quarter: "Q1 2025",
    features: [
      { text: "Beta launch", done: true },
      { text: "BTC perps live", done: true },
      { text: "3x leverage for BTC perps", done: true },
      { text: "Ethereum support", done: true },
    ],
  },
  {
    quarter: "Q2 2025",
    features: [
      { text: "5x leverage for BTC perps", done: true },
      { text: "Referral program", done: false },
      { text: "Mobile interface", done: false },
    ],
  },
  {
    quarter: "Q3 2025",
    features: [
      { text: "Mobile App", done: false },
      { text: "Virtual Bridge and Omnichain off-ramps", done: false },
    ],
  },
  {
    quarter: "Q4 2025",
    features: [
      { text: "Full Launch", done: false },
      { text: "All Major Chains and Wallet Integrations", done: false },
      { text: "Volatile Token Vaults or User Vaults (Copy Trading)", done: false },
      { text: "Virtual Bonds for underwritten yield", done: false },
    ],
  },
];

const Roadmap = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-20 w-full">
      <Container>
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <SectionBadge title="Roadmap" />
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-medium !leading-snug mt-4">
            Our Path Forward
          </h2>
        </div>
      </Container>
      <Container>
        <div className="relative flex flex-col lg:flex-row items-center w-full mt-12">
          {/* Timeline Line */}
          <div className="absolute left-1/2 top-0 lg:top-1/2 lg:left-0 lg:right-0 w-1 h-full lg:w-full lg:h-1 bg-gradient-to-b lg:bg-gradient-to-r from-violet-600/30 to-transparent z-0 rounded-full" />
          <div className="flex flex-col lg:flex-row w-full gap-8 z-10">
            {ROADMAP.map((step, index) => (
              <Step key={index} index={index} isLast={index === ROADMAP.length - 1} {...step} />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

const Step = ({ quarter, features, index, isLast }: {
  quarter: string;
  features: { text: string; done: boolean }[];
  index: number;
  isLast: boolean;
}) => {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center text-center bg-neutral-900/60 rounded-xl shadow-lg border border-neutral-800 px-6 py-8 transition-all duration-300 hover:scale-105 hover:border-violet-600 group",
        "w-full lg:w-64"
      )}
    >
      {/* Step Number/Icon */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 w-10 h-10 flex items-center justify-center rounded-full bg-violet-600 text-white text-lg font-bold shadow-lg z-10 transition-all duration-300 group-hover:bg-violet-500">
        <CalendarDaysIcon className="w-6 h-6" />
      </div>
      {/* Quarter */}
      <div className="mb-4 mt-6 lg:mt-0 text-violet-400 font-bold text-lg">{quarter}</div>
      {/* Features List */}
      <ul className="flex flex-col gap-2 items-start w-full mt-2">
        {features.map((f, i) => (
          <li key={i} className={cn("flex items-center text-left text-sm w-full gap-2", f.done ? "text-violet-400 font-semibold" : "text-neutral-300")}> 
            {f.done ? (
              <span className="relative flex items-center">
                <CheckCircle className="w-5 h-5 text- drop-shadow-glow animate-pulse" />
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-neutral-500 inline-block mr-2" />
            )}
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
      {/* Connector */}
      {!isLast && (
        <div className="hidden lg:block absolute top-1/2 right-0 w-8 h-1 bg-violet-700/40 group-hover:bg-violet-600 transition-all duration-300" />
      )}
      {!isLast && (
        <div className="block lg:hidden absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-violet-700/40 group-hover:bg-violet-600 transition-all duration-300" />
      )}
    </div>
  );
};

export default Roadmap;