import { txHash, evmAddress, PublicClient, App } from "@lens-protocol/client";
import {
  fetchApp,
  fetchAppUsers,
  fetchAppFeeds,
  fetchAppGroups,
  fetchAppSigners,
} from "@lens-protocol/client/actions";
import { AppMetadataDetails } from "@lens-protocol/metadata";

const APP_TX_HASH = import.meta.env.VITE_APP_TX_HASH;
const APP_ADDRESS = import.meta.env.VITE_APP_ADDRESS;

export interface AppDetails {
  address: string;
  createdAt: string;
  defaultFeedAddress: string;
  graphAddress: string;
  namespaceAddress: string;
  owner: string;
  sponsorshipAddress: string;
  treasuryAddress: string;
  verificationEnabled: boolean;
  hasAuthorizationEndpoint: boolean;
  metadata: AppMetadataDetails;
}

export async function fetchAppByTxHash(client: PublicClient) {
  const result = await fetchApp(client, {
    txHash: txHash(APP_TX_HASH),
  });

  if (result.isErr()) {
    console.error(result.error);
    return;
  }

  return result.value;
}

export async function fetchAppByAddress(client: PublicClient) {
  const result = await fetchApp(client, {
    app: evmAddress(APP_ADDRESS),
  });

  if (result.isErr()) {
    console.error(result.error);
    return;
  }

  return result.value;
}

export async function fetchAllUsers(client: PublicClient) {
  const result = await fetchAppUsers(client, {
    app: evmAddress(APP_ADDRESS),
  });

  if (result.isErr()) {
    console.error(result.error);
    return;
  }

  // items: Array<AppUser>: [{account: Account, lastActiveOn: DateTime, firstLoginOn: DateTime}, …]
  // const { items, pageInfo } = result.value;

  return result.value;
}

export async function fetchUsersByQuery({
  client,
  query,
}: {
  client: PublicClient;
  query: Object;
}) {
  // Query eg:{localNameQuery: "John"}
  const result = await fetchAppUsers(client, {
    filter: {
      searchBy: query,
    },
    app: evmAddress(APP_ADDRESS),
  });

  if (result.isErr()) {
    console.error(result.error);
    return;
  }

  // items: Array<AppUser>: [{account: Account, lastActiveOn: DateTime, firstLoginOn: DateTime}, …]
  // const { items, pageInfo } = result.value;
  return result.value;
}

export async function fetchAppFeeds(client: PublicClient) {
  const result = await fetchAppFeeds(client, {
    app: evmAddress(APP_ADDRESS),
  });

  if (result.isErr()) {
    return console.error(result.error);
  }

  // items: Array<Feed>: [{feed: evmAddress, timestamp: DateTime}, …]
  return result.value;
}

export async function fetchAppGroups(client: PublicClient) {
  const result = await fetchAppGroups(client, {
    app: evmAddress(APP_ADDRESS),
  });

  if (result.isErr()) {
    return console.error(result.error);
  }

  // items: Array<Group>
  return result.value;
}

export async function fetchAppSigners(client: PublicClient) {
  const result = await fetchAppSigners(client, {
    app: evmAddress(APP_ADDRESS),
  });

  if (result.isErr()) {
    return console.error(result.error);
  }

  // items: Array<AppSigner>: [{signer: evmAddress, timestamp: DateTime}, …]
  return result.value;
}
