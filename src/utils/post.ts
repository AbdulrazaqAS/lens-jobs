import { SessionClient, uri } from "@lens-protocol/client";
import { post } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { WalletClient } from "viem";

export async function postJob({ sessionClient, walletClient, metadataUri }: { sessionClient:SessionClient, walletClient:WalletClient ,metadataUri: string }) {
    const result = await post(sessionClient,
        { contentUri: uri(metadataUri) }
    )
    .andThen(handleOperationWith(walletClient));

    if (result.isErr()){
        throw result.error;
    }

    return result.value;
}