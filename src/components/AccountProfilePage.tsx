import { Account, SessionClient } from '@lens-protocol/client';
import AccountDetailsUpdateForm from './AccountDetailsUpdateForm';

interface Props {
    currentAccount: Account;
    sessionClient: SessionClient;
    setCurrentAccount: Function;
}

export default function AccountProfilePage({currentAccount, setCurrentAccount, sessionClient}: Props ) {
    return (
        <AccountDetailsUpdateForm currentAccount={currentAccount} setCurrentAccount={setCurrentAccount} sessionClient={sessionClient}/>
    );
}