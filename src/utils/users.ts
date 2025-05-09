import { PublicClient } from "@lens-protocol/client";
import { WalletClient } from "viem";
import { signMessageWith } from "@lens-protocol/client/viem";
import { evmAddress } from "@lens-protocol/client";

const APP_ADDRESS = import.meta.env.VITE_APP_ADDRESS;

export async function setupOnboardingUser({
  client,
  walletClient,
}: {
  client: PublicClient;
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

export async function setupBuilderUser({
  client,
  walletClient,
}: {
  client: PublicClient;
  walletClient: WalletClient;
}) {
  const authenticated = await client.login({
    builder: {
      address: walletClient.account!.address,
    },
    signMessage: signMessageWith(walletClient),
  });

  if (authenticated.isErr()) {
    console.error(authenticated.error);
    return;
  }

  console.log("Builder user authenticated");
  return authenticated.value;
}

export async function setupAccountOwnerUser({
  client,
  walletClient,
  accountAddr,
}: {
  client: PublicClient;
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
    console.error(authenticated.error);
    return;
  }

  console.log("Account owner user authenticated");
  return authenticated.value;
}

export async function setupAccountManagerUser({
  client,
  walletClient,
  accountAddr,
}: {
  client: PublicClient;
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
    console.error(authenticated.error);
    return;
  }

  console.log("Account manager user authenticated");
  return authenticated.value;
}
