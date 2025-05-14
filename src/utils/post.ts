import { SessionClient, uri, txHash, evmAddress, AnyClient, Feed, MainContentFocus } from "@lens-protocol/client";
import { post, fetchPost, fetchPosts, fetchPostsForYou, fetchPostsToExplore, fetchFeed } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { WalletClient } from "viem";
import { client } from "./client";
import { Tags } from "./constants";

const FEED_ADDRESS = import.meta.env.VITE_APP_FEED_ADDRESS;

export async function postJob({ sessionClient, walletClient, metadataUri }: { sessionClient: SessionClient, walletClient: WalletClient, metadataUri: string }) {
    const feed = await fetchFeedByAddress(FEED_ADDRESS);
    if (!feed) throw new Error("Error fetching feed");
    console.log("Feed", feed);
    checkUserCanPostJob(feed);  // If can't post, exec will stop by throwing error
 
    const result = await post(sessionClient, {
            contentUri: uri(metadataUri), 
            feed: evmAddress(FEED_ADDRESS),
        }
    ).andThen(handleOperationWith(walletClient));

    if (result.isErr()) {
        throw result.error;
    }

    return result.value;
}

async function fetchFeedByAddress(addr: string){
    const result = await fetchFeed(client, {
        feed: evmAddress(addr),
    });

    if (result.isErr()){
        throw result.error;
    }

    return result.value;
}

function checkUserCanPostJob(feed: Feed) {
    if (!feed.operations) {
        console.error("Feed operations is null");
        return;
    }
    
    switch (feed.operations.canPost.__typename) {  // TODO: how does this work based on user. Does it fill the the feed object on fetch or on signin?
    // case "FeedOperationValidationPassed":
    //     canPost = true;
    //     break;
    case "FeedOperationValidationFailed":
        console.error("User can post on this feed:", feed.operations!.canPost.reason);
        throw new Error(`User can post on this feed: ${feed.operations!.canPost.reason}`);
    case "FeedOperationValidationUnknown":
        console.error("User can post on this feed");
        throw new Error("User can post on this feed");
    }
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

export async function fetchJobsByFeed(addr : string = FEED_ADDRESS) {
    const result = await fetchPosts(client, {
        filter: {
            feeds: [
                { feed: evmAddress(addr)}
            ],
        },
    });

    if (result.isErr()) {
        throw result.error;
    }

    return result.value;
}

export async function fetchJobsByAllTags(tags: string[]) {
    const result = await fetchPosts(client, {
        filter: {
            feeds: [
                { feed: evmAddress(FEED_ADDRESS)}
            ],
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

export async function fetchJobsByAnyTag(tags: string[]) {
    const result = await fetchPosts(client, {
        filter: {
            feeds: [
                { feed: evmAddress(FEED_ADDRESS)}
            ],
            metadata: {
                tags: { oneOf: tags },
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
            feeds: [
                { feed: evmAddress(FEED_ADDRESS)}
            ],
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
            feeds: [
                { feed: evmAddress(FEED_ADDRESS)}
            ],
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

export async function fetchJobsToExplore(anyClient: AnyClient = client) {
    const tags = Tags.map(tag => tag.toLowerCase());

    const result = await fetchPostsToExplore(anyClient, {
        filter: {
            metadata: {
                tags: { oneOf: tags },
                mainContentFocus: [MainContentFocus.Article],
            },
        },
        shuffle: false,
    });

    if (result.isErr()) {
        return console.error(result.error);
    }

    return result.value;
}