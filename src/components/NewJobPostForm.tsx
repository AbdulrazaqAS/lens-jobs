import { article, ArticleOptions, MetadataAttributeType } from "@lens-protocol/metadata";
import { useState } from "react";
import { uplaodMetadata } from "../utils/storage-client";
import { useWalletClient } from "wagmi";
import { postJob } from "../utils/post";
import { SessionClient } from "@lens-protocol/client";
import { JobAttributeName, Tags } from "../utils/constants";

interface Props {
  sessionClient: SessionClient;
  setRefetchJobsCounter: Function;
}

interface JobAttribute {
  key: string;
  type: MetadataAttributeType.NUMBER | MetadataAttributeType.STRING;
  value: string;
}

export default function NewJobPostForm({ sessionClient, setRefetchJobsCounter }: Props) {
  const { data: walletClient } = useWalletClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fee, setFee] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [tags, setTags] = useState<string[]>([...Tags]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const handleTagChange = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleAddNewTag = () => {
    // TODO: Make the default tags lower too. Best is to capitalize first letter of words.
    const fixed = newTag.trim().toLowerCase();
    if (fixed && !tags.includes(fixed)) {
      setTags([...tags, fixed]);
      setNewTag('');
    }
  };


  function getAttributes(){
    const feeAttr: JobAttribute = {
      key: JobAttributeName.fee,
      type: MetadataAttributeType.NUMBER,
      value: fee.toString(),
    }
    
    const deadlineAttr: JobAttribute = {
      key: JobAttributeName.deadline,
      type: MetadataAttributeType.STRING,
      value: deadline
    }

    return [feeAttr, deadlineAttr];
  }

  function generateMetadata() {
    const attrs = getAttributes();

    const metadata: ArticleOptions = {
      title,
      content,
      tags: selectedTags,
      attributes: attrs,
    }

    return article(metadata);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletClient) return;

    setIsLoading(true);

    try {
      const metadata = generateMetadata();
      const metadataUri = await uplaodMetadata(metadata);
      const txHash = await postJob({ sessionClient, walletClient, metadataUri });
      setRefetchJobsCounter((prev: number) => prev + 1);
      console.log("Post txHash", txHash);

      setTitle("");
      setContent("");
      setSelectedTags([]);
      setDeadline("");
      setFee(0);
    } catch (error) {
      console.error("Job post error:", error);
      alert("Failed to post job");
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface p-6 rounded-lg shadow-lg max-w-xl mx-auto space-y-6 border border-primary"
    >
      <h2 className="text-2xl font-bold text-primary">Post a New Job</h2>

      <div>
        <label className="block mb-1 font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded bg-background border border-gray-600 text-white"
          placeholder="e.g. Develop a smart contract"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 rounded bg-background border border-gray-600 text-white"
          placeholder="Brief description of the job..."
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Fee (USDC)</label>
          <input
            type="number"
            min="0"
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
            className="w-full p-2 rounded bg-background border border-gray-600 text-white"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full p-2 rounded bg-background border border-gray-600 text-white"
            required
          />
        </div>
      </div>

      <div>
        <label className="block mb-2 font-medium">Tags</label>
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <label key={tag} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => handleTagChange(tag)}
                className="accent-primary"
              />
              <span>{tag}</span>
            </label>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add custom tag"
            className="flex-1 p-2 rounded bg-background border border-gray-600 text-white"
          />
          <button
            type="button"
            onClick={handleAddNewTag}
            className="px-4 py-2 bg-secondary text-black font-medium rounded hover:opacity-90"
          >
            Add Tag
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-primary text-white font-semibold rounded hover:bg-opacity-90"
      >
        {isLoading ? "Posting..." : "Post Job"}
      </button>
    </form>
  )
}
