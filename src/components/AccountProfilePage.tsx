import { AppUser } from '@lens-protocol/client';
import AccountDetailsUpdateForm from './AccountDetailsUpdateForm';

interface Props {
    user: AppUser;
}

export default function AccountProfilePage({user}: Props ) {
    return (
        <AccountDetailsUpdateForm user={user}/>
    );
}