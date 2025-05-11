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