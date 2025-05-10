import { Account } from '@lens-protocol/client';
import AccountDetailsUpdateForm from './AccountDetailsUpdateForm';

interface Props {
    currentAccount: Account;
}

export default function AccountProfilePage({currentAccount}: Props ) {
    return (
        <AccountDetailsUpdateForm currentAccount={currentAccount}/>
    );
}