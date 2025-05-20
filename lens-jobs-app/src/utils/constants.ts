import { PageSize } from "@lens-protocol/client";

export const PaginatedPageSize = PageSize.Ten;
export const JobsPerPage = PaginatedPageSize === PageSize.Ten ? 10 : 50;

export enum Navs {
    jobs = "jobs",
    profile = "profile",
    dev = "dev",
}

export enum AccountModes {
    Freelancer,
    Hirer
}

export enum AccountAttributeName {
    dob = "dob",
    twitter = "twitter",
    linkedin = "linkedin",
    accountMode = "accountMode",
    totalSpent = "totalSpent"
}

export enum JobAttributeName {
    fee = "fee",
    feePerHour = "feePerHour",
    deadline = "deadline",
    status = "status",
    freelancer = "freelancer",
}

export const Tags: ReadonlyArray<string> = [
    "Smart Contracts",
    "Solidity",
    "DeFi",
    "NFTs",
    "DAOs",
    "Lens",
    "Lens Protocol",
    "Web3 Development",
    "Smart Contract Auditing",
    "Dapp",
    "Ethereum",
    "Polygon",
    "Arbitrum",
    "ZK",
    "Gas",
    "Gas Optimization",
    "Oracle",
    "IPFS",
    "Chainlink",
    "Tokenomics",
    "Rust",
    "Crypto Marketing",
    "Community Management",
    "Airdrop Campaigns"
];

export enum JobSearchCategories {
    Content = 'content',
    Tags = 'tags',
    Username = 'username',
    Address = 'address',
}

// rename to FreelancerJobsTabs
export enum JobsTab {
    Recent = "Recent Jobs",
    Applied = "Applied Jobs",
    Bookmark = "Bookmarked Jobs",
}

export enum JobStatus {
    Hiring = 'hiring',
    Finished = 'finished',
    Sealed = 'sealed',
}

export const JobStatusStyles: Record<JobStatus, string> = {
    hiring: 'bg-secondary text-black',
    finished: 'bg-accent text-black',
    sealed: 'bg-primary text-white',
    // deleted: 'bg-danger text-white',
};