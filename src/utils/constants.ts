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
}

export enum JobAttributeName {
    fee = "fee",
    feePerHour = "feePerHour",
    deadline = "deadline",
    status = "status",
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

// type JobsTabType = 'recent' | 'for You';
// export const JobsTab: ReadonlyArray<JobsTab> = ["recent", "for You"];
export enum JobsTab {
    Recent = "recent",
    ForYou = "for You",
}