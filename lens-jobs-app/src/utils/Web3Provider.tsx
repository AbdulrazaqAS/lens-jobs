"use client";

import { ReactNode } from 'react'
import { WagmiProvider, createConfig, http } from "wagmi";
import { chains } from "@lens-chain/sdk/viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
    getDefaultConfig({
        chains: [chains.mainnet, chains.testnet],
        transports: {
            [chains.mainnet.id]: http(chains.mainnet.rpcUrls.default.http[0]!),
            [chains.testnet.id]: http(chains.testnet.rpcUrls.default.http[0]!),
        },
        walletConnectProjectId: import.meta.env.VITE_PUBLIC_WALLET_CONNECT_PROJECT_ID,
        appName: "Lens Peek",
        appDescription: "A Lens Protocol Social Graph Explorer",
        appUrl: "",
        appIcon: "",
    })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children } : { children: ReactNode }) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider>
                    {children}
                </ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}