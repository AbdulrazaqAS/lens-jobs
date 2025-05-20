import { SessionClient, uri, txHash, evmAddress, AnyClient, Feed, MainContentFocus, PageSize, postId, Post, blockchainData } from "@lens-protocol/client";
import { post, fetchPost, fetchPosts, fetchPostsForYou, fetchPostsToExplore, fetchFeed, bookmarkPost, fetchPostBookmarks, undoBookmarkPost, executePostAction, fetchWhoExecutedActionOnPost, deletePost, editPost } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { keccak256, toBytes, toHex, WalletClient } from "viem";
import { client } from "./client";
import { PaginatedPageSize, Tags } from "./constants";
import { encodeValue } from "./helpers";

const FEED_ADDRESS = import.meta.env.VITE_APP_FEED_ADDRESS;
const JOB_APPLY_ACTION_ADDRESS = import.meta.env.VITE_JOB_APPLY_ACTION_ADDRESS;

export async function postJob({ sessionClient, walletClient, metadataUri }: { sessionClient: SessionClient, walletClient: WalletClient, metadataUri: string }) {
    const feed = await fetchFeedByAddress(FEED_ADDRESS, sessionClient);
    if (!feed) throw new Error("Error fetching feed");
    console.log("Feed", feed);
    checkUserCanPostJob(feed);  // If can't post, exec will stop by throwing error

    const result = await post(sessionClient, {
        contentUri: uri(metadataUri),
        feed: evmAddress(FEED_ADDRESS),
        actions: [
            {
                unknown: {
                    address: evmAddress(JOB_APPLY_ACTION_ADDRESS),
                },
            },
        ],

    }).andThen(handleOperationWith(walletClient));

    if (result.isErr()) {
        throw result.error;
    }

    return result.value;
}

export function checkUserCanEditJob(job: Post) {
    switch (job.operations!.canEdit.__typename) {  // operations won't be undefined because post will be from authenticated session
        case "PostOperationValidationFailed":
            throw new Error(job.operations!.canEdit.reason);
        case "PostOperationValidationUnknown":
            throw new Error("User can edit this job post");
    }
}

export async function updateJobPost({ sessionClient, jobId, walletClient, metadataUri }: { jobId: string, sessionClient: SessionClient, walletClient: WalletClient, metadataUri: string }) {
    const result = await editPost(sessionClient, {
        contentUri: uri(metadataUri),
        post: postId(jobId),
    }).andThen(handleOperationWith(walletClient));

    if (result.isErr()) {
        throw result.error;
    }

    return result.value;
}

async function fetchFeedByAddress(addr: string, sessionClient: SessionClient) {
    const result = await fetchFeed(sessionClient, {
        feed: evmAddress(addr),
    });

    if (result.isErr()) {
        throw result.error;
    }

    return result.value;
}

// TODO: Do it like checkUserCanEditJob
function checkUserCanPostJob(feed: Feed) {
    switch (feed.operations!.canPost.__typename) {  // operations won't be undefined because post will be from authenticated session
        case "FeedOperationValidationFailed":
            console.error("User can't post on this feed:", feed.operations!.canPost.reason);
            throw new Error(`User can't post on this feed: ${feed.operations!.canPost.reason}`);
        case "FeedOperationValidationUnknown":
            console.error("User can't post on this feed");
            throw new Error("User can't post on this feed");
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

export async function fetchJobsByFeed({
    sessionClient,
    addr = FEED_ADDRESS,
    pageSize = PaginatedPageSize,
    cursor = undefined,
}: {
    sessionClient?: SessionClient,
    addr?: string,
    pageSize?: PageSize,
    cursor?: any,
} = {}) {
    const result = await fetchPosts(sessionClient ?? client, {
        filter: {
            feeds: [
                { feed: evmAddress(addr) }
            ],
        },
        pageSize,
        cursor
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
                { feed: evmAddress(FEED_ADDRESS) }
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
                { feed: evmAddress(FEED_ADDRESS) }
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
                { feed: evmAddress(FEED_ADDRESS) }
            ],
            searchQuery: query,
        },
    });

    if (result.isErr()) {
        throw result.error;
    }

    return result.value;
}

