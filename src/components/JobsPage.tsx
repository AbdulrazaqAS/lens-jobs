import { Account, SessionClient } from "@lens-protocol/client"
import { AccountAttributesNames, AccountModes } from "../utils/constants";
import FreelancerJobsPage from "./FreelancerJobsPage";
import HirerJobsPage from "./HirerJobsPage";

interface Profs {
    sessionClient?: SessionClient;
    currentAccount?: Account;
}

export default function JobsPage({ sessionClient, currentAccount }: Profs) {
    const accountModeString = currentAccount?.metadata?.attributes
        .find(attr_ => attr_.key === AccountAttributesNames.accountMode)?.value

    let accountMode: AccountModes = AccountModes.Freelancer;
    if (accountModeString) accountMode = parseInt(accountModeString) as AccountModes;
    console.log("Account Mode", accountMode);

    return (
        <div>
            {accountMode === AccountModes.Freelancer && <FreelancerJobsPage sessionClient={sessionClient} />}
            {accountMode === AccountModes.Hirer && sessionClient && <HirerJobsPage sessionClient={sessionClient} />}
        </div>
    )
}