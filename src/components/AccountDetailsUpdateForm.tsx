import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { account, MetadataAttribute, MetadataAttributeType } from "@lens-protocol/metadata";
import { AccountOptions } from "@lens-protocol/metadata";
import { uplaodMetadata, uploadFile } from "../utils/storage-client";
import { Account, SessionClient } from "@lens-protocol/client";
import { fetchAccountByAddress, updateAccountMetadata } from "../utils/account";
import { useWalletClient } from "wagmi";
import { AccountAttributesNames, AccountModes } from "../utils/constants";

interface BooleanAttribute {
  key: string;
  type: MetadataAttributeType.BOOLEAN;
  value: "true" | "false";
}

type OtherAttributes = MetadataAttributeType.DATE | MetadataAttributeType.JSON | MetadataAttributeType.NUMBER | MetadataAttributeType.STRING;
interface OtherAttribute {
  key: string;
  type: OtherAttributes;
  value: string;
}

type Attribute = BooleanAttribute | OtherAttribute;

interface Props {
  currentAccount: Account;
  sessionClient: SessionClient;
  setCurrentAccount: Function;
}

export default function AccountDetailsUpdateForm({ currentAccount, setCurrentAccount, sessionClient }: Props) {
  const { data: walletClient } = useWalletClient();

  const [name, setName] = useState(currentAccount.metadata?.name ?? "");
  const [bio, setBio] = useState(currentAccount.metadata?.bio ?? "");
  const [picture, setPicture] = useState<File>();
  // const [coverPicture, setCoverPicture] = useState<File>();
  const [isUpdating, setIsUpdating] = useState(false);
  // TODO: Add state for current pic and render it
  const [accountMode, setAccountMode] = useState(AccountModes.Freelancer.toString());
  const [attributes, setAttributes] = useState<Attribute[]>([
    {
      key: AccountAttributesNames.twitter,
      type: MetadataAttributeType.STRING,
      value: "https://twitter.com/",
    },
    {
      key: AccountAttributesNames.linkedin,
      type: MetadataAttributeType.STRING,
      value: "https://linkedin.com/in/",
    },
    { key: AccountAttributesNames.dob, type: MetadataAttributeType.DATE, value: "" },
  ]);

  const handleAttributeChange = (index: number, value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index]["value"] = value;
    setAttributes(newAttributes);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, onChange: Function) => {
    if (!e.target.files) return;
    onChange(e.target.files[0]);
  }

  const getAttributes = () => {
    const attrs: Attribute[] = attributes.map((attr) => {
      if (attr.type === MetadataAttributeType.BOOLEAN) {
        return {
          key: attr.key,
          type: MetadataAttributeType.BOOLEAN,
          value: attr.value,
        };
      } else if (attr.type === MetadataAttributeType.DATE) {
        return {
          key: attr.key,
          type: attr.type as OtherAttributes,
          value: (new Date(attr.value)).toISOString(),
        };
      } else {
        return {
          key: attr.key,
          type: attr.type as OtherAttributes,
          value: attr.value,
        };
      }
    });

    attrs.push({
      key: AccountAttributesNames.accountMode,
      type: MetadataAttributeType.STRING,
      value: accountMode,
    })

    return attrs;
  }

  const generateMetadata = (pictureUri: string) => {
    const attrs = getAttributes();

    const metadata: AccountOptions = {
      name,
      bio,
      picture: pictureUri,
      attributes: attrs,
    };

    return account(metadata);
  };

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!walletClient) {
      console.error("Wallet client is not available");
      return;
    }

    let pictureUri = currentAccount.metadata?.picture ?? "";
    //let coverPictureUri = currentAccount.metadata?.coverPicture ?? "";
    setIsUpdating(true);

    try {
      if (picture) pictureUri = await uploadFile(picture);
      //if (coverPicture) coverPictureUri = await uploadFile(coverPicture);

      const metadata = generateMetadata(pictureUri);
      const metadataUri = await uplaodMetadata(metadata);
      console.log("Metadata URI:", metadataUri);
      const txHash = await updateAccountMetadata({ metadataUri, sessionClient, walletClient })
      console.log("Account info update txHash:", txHash);

      async function updateCurrentAccount(){
        const result = await sessionClient.waitForTransaction(txHash);
        if (result.isErr()){
          console.error("Error mining account update:", result.error);
          return;
        }

        const account = await fetchAccountByAddress(currentAccount.address);
        if (!account) {
          console.error("Error fetching updated account data");
          return;
        }
        
        setCurrentAccount(account);
        console.log("Updated account info:", account);
      }
      
      // No need to await for this, let the user see the update btn turn back to normal immediately
      updateCurrentAccount();
    } catch (error) {
      alert(error)
      console.error("Error updating account info:", error);
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    const attrs = attributes.map(attr => {
      // The current value from user data
      const rawValue = currentAccount.metadata?.attributes.find(attr_ => attr.key === attr_.key)?.value;

      if (attr.type === MetadataAttributeType.BOOLEAN) {
        let value: "true" | "false" = attr.value === "true" ? "true" : "false"; // fallback value from default values
        if (rawValue === "true" || rawValue === "false") {
          value = rawValue;
        }
        return { ...attr, value } as {
          value: "true" | "false";
          key: string;
          type: MetadataAttributeType.BOOLEAN;
        };
      } else if (attr.type === MetadataAttributeType.DATE) {
        let value: string;

        if (rawValue) value = new Date(rawValue).toISOString().split('T')[0];
        else value = attr.value;

        return { ...attr, value } as {
          value: string;
          key: string;
          type: OtherAttributes;
        };
      } else {
        let value: string = rawValue ?? attr.value;
        return { ...attr, value } as {
          value: string;
          key: string;
          type: OtherAttributes;
        };
      }
    });

    setAttributes(attrs);

    const accountMode = currentAccount.metadata?.attributes
      .find(attr_ => attr_.key === AccountAttributesNames.accountMode)?.value;
    if (accountMode) setAccountMode(accountMode);  // default is freelancer

  }, [currentAccount]);

  return (
    <form onSubmit={submitForm} className="p-4 max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Update Profile</h2>

      {/* TODOD: Add labels */}
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />

      <p className="text-md font-medium">Username: {currentAccount.username?.localName}</p>

      {/* TODO: Show selected/current pic */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, setPicture)}
        className="w-full border p-2 rounded"
      />

      <textarea
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />

      <div className="space-x-3">
        <label>
          <input
            type="radio"
            name="accountMode"
            value={AccountModes.Freelancer.toString()}
            checked={accountMode === AccountModes.Freelancer.toString()}
            onChange={e => setAccountMode(e.target.value)}
            className="mr-2"
          />
          Freelancer
        </label>

        <label className="ml-3">
          <input
            type="radio"
            name="accountMode"
            value={AccountModes.Hirer.toString()}
            checked={accountMode === AccountModes.Hirer.toString()}
            onChange={e => setAccountMode(e.target.value)}
            className="mr-2"
          />
          Hirer
        </label>
      </div>

      <div>
        {attributes.map((attr, index) => (
          <div key={index} className="flex gap-2 my-2">
            <label className="w-22">{attr.key.toUpperCase()}</label>
            <input
              placeholder="Value"
              type={attr.type === MetadataAttributeType.DATE ? "date" : "text"}
              value={attr.value}
              onChange={(e) => handleAttributeChange(index, e.target.value)}
              className="border p-2 rounded w-1/2"
              required={attr.type === MetadataAttributeType.DATE}
            />
          </div>
        ))}
      </div>

      {/* TODO: Disable btn until something has been updated */}
      <button
        type="submit"
        disabled={isUpdating}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {isUpdating ? "Updating..." : "Update"}
      </button>
    </form>
  );
}
