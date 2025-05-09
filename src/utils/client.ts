import { PublicClient, testnet } from "@lens-protocol/client";

import { fragments } from "../fragments";

export const client = PublicClient.create({
  environment: testnet,
  // fragments,
  //origin: "https://myappdomain.xyz",
  //apiKey: "<SERVER-API-KEY>",  // to increase rate limit in server to server call
});
