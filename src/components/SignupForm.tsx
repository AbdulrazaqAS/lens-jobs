import { useState, FormEvent } from "react";
import { account } from "@lens-protocol/metadata";
import { uploadFile, uplaodMetadata } from "../utils/storage-client";
import {
  switchToAccount,
  createNewAccountWithUsername,
  fetchAccountByTxHash,
} from "../utils/account";
import { Context, SessionClient } from "@lens-protocol/client";
import { WalletClient } from "viem";

type Props = {
  onboardingUserSessionClient?: SessionClient<Context>;
  walletClient?: WalletClient;
  createOnboardingSessionClient: Function;
  setSessionClient: Function;
};

export default function SignupForm({
  walletClient,
  onboardingUserSessionClient,
  createOnboardingSessionClient,
  setSessionClient
}: Props) {
  const [name, setName] = useState("");
  const [picture, setPicture] = useState<File>();
  const [username, setUsername] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const generateMetadata = (pictureUri: string) => {
    const metadata = {
      name,
      picture: pictureUri,
    };

    return account(metadata);
  };

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!walletClient) {
      console.error("Error:", new Error("Wallet not connected"));
      alert("Wallet not connected");
      return;
    }

    // TODO: add fields checks

    let sessionClient = onboardingUserSessionClient;

    try {
      setIsCreating(true);

      if (!sessionClient) {
        sessionClient = await createOnboardingSessionClient();
      }

      if (!sessionClient) {
        console.error("Session client not created");
        return;
      }

      console.log("Session client", sessionClient);
      const pictureUri = await uploadFile(picture!);
      console.log("Picture Uri", pictureUri);
      const metadata = generateMetadata(pictureUri);
      const metadataUri = await uplaodMetadata(metadata);
      console.log("MetadataUri", metadataUri);
      const txHash = await createNewAccountWithUsername({
        username,
        metadataUri,
        walletClient,
        sessionClient,
      });
      console.log("CreationTxHash", txHash);
      const account = await fetchAccountByTxHash(txHash);
      console.log("Account", account);
      const accountOwnerSessionClient = await switchToAccount({
        sessionClient,
        address: account?.address,
      });
      setSessionClient(accountOwnerSessionClient);
      // TODO: make profile page available on changing client
      alert("Session client updated");
      console.log("Account owner session client created", accountOwnerSessionClient);
    } catch (error) {
      alert(error);
      console.error("Error creating account:", error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <form onSubmit={submitForm} className="p-4 max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Signup Form</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />

      {/* TODO: Implement already taken check. Use AI to suggest some possible ones */}
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value.toLowerCase())}
        className="w-full border p-2 rounded"
        required
      />

      <input
        placeholder="Picture URL"
        type="file"
        accept="image/*"
        onChange={(e) => setPicture(e.target.files![0])}
        className="w-full border p-2 rounded"
        required
      />

      <button
        type="submit"
        disabled={isCreating}
        className="bg-green-600 w-full text-white px-4 py-2 rounded hover:bg-green-800 hover:cursor-pointer transition"
      >
        {isCreating ? "Creating account..." : "Signup"}
      </button>
    </form>
  );
}
