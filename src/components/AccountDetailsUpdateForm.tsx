import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { account, MetadataAttribute, MetadataAttributeType } from "@lens-protocol/metadata";
import { AccountOptions } from "@lens-protocol/metadata";
import { uploadFile } from "../utils/storage-client";
import { AppUser } from "@lens-protocol/client";

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
  user: AppUser;
}

export default function AccountDetailsUpdateForm({ user }: Props) {
  const [name, setName] = useState(user.account.metadata?.name ?? "");
  const [bio, setBio] = useState(user.account.metadata?.bio ?? "");
  const [picture, setPicture] = useState<File>();
  const [coverPicture, setCoverPicture] = useState<File>();
  // TODO: Add state for current pic and render it
  const [attributes, setAttributes] = useState<Attribute[]>([
    {
      key: "twitter",
      type: MetadataAttributeType.STRING,
      value: "https://twitter.com/",
    },
    {
      key: "linkedin",
      type: MetadataAttributeType.STRING,
      value: "https://linkedin.com/in/",
    },
    { key: "dob", type: MetadataAttributeType.DATE, value: "" },
    {
      key: "settings",
      type: MetadataAttributeType.JSON,
      value: '{"mode": "freelancer"}',
    },
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
      } else {
        return {
          key: attr.key,
          type: attr.type as OtherAttributes,
          value: attr.value,
        };
      }
    });

    return attrs;
  }

  const generateMetadata = (pictureUri: string, coverPictureUri: string) => {
    const attrs = getAttributes();

    const metadata: AccountOptions = {
      name,
      bio,
      picture: pictureUri,
      coverPicture: coverPictureUri,
      attributes: attrs,
    };

    return account(metadata);
  };

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    let pictureUri = user.account.metadata?.picture;
    let coverPictureUri = user.account.metadata?.coverPicture;

    if (picture) pictureUri = await uploadFile(picture);
    if (coverPicture) coverPictureUri = await uploadFile(coverPicture);

    const metadata = generateMetadata(pictureUri, coverPictureUri);
    console.log("Account Metadata:", metadata);
  }

  // useEffect(() => {
  //   const attrs = attributes.map(attr => {
  //     let value: string | "true" | "false" | undefined;
  //     value = user.account.metadata?.attributes.find(attr_ => attr.key === attr_.key)?.value as typeof value;
  //     if (attr.type === MetadataAttributeType.BOOLEAN) value = value ?? attr.value;
  //     else value = value ?? attr.value;

  //     return {...attr, value}
  //   });

  //   setAttributes(attrs);
    
  // }, [user]);
  
  useEffect(() => {
    const attrs = attributes.map(attr => {
      // The current value from user data
      const rawValue = user.account.metadata?.attributes.find(attr_ => attr.key === attr_.key)?.value;

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
  }, [user]);

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

      <p className="text-md font-medium">Username: {"abdulrazaq_"}</p>

      {/* TODO: Show selected/current pic */}
      <input
        placeholder="Picture"
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, setPicture)}
        className="w-full border p-2 rounded"
      />

      {/* TODO: Show selected/current pic */}
      <input
        placeholder="Cover Picture"
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, setCoverPicture)}
        className="w-full border p-2 rounded"
      />

      <textarea
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full border p-2 rounded"
      />

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
            // Make dob and such required
            />
          </div>
        ))}
      </div>

      {/* TODO: Disable btn until something has been updated */}
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Update
      </button>
    </form>
  );
}
