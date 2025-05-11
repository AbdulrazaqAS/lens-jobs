import { Account, SessionClient } from '@lens-protocol/client';
import AccountDetailsUpdateForm from './AccountDetailsUpdateForm';

interface Props {
    currentAccount: Account;
    sessionClient: SessionClient;
}

export default function AccountProfilePage({currentAccount, sessionClient}: Props ) {
    return (
        <AccountDetailsUpdateForm currentAccount={currentAccount} sessionClient={sessionClient}/>
    );
}