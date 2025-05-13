export const Navs: Readonly<{
    dev: string;
    jobs: string;
    profile: string;
}> = {
    dev: "dev",
    jobs: "jobs",
    profile: "profile"
}

export enum AccountModes {
    Freelancer,
    Hirer
}

export const AccountAttributesNames: Readonly<{
    dob: string;
    twitter: string;
    linkedin: string;
    accountMode: string;
}> = {
    dob: "dob",
    twitter: "twitter",
    linkedin: "linkedin",
    accountMode: "accountMode",
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
    "IPFS",
    "Chainlink",
    "Tokenomics",
    "Rust",
    "Crypto Marketing",
    "Community Management",
    "Airdrop Campaigns"
];