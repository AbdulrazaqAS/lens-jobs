import { useState } from "react";
import { MetadataAttributeType } from "@lens-protocol/metadata";

interface Attribute {
  key: string;
  type: MetadataAttributeType;
  value: string;
}

export default function AccountDetailsUpdateForm({
  onSubmit,
}: {
  onSubmit: Function;
}) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [picture, setPicture] = useState("");
  const [coverPicture, setCoverPicture] = useState("");
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
      value: '{"theme": "dark"}',
    },
  ]);

  const handleAttributeChange = (index: number, value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index]["value"] = value;
    setAttributes(newAttributes);
  };

  const generateMetadata = () => {
    const attrs = attributes.map((attr) => {
      return {
        key: attr.key,
        type: attr.type,
        value: attr.value,
      };
    });

    const metadata = {
      name,
      bio,
      picture,
      coverPicture,
      attributes: attrs,
    };

    return metadata;
  };

  function submitForm(e) {
    e.preventDefault();

    const metadata = generateMetadata();
    console.log("Account Metadata:", metadata);
  }

  return (
    <form onSubmit={submitForm} className="p-4 max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Signup Form</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />

      <textarea
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <input
        placeholder="Picture URL"
        value={picture}
        onChange={(e) => setPicture(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <input
        placeholder="Cover Picture URL"
        value={coverPicture}
        onChange={(e) => setCoverPicture(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <div>
        <h3 className="font-semibold mt-4">Attributes</h3>
        {attributes.map((attr, index) => (
          <div key={index} className="flex gap-2 my-2">
            <label className="w-17">{attr.key.toUpperCase()}</label>
            <input
              placeholder="Value"
              type={attr.type === MetadataAttributeType.DATE ? "date" : "text"}
              value={attr.value}
              onChange={(e) => handleAttributeChange(index, e.target.value)}
              className="border p-2 rounded w-1/2"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Generate Metadata
      </button>
    </form>
  );
}
