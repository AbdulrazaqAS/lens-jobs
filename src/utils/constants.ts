export const navs: ReadonlyArray<string> = ["Dev", "Jobs", "Profile"];

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