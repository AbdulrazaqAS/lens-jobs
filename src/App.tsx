import { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";

import { evmAddress } from "@lens-protocol/client";
import {
  lastLoggedInAccount,
} from "@lens-protocol/client/actions";

import { client, setupAccountOwnerSessionClient, setupOnboardingSessionClient } from "./utils/client";
import { fetchApplicationByTxHash, fetchAllUsers } from "./utils/app";
import { listAddressAccounts } from "./utils/account";

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

  const navs = ["Dev", "Feed"];

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
    if (!walletClient) return;

    try {
      const user = await setupAccountOwnerSessionClient({ walletClient, accountAddr: currentAccount!.address });
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
  
        // If no last account, get the first one from all connected address accounts
        const accts = await listAddressAccounts(account.address!);
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
    if (!currentAccount) return;

    createAccountOwnerSessionClient().then((sessionClient) => {
      if (!sessionClient) return;
      setSessionClient(sessionClient);
      console.log("Session client created", sessionClient);
    }).catch((error) => {
      console.error("Error creating session client", error);
    });

    // Logout session client when account changes
    return () => {
      logOutAuthenticatedSession();
      setSessionClient(undefined);
    };
  }, [currentAccount]);

  useEffect(() => {
    // Will not allow onboarding session client to pass here
    if (!sessionClient || !currentAccount) return;

    navs.push("Profile");  // Add profile page if session client is available
  }, [sessionClient]);

  useEffect(() => {
    fetchApplicationByTxHash(client)
      .then((appDetails) => {
        if (!appDetails) return;
        setApp(appDetails);
      })
      .catch(console.error);

    fetchAllUsers(client)
      .then(async (paginated) => {
        if (!paginated) return;
        const users = paginated.items;
        setUsers(users);
        console.log("Users:", users);

        const usersAccounts = users?.map(async (user) => {
          const paginated = await listAddressAccounts(user.account.owner);
          console.log("User accounts:", user.account.owner.slice(-6), paginated.items);
          return paginated.items;
        });
        console.log("Users accounts:", await Promise.all(usersAccounts));
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
              setSessionClient={setSessionClient}
            />
          )}
        </>
      )}

      {page === "feed" && <div>Feed</div>}
      {page === "profile" && sessionClient?.isSessionClient && <AccountProfilePage currentAccount={currentAccount!} sessionClient={sessionClient!}/>}

    </div>
  );
};

export default App;
