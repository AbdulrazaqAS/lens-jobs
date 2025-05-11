import { SessionClient, uri, txHash, evmAddress } from "@lens-protocol/client";
import { post, fetchPost, fetchPosts, fetchPostsForYou, fetchPostsToExplore } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { WalletClient } from "viem";
import { client } from "./client";

export async function postJob({ sessionClient, walletClient, metadataUri }: { sessionClient: SessionClient, walletClient: WalletClient, metadataUri: string }) {
    const result = await post(sessionClient,
        { contentUri: uri(metadataUri) }
    )
        .andThen(handleOperationWith(walletClient));

    if (result.isErr()) {
        throw result.error;
    }

    return result.value;
}

export async function fetchJobByTxHash(trxHash: string) {
    const result = await fetchPost(client, {
        txHash: txHash(trxHash),
    });

    if (result.isErr()) {
        throw result.error
    }

    return result.value;
}

export async function fetchJobsByTags(tags: string[]) {
    const result = await fetchPosts(client, {
        filter: {
            metadata: {
                tags: { all: tags },
            },
        },
    });

    if (result.isErr()) {
        throw result.error;
    }

    return result.value;
}

export async function fetchJobsByQuery(query: string) {
    const result = await fetchPosts(client, {
        filter: {
            searchQuery: query,
        },
    });

    if (result.isErr()) {
        throw result.error;
    }

    return result.value;
}

export async function fetchJobsByHirer(addr: string) {
    const result = await fetchPosts(client, {
        filter: {
            authors: [evmAddress(addr)],
        },
    });

    if (result.isErr()) {
        throw result.error;
    }

    return result.value;
}

export async function fetchAccountRecommendedJobs(addr: string) {
    const result = await fetchPostsForYou(client, {
        account: evmAddress(addr),
        shuffle: false,
    });

    if (result.isErr()) {
        return console.error(result.error);
    }

    return result.value;
}

export async function fetchJobsToExplore(sessionClient: SessionClient | undefined) {
    const result = await fetchPostsToExplore(sessionClient ?? client, {
        shuffle: false,
    });

    if (result.isErr()) {
        return console.error(result.error);
    }

    return result.value;
}