import { DateTime } from "@lens-protocol/metadata";
import {
  setAccountMetadata,
  createAccountWithUsername,
  fetchAccount,
  switchAccount,
  fetchAccountsAvailable,
} from "@lens-protocol/client/actions";
import { AccountMetadataDetails } from "@lens-protocol/metadata";
import {
  AnyClient,
  SessionClient,
  uri,
  txHash,
  never,
  evmAddress,
} from "@lens-protocol/client";
import { WalletClient } from "viem";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { client } from "./client";

interface UsernameMetadata {
  id: string;
  linkedTo: string;
  localName: string;
  namespace: string;
  ownedBy: string;
  timestamp: string;
  value: string;
  __typename: string;
}

interface AccountMetadata {
  metadata: AccountMetadataDetails;
  username: UsernameMetadata;
  address: string;
  owner: string;
}

export interface AccountDetails {
  account: AccountMetadata;
  lastActiveOn: DateTime;
  firstLoginOn: DateTime;
}

export async function createNewAccountWithUsername({
  username,
  metadataUri,
  sessionClient,
  walletClient,
}: {
  username: string;
  metadataUri: string;
  sessionClient: SessionClient;
  walletClient: WalletClient;
}) {
  const result = await createAccountWithUsername(sessionClient, {
    username: { localName: username },
    metadataUri: uri(metadataUri),
  })
    .andThen(handleOperationWith(walletClient))
    .andThen(sessionClient.waitForTransaction);

  if (result.isErr()) {
    console.error("Transaction failed:", result.error);
    throw result.error;
  }

  return result.value;
}

// TODO: Handle error
export async function updateAccountMetadata({
  metadataUri,
  sessionClient,
  walletClient,
}: {
  metadataUri: string;
  sessionClient: SessionClient;
  walletClient: WalletClient;
}) {
  const result = await setAccountMetadata(sessionClient, {
    metadataUri: uri(metadataUri),
  }).andThen(handleOperationWith(walletClient)); // TODO: sponsor this
  // No need to wait for mining. Will this improve UX?

  if (result.isErr()) {
    console.error("Transaction failed:", result.error);
    throw result.error;
  }

  return result.value;
}

export async function fetchAccountByTxHash(trxHash:string){
  const result = await fetchAccount(client, {
    txHash: txHash(trxHash),
  });

  if (result.isErr()) {
    console.error("Fetching failed:", result.error);
    throw result.error;
  }

  return result.value;
}

export async function switchToAccount({
  sessionClient,
  address,
}: {
  sessionClient: SessionClient;
  address: string;
}) {
  const result = await sessionClient.switchAccount({
    account: evmAddress(address) ?? never("Account not found"),
  });

  if (result.isErr()) {
    throw result.error;
  }

  return result.value;
}

export async function listAddressAccounts(address: string) {
    const result = await fetchAccountsAvailable(client, {
      managedBy: evmAddress(address),
      includeOwned: true,
    });

    if (result.isErr()) {
      throw result.error;
    }

    return result.value;
  }