"use client";

import React from "react"
// import { ClerkProvider } from "@clerk/nextjs"
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface Props {
    children: React.ReactNode;
}

// const client = new QueryClient();

const Providers = ({ children }: Props) => {
    return (
        <>{children}</>
    );
};

export default Providers