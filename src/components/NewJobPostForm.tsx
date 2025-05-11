import { article, ArticleOptions } from "@lens-protocol/metadata";
import { useState } from "react";
import { uplaodMetadata } from "../utils/storage-client";
import { useWalletClient } from "wagmi";
import { postJob } from "../utils/post";
import { SessionClient } from "@lens-protocol/client";

interface Props {
    sessionClient : SessionClient;
}

export default function NewJobPostForm({sessionClient}: Props) {
    const {data: walletClient} = useWalletClient();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    function generateMetadata(){
        const metadata : ArticleOptions = {
            title,
            content,
            tags: tags.split(","),
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
            const txHash = await postJob({sessionClient, walletClient, metadataUri});
            
            alert("Job posted successfully!");
            setTitle("");
            setContent("");
            setTags("");
        } catch (error) {
            console.error("Job post error:", error);
            alert("Failed to post job");
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold">Post a New Job</h2>

            <input
                className="w-full border p-2 rounded"
                placeholder="Job Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />

            <textarea
                className="w-full border p-2 rounded"
                placeholder="Job Description"
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
            />

            <input
                className="w-full border p-2 rounded"
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
            />

            <button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                {isLoading ? "Posting..." : "Post Job"}
            </button>
        </form>
    );
}