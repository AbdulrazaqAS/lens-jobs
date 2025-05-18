import { chains } from "@lens-chain/sdk/viem";
import { immutable, StorageClient } from "@lens-chain/storage-client";
import { AccountMetadata, ArticleMetadata } from "@lens-protocol/metadata";

export const storageClient = StorageClient.create();

export async function uploadFile(file: File) {
    const { uri } = await storageClient.uploadFile(file, {
        acl: immutable(chains.testnet.id),
    });

    return uri;
}

export async function uplaodMetadata(metadata: AccountMetadata | ArticleMetadata) {
    const { uri } = await storageClient.uploadAsJson(metadata, {
        acl: immutable(chains.testnet.id),
    });

    return uri;
}