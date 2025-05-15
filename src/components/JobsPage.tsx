import { Account, SessionClient } from "@lens-protocol/client"
import { AccountAttributeName, AccountModes } from "../utils/constants";
import FreelancerJobsPage from "./FreelancerJobsPage";
import HirerJobsPage from "./HirerJobsPage";

interface Profs {
    sessionClient?: SessionClient;
    currentAccount?: Account;
    scrollToTop: Function;
}

export default function JobsPage({ sessionClient, currentAccount, scrollToTop }: Profs) {
    const accountModeString = currentAccount?.metadata?.attributes
        .find(attr_ => attr_.key === AccountAttributeName.accountMode)?.value

    let accountMode: AccountModes = AccountModes.Freelancer;
    if (accountModeString) accountMode = parseInt(accountModeString) as AccountModes;

    return (
        <div>
            {/* If sessionClient is undefined, user can't interact with the jobs, but can see them */}
            {accountMode === AccountModes.Freelancer && <FreelancerJobsPage sessionClient={sessionClient} currentAccount={currentAccount} scrollToTop={scrollToTop} />}

            {/* Used ! because currentAccount must be present to detect hirer since default is freelanccer */}
            {/* sessionClient can be undefined. Like when currentAccount is set but user rejected authenticaion or an error */}
            {accountMode === AccountModes.Hirer && sessionClient && <HirerJobsPage currentAccount={currentAccount!} sessionClient={sessionClient} />}
        </div>
    )
}