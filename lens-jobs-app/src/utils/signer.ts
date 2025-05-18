import { privateKeyToAccount } from "viem/accounts";

export const signer = privateKeyToAccount(import.meta.env.VITE_APP_PRIVATE_KEY);
