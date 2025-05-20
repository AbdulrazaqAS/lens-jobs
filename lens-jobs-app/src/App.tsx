import { useEffect, useRef, useState } from "react";
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
import JobsPage from "./components/JobsPage";

import { Navs } from "./utils/constants";

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
  const [page, setPage] = useState(Navs.jobs);
  const [currentAccount, setCurrentAccount] = useState<Account>();

  const topRef = useRef<HTMLDivElement | null>(null);

  function scrollToTop(){
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

    return result.value;
  }

  async function pickCurrentAccount(){
    try {
      const lastAcct = await getLastLoggedInAccount();
      if (lastAcct) {
        setCurrentAccount(lastAcct);
        console.log("Last logged in account set as current account:", lastAcct);
        return;
      }

      // If no last account, get the first one from all connected address accounts
      const accts = await listAddressAccounts(account.address!);
      if (!accts || accts.items.length === 0) {
        console.log("Connected in wallet has no any account");
        return;  // have not created any account
      }

      setCurrentAccount(accts.items[0].account); // pick the first one
      // console.log("Connected wallet has", accts.items.length, "accounts");
      console.log("Current account picked:", accts.items[0].account);
    } catch (error) {
      console.error("Error picking current account", error);
    }
  }

  async function createOnboardingSessionClient() {
    if (!walletClient) {
      console.error("Wallet not connected");
      alert("Connect your wallet");
      return;
    }

    try {
      const user = await setupOnboardingSessionClient({ walletClient });
      //setSessionClient(user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async function createAccountOwnerSessionClient() {
    if (!walletClient) return;

    try {
      const user = await setupAccountOwnerSessionClient({ walletClient, accountAddr: currentAccount!.address });
      //setSessionClient(user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Check whether wallet has an account
  useEffect(() => {
    // console.log({
    //   IsConnected: account.isConnected,
    //   AcctStatus: account.status,
    //   HasSessionClient: Boolean(sessionClient),
    // });

    if (account.isConnected){
      pickCurrentAccount();
    } else if (account.isDisconnected){
      setCurrentAccount(undefined);
      console.log("Current account set to undefined");
      logOutAuthenticatedSession();
      setSessionClient(undefined);
    }
  }, [account.status]);

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
        // console.log("Users:", users);

        const usersAccounts = users?.map(async (user) => {
          const paginated = await listAddressAccounts(user.account.owner);
          // console.log("User accounts:", user.account.owner.slice(-6), paginated.items);
          return paginated.items;
        });
        // console.log("Users accounts:", await Promise.all(usersAccounts));
      })
      .catch(console.error);
  }, []);

  return (
    <div ref={topRef} className="p-5 space-y-5 pt-23">
      <NavBar currentPage={page} setPage={setPage} />

      {page === Navs.jobs && <JobsPage currentAccount={currentAccount} sessionClient={sessionClient} scrollToTop={scrollToTop} />}
      {page === Navs.profile &&
        <AccountProfilePage
          currentAccount={currentAccount}
          setCurrentAccount={setCurrentAccount}
          sessionClient={sessionClient}
          createOnboardingSessionClient={createOnboardingSessionClient}
          createAccountOwnerSessionClient={createAccountOwnerSessionClient}
          setSessionClient={setSessionClient}
        />
      }

    </div>
  );
};

export default App;
