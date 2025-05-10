import { PublicClient, testnet } from "@lens-protocol/client";
import { WalletClient } from "viem";
import { signMessageWith } from "@lens-protocol/client/viem";
import { evmAddress } from "@lens-protocol/client";

import { fragments } from "../fragments";

const APP_ADDRESS = import.meta.env.VITE_APP_ADDRESS;

export const client = PublicClient.create({
  environment: testnet,
  // fragments,
  //origin: "https://myappdomain.xyz",
  //apiKey: "<SERVER-API-KEY>",  // to increase rate limit in server to server call
});

export async function setupOnboardingSessionClient({
  walletClient,
}: {
  walletClient: WalletClient;
}) {
  const authenticated = await client.login({
    onboardingUser: {
      app: evmAddress(APP_ADDRESS),
      wallet: evmAddress(walletClient.account!.address),
    },
    signMessage: signMessageWith(walletClient),
  });

  if (authenticated.isErr()) {
    throw authenticated.error;
  }

  console.log("Onboarding user authenticated");
  return authenticated.value;
}

export async function setupBuilderSessionClient({
  walletClient,
}: {
  walletClient: WalletClient;
}) {
  const authenticated = await client.login({
    builder: {
      address: walletClient.account!.address,
    },
    signMessage: signMessageWith(walletClient),
  });

  if (authenticated.isErr()) {
    throw authenticated.error;
  }

  console.log("Builder user authenticated");
  return authenticated.value;
}

export async function setupAccountOwnerSessionClient({
  walletClient,
  accountAddr,
}: {
  walletClient: WalletClient;
  accountAddr: string;
}) {
  const authenticated = await client.login({
    accountOwner: {
      account: evmAddress(accountAddr),
      app: APP_ADDRESS,
      owner: walletClient.account!.address,
    },
    signMessage: signMessageWith(walletClient),
  });

  if (authenticated.isErr()) {
    throw authenticated.error;
  }

  console.log("Account owner user authenticated");
  return authenticated.value;
}

export async function setupAccountManagerSessionClient({
  walletClient,
  accountAddr,
}: {
  walletClient: WalletClient;
  accountAddr: string;
}) {
  const authenticated = await client.login({
    accountManager: {
      account: evmAddress(accountAddr),
      app: APP_ADDRESS,
      manager: walletClient.account!.address,
    },
    signMessage: signMessageWith(walletClient),
  });

  if (authenticated.isErr()) {
    throw authenticated.error;
  }

  console.log("Account manager user authenticated");
  return authenticated.value;
}
