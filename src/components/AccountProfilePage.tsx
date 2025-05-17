import { Account, SessionClient } from '@lens-protocol/client';
import AccountDetailsUpdateForm from './AccountDetailsUpdateForm';
import LoginCard from './LoginCard';

interface Props {
    currentAccount?: Account;
    sessionClient?: SessionClient;
    setCurrentAccount: Function;
    createOnboardingSessionClient: Function;
    setSessionClient: Function;
}

export default function AccountProfilePage({
    currentAccount,
    sessionClient,
    createOnboardingSessionClient,
    setCurrentAccount,
    setSessionClient
}: Props ) {
    return (
        <>
            {sessionClient ? (
                // If sessionClient is present, then there must be currentAccount
                <AccountDetailsUpdateForm currentAccount={currentAccount!} setCurrentAccount={setCurrentAccount} sessionClient={sessionClient}/>
            ) : (
                <LoginCard
                    createOnboardingSessionClient={createOnboardingSessionClient}
                    setCurrentAccount={setCurrentAccount}
                    setSessionClient={setSessionClient}
                    currentAccount={currentAccount}
                />
            )}
        </>
    );
}