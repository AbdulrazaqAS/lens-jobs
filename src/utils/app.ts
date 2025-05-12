import { txHash, evmAddress, PublicClient, EvmAddress } from "@lens-protocol/client";
import {
  fetchApp,
  fetchAppUsers,
  fetchAppFeeds,
  fetchAppGroups,
  fetchAppSigners,
} from "@lens-protocol/client/actions";

const APP_TX_HASH = import.meta.env.VITE_APP_TX_HASH;
const APP_ADDRESS = import.meta.env.VITE_APP_ADDRESS;

// export interface AppDetails {
//   address: string;
//   createdAt: string;
//   defaultFeedAddress: string;
//   graphAddress: string;
//   namespaceAddress: string;
//   owner: string;
//   sponsorshipAddress: string;
//   treasuryAddress: string;
//   verificationEnabled: boolean;
//   hasAuthorizationEndpoint: boolean;
//   metadata: AppMetadataDetails;
// }

export async function fetchApplicationByTxHash(client: PublicClient) {
  const result = await fetchApp(client, {
    txHash: txHash(APP_TX_HASH),
  });

  if (result.isErr()) {
    throw result.error;
  }

  return result.value;
}

export async function fetchApplicationByAddress(client: PublicClient) {
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
  query: {
    namespaces?: EvmAddress[] | null | undefined;
    localNameQuery: string;
} | null | undefined;
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

export async function fetchApplicationFeeds(client: PublicClient) {
  const result = await fetchAppFeeds(client, {
    app: evmAddress(APP_ADDRESS),
  });

  if (result.isErr()) {
    return console.error(result.error);
  }

  // items: Array<Feed>: [{feed: evmAddress, timestamp: DateTime}, …]
  return result.value;
}

export async function fetchApplicationGroups(client: PublicClient) {
  const result = await fetchAppGroups(client, {
    app: evmAddress(APP_ADDRESS),
  });

  if (result.isErr()) {
    throw result.error;
  }

  return result.value;
}

export async function fetchApplicationSigners(client: PublicClient) {
  const result = await fetchAppSigners(client, {
    app: evmAddress(APP_ADDRESS),
  });

  if (result.isErr()) {
    throw result.error;
  }

  return result.value;
}