export async function fetchJobsByHirer({ addr, sessionClient }: { addr: string, sessionClient?: SessionClient }) {
    const result = await fetchPosts(sessionClient ?? client, {
        filter: {
            feeds: [
                { feed: evmAddress(FEED_ADDRESS) }
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
    let tags: string[] = [];

    for (let i = 0; i < 10; i++) {  // seems like 10 is the max. It doesn't like space in tags.
        const randIdx = Math.floor(Math.random() * Tags.length);
        tags.push(Tags[randIdx].toLowerCase());
    }

    // const tags = Tags.map(tag => tag.toLowerCase());

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

export async function bookmarkPostById({ sessionClient, id }: { sessionClient: SessionClient, id: string }) {
    const result = await bookmarkPost(sessionClient, {
        post: postId(id),
    });

    if (result.isErr()) {
        throw result.error;
    }
}

export async function fetchBookmarkedPosts(sessionClient: SessionClient) {
    const result = await fetchPostBookmarks(sessionClient, {
        filter: {
            feeds: [
                {
                    feed: evmAddress(FEED_ADDRESS),
                },
            ],
        },
    });

    if (result.isErr()) {
        throw result.error;
    }

    return result.value;
}

export async function removeBookmarkedPostById({ sessionClient, id }: { sessionClient: SessionClient, id: string }) {
    const result = await undoBookmarkPost(sessionClient, {
        post: postId(id),
    });

    if (result.isErr()) {
        throw result.error;
    }
}

function jobHasApplyAction(job: Post) {
    for (const action of job.actions) {
        if (action.__typename === "UnknownPostAction") {
            // TODO: Add more checks
            return true;
        }
    }

    return false;
}

export async function applyForJob({
    job,
    revokeApplication,
    appFormUri,  // Job application form uri
    sessionClient,
    walletClient
}: {
    job: Post,
    revokeApplication: boolean,
    appFormUri?: string,
    sessionClient: SessionClient,
    walletClient: WalletClient
}) {
    if (!jobHasApplyAction(job)) {
        throw new Error("Job post has no apply action");
    }

    const result = await executePostAction(sessionClient, {
        post: postId(job.id),
        action: {
            unknown: {
                address: evmAddress(JOB_APPLY_ACTION_ADDRESS),
                params: [
                    {
                        key: blockchainData(keccak256(toBytes("lens.param.appFormUri"))),
                        data: blockchainData(encodeValue(appFormUri ?? "", "bytes appFormUri")),
                    },
                    {
                        key: blockchainData(keccak256(toBytes("lens.param.revoke"))),
                        data: blockchainData(encodeValue(revokeApplication, "bool revoke")),
                    }
                ]
            },
        },
    }).andThen(handleOperationWith(walletClient));

    if (result.isErr()) {
        throw result.error;
    }

    return result.value;
}

// Will include those that that have revoke their application
export async function fetchJobWhoEverApplied(job: Post) {
    const result = await fetchWhoExecutedActionOnPost(client, {
        post: postId(job.id),
        filter: {
            anyOf: [
                {
                    address: evmAddress(JOB_APPLY_ACTION_ADDRESS),
                },
            ],
        },
        pageSize: PageSize.Fifty,
    });

    if (result.isErr()) {
        throw result.error;
    }

    return result.value;
}

// Do it like checkUserCanEditJob
function checkUserCanDeleteJob(job: Post) {
    switch (job.operations!.canDelete.__typename) {  // operations won't be undefined because post will be from authenticated session
        case "PostOperationValidationFailed":
            throw new Error(`Error deleting job: ${job.operations!.canDelete.reason}`);
        case "PostOperationValidationUnknown":
            throw new Error("User can't delete this job");
    }
}

export async function deleteJob({ sessionClient, walletClient, job }: { sessionClient: SessionClient, walletClient: WalletClient, job: Post }) {
    checkUserCanDeleteJob(job);

    if (job.isDeleted) {
        console.error("Job already deleted");
        return;
    }

    // TODO: read deleting post again to delete it's metadata
    const result = await deletePost(sessionClient, {
        post: postId(job.id),
    }).andThen(handleOperationWith(walletClient));

    if (result.isErr()) {
        throw result.error;
    }

    return result.value;
}