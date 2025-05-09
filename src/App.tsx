import { ConnectKitButton } from "connectkit";
import { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";

import { evmAddress } from "@lens-protocol/client";
import {
  lastLoggedInAccount,
  fetchAccountsAvailable,
} from "@lens-protocol/client/actions";

import { setupOnboardingUser } from "./utils/users";
import { client } from "./utils/client";
import { AccountDetails } from "./utils/account";
import { fetchAppByTxHash, fetchAllUsers, AppDetails } from "./utils/app";

import type { SessionClient } from "@lens-protocol/client";

import SignupForm from "./components/SignupForm";

const LensJobs_URI =
  "lens://50efa5c55fb75422540b9227067c97f706bfeeb3e1e46d24e322873a1f493450";
const admins = [
  "0xDaaE14a470e36796ADf9c75766D3d8ADD0a3D94c",
  "0x09938A51D5AF9c3ee0262865dba74F78DCFC99a6",
];

// Read Authentication > Advanced > Authentication Tokens: To authenticated your app's users
// TODO: Is account needed, walletClient has account inside
const App = () => {
  const account = useAccount();
  const { data: walletClient } = useWalletClient();

  const [app, setApp] = useState<AppDetails>();
  const [users, setUsers] = useState<AccountDetails[]>();
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [sessionClient, setSessionClient] = useState<SessionClient>(); // TODO: Use the storage something

  async function listConnectedAddressAccounts() {
    if (!client || !walletClient) {
      // console.error("Listing available accounts not ready");
      return;
    }

    const result = await fetchAccountsAvailable(client, {
      managedBy: evmAddress(walletClient.account.address),
      includeOwned: true,
    });
    console.log("Connected Address Accounts", result.value);
    return result.value;
  }

  async function logOutAuthenticatedSession() {
    // Acct Owner and manager only
    if (sessionClient) sessionClient.logout();
  }

  async function getLastLoggedInAccount() {
    if (!walletClient || !client) {
      // console.error("Getting last logged in account not ready");
      return;
    }

    const result = await lastLoggedInAccount(client, {
      address: evmAddress(walletClient!.account!.address),
      // app: evmAddress{TESTNET_APP}  // Specific app, omit for all apps
    });

    if (result.isErr()) {
      console.error("Error getting last logged in account:", result.error);
      return;
    }
    console.log("Last logged in account", result);

    return result;
  }

  async function createOnboardingSessionClient() {
    if (!walletClient) {
      console.error("Error:", new Error("Connect wallet"));
      alert("Connect wallet");
      return;
    }

    try {
      const user = await setupOnboardingUser({ client, walletClient });
      if (user) {
        setSessionClient(user);
        return user;
      }
    } catch (error) {
      throw error;
    }
  }

  useEffect(() => {
    // if (!walletClient || !account.isConnected || sessionClient) return;
    if (!walletClient || !account.isConnected) return;

    // setupOnboardingUser({client, walletClient}).then(async () => {
    //   console.log("Session client loaded");
    // });
    // listConnectedAddressAccounts();
    // getLastLoggedInAccount();

    const info = {
      IsConnected: account.isConnected,
      HasWalletClient: Boolean(walletClient),
      HasSessionClient: Boolean(sessionClient),
    };
    console.log(info);
  }, [walletClient, account.isConnected, sessionClient]);

  useEffect(() => {
    fetchAppByTxHash(client).then((app) => {
      setApp(app);
    });

    fetchAllUsers(client).then((result) => {
      // items: Array<AppUser>: [{account: Account, lastActiveOn: DateTime, firstLoginOn: DateTime}, …]
      const { items, pageInfo } = result;
      setUsers(items);
      console.log("Users:", items);
    });
  }, []);

  return (
    <div className="p-5 space-y-5">
      <ConnectKitButton />
      {app && (
        <div>
          <p>Address {app.address}</p>
          <p>CreatedAt {app.createdAt}</p>
          <p>DefaultFeedAddress {app.defaultFeedAddress}</p>
          <p>GraphAddress {app.graphAddress}</p>
          <p>HasAuthorizationEndpoint {app.hasAuthorizationEndpoint}</p>
          <p>Description {app.metadata.description}</p>
          <p>Developer {app.metadata.developer}</p>
          <p>Name {app.metadata.name}</p>
          <p>Platforms {app.metadata.platforms.join(", ")}</p>
          <p>Tagline {app.metadata.tagline}</p>
          <p>Url {app.metadata.url}</p>
          <p>NamespaceAddress {app.namespaceAddress}</p>
          <p>Owner {app.owner}</p>
          <p>SponsorshipAddress {app.sponsorshipAddress || "Null"}</p>
          <p>TreasuryAddress {app.treasuryAddress || "Null"}</p>
          <p>
            VerificationEnabled {Boolean(app.verificationEnabled).toString()}
          </p>
        </div>
      )}
      {users && (
        <div>
          <h2>Users ({users.length})</h2>
          <ol>
            {users.map((item, idx) => (
              <li key={idx} className="list-decimal">
                <img
                  src={item.account.metadata?.picture}
                  alt="Account pic"
                  className="w-8 h-8 rounded-full mr-2 inline"
                />
                Username: {item.account.username?.localName || "Null"} Name:{" "}
                {item.account.metadata?.name || "Null"} Addr: ...
                {item.account.address.slice(37)} Owner: ...
                {item.account.owner.slice(37)}
              </li>
            ))}
          </ol>
        </div>
      )}
      <button
        className="bg-blue-500 text-white px-3 py-1 rounded mt-5"
        onClick={() => setShowSignupForm(!showSignupForm)}
      >
        Signup
      </button>
      {showSignupForm && (
        <SignupForm
          onboardingUserSessionClient={sessionClient}
          walletClient={walletClient}
          createOnboardingSessionClient={createOnboardingSessionClient}
        />
      )}
    </div>
  );
};

export default App;
