import { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";

import { evmAddress } from "@lens-protocol/client";
import {
  lastLoggedInAccount,
  fetchAccountsAvailable,
} from "@lens-protocol/client/actions";

import { client, setupAccountOwnerSessionClient, setupOnboardingSessionClient } from "./utils/client";
import { fetchApplicationByTxHash, fetchAllUsers } from "./utils/app";

import type { SessionClient, App, AppUser, Account } from "@lens-protocol/client";

import NavBar from "./components/NavBar";
import SignupForm from "./components/SignupForm";
import AccountProfilePage from "./components/AccountProfilePage";

const APP_ADDRESS = import.meta.env.VITE_APP_ADDRESS;

// Read Authentication > Advanced > Authentication Tokens: To authenticated your app's users
// TODO: Is account needed, walletClient has account inside
const App = () => {
  const account = useAccount();
  const { data: walletClient } = useWalletClient();

  const [app, setApp] = useState<App>();
  const [users, setUsers] = useState<ReadonlyArray<AppUser>>();
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [sessionClient, setSessionClient] = useState<SessionClient>(); // TODO: Use the storage something
  const [page, setPage] = useState("dev");
  const [currentAccount, setCurrentAccount] = useState<Account>();

  const navs: ReadonlyArray<string> = ["Dev", "Feed", "Profile"];

  async function listConnectedAddressAccounts() {
    if (!client || !walletClient) {
      // console.error("Listing available accounts not ready");
      return;
    }

    const result = await fetchAccountsAvailable(client, {
      managedBy: evmAddress(walletClient.account.address),
      includeOwned: true,
    });

    if (result.isErr()) {
      throw result.error;
    }

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
      address: evmAddress(walletClient.account.address),
      app: evmAddress(APP_ADDRESS)  // Specific app, omit for all apps
    });

    if (result.isErr()) {
      throw result.error;
    }

    console.log("Last logged in account", result);
    return result.value;
  }

  async function createOnboardingSessionClient() {
    if (!walletClient) {
      console.error("Wallet not connected");
      alert("Connect your wallet");
      return;
    }

    try {
      const user = await setupOnboardingSessionClient({ walletClient });
      if (user) {
        setSessionClient(user);
        return user;
      }
    } catch (error) {
      throw error;
    }
  }

  async function createAccountOwnerSessionClient() {
    if (!walletClient) {
      console.error("Wallet not connected");
      alert("Connect your wallet");
      return;
    }

    try {
      let lastAcct = await getLastLoggedInAccount();
      if (!lastAcct) {
        const walletAccts = await listConnectedAddressAccounts();
        if (!walletAccts || walletAccts.items.length === 0) return;  // have not created any account

        lastAcct = walletAccts.items[0].account; // pick the first one
      }

      const lastAccountAddr = lastAcct.address;

      const user = await setupAccountOwnerSessionClient({ walletClient, accountAddr: lastAccountAddr });
      if (user) {
        setSessionClient(user);
        return user;
      }
    } catch (error) {
      throw error;
    }
  }

  // Get whether wallet has an account
  useEffect(() => {
    console.log({
      IsConnected: account.isConnected,
      HasWalletClient: Boolean(walletClient),
      HasSessionClient: Boolean(sessionClient),
    });
    
    if (!account.isConnected) return;
    
    async function pickCurrentAccount(){
      try {
        const lastAcct = await getLastLoggedInAccount();
        if (lastAcct) {
          setCurrentAccount(lastAcct);
          console.log("Last logged in account detected");
          return;
        }
  
        // If no last account, get the first one
        const accts = await listConnectedAddressAccounts();
        if (!accts || accts.items.length === 0) return;  // have not created any account
        setCurrentAccount(accts.items[0].account); // pick the first one

        console.log("Connected wallet has", accts.items.length, "accounts");
        console.log("Active account set", accts.items[0].account);
      } catch (error) {
        console.error("Error picking current account", error);
      }
    }

    pickCurrentAccount();

  }, [walletClient, account.isConnected]);

  useEffect(() => {
    fetchApplicationByTxHash(client)
      .then((appDetails) => {
        if (!appDetails) return;
        setApp(appDetails);
      })
      .catch(console.error);

    fetchAllUsers(client)
      .then((paginated) => {
        if (!paginated) return;
        setUsers(paginated.items);
        console.log("Users:", paginated.items);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="p-5 space-y-5 pt-23">
      {/* <ConnectKitButton /> */}
      <NavBar navs={navs} setPage={setPage} />

      {page === "dev" && (
        <>
          {app && (
            <div className="space-y-1">
              <p><strong>Address:</strong> {app.address}</p>
              <p><strong>Created At:</strong> {app.createdAt}</p>
              <p><strong>Default Feed:</strong> {app.defaultFeedAddress}</p>
              <p><strong>Graph:</strong> {app.graphAddress}</p>
              <p><strong>Authorization Endpoint:</strong> {String(app.hasAuthorizationEndpoint)}</p>
              <p><strong>Description:</strong> {app.metadata?.description}</p>
              <p><strong>Developer:</strong> {app.metadata?.developer}</p>
              <p><strong>Name:</strong> {app.metadata?.name}</p>
              <p><strong>Platforms:</strong> {app.metadata?.platforms?.join(", ")}</p>
              <p><strong>Tagline:</strong> {app.metadata?.tagline}</p>
              <p><strong>URL:</strong> {app.metadata?.url}</p>
              <p><strong>Namespace:</strong> {app.namespaceAddress}</p>
              <p><strong>Owner:</strong> {app.owner}</p>
              <p><strong>Sponsorship:</strong> {app.sponsorshipAddress || "Null"}</p>
              <p><strong>Treasury:</strong> {app.treasuryAddress || "Null"}</p>
              <p><strong>Verification:</strong> {String(app.verificationEnabled)}</p>
            </div>
          )}

          {users && (
            <div>
              <h2 className="text-xl font-semibold">Users ({users.length})</h2>
              <ol className="list-decimal ml-6 space-y-2">
                {users.map((item, idx) => (
                  <li key={idx}>
                    <img
                      src={item.account.metadata?.picture ?? "lens-logo.png"}
                      alt="Account pic"
                      className="w-8 h-8 rounded-full mr-2 inline"
                      onError={(e) => (e.currentTarget.src = "lens-logo.png")}
                    />
                    <span>
                      Username: {item.account.username?.localName ?? "Null"} | Name:{" "}
                      {item.account.metadata?.name ?? "Null"} | Addr: ...
                      {item.account.address?.slice(-6)} | Owner: ...
                      {item.account.owner?.slice(-6)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Show signup only if connected */}
          {account.isConnected &&
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded mt-5 cursor-pointer hover:bg-blue-700 transition"
              onClick={() => setShowSignupForm(!showSignupForm)}
            >
              Signup
            </button>
          }

          {showSignupForm && (
            <SignupForm
              onboardingUserSessionClient={sessionClient}
              walletClient={walletClient}
              createOnboardingSessionClient={createOnboardingSessionClient}
            />
          )}
        </>
      )}

      {page === "feed" && <div>Feed</div>}
      {page === "profile" && currentAccount && <AccountProfilePage currentAccount={currentAccount} />}

    </div>
  );
};

export default App;
