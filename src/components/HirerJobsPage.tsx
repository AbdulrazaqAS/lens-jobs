import { useEffect, useState } from "react"
import { Post, SessionClient } from "@lens-protocol/client"
import { fetchJobsByHirer } from "../utils/post";
import { useWalletClient } from "wagmi";
import NewJobPostForm from "./NewJobPostForm";

interface Profs {
    sessionClient: SessionClient;
}

export default function HirerJobsPage({ sessionClient }: Profs) {
    const {data: walletClient} = useWalletClient();
    const [jobs, setJobs] = useState<ReadonlyArray<Post>>();
    const [showNewJobForm, setShowNewJobForm] = useState(false);

    useEffect(() => {
        fetchJobsByHirer(walletClient!.account.address!).then((paginated) => {
            if (!paginated) return;
            const jobs = paginated.items
            const filteredJobs = jobs.filter((job) => job.__typename === "Post");  // only posts, removed reposts
            console.log("Account's jobs", filteredJobs);
            setJobs(filteredJobs);
            // alert(posts);
        })

    }, []);

    return (
        <div>
            <button
                className="bg-green-600 text-white mb-4 px-4 py-2 rounded hover:bg-green-700"
                onClick={() => setShowNewJobForm(!showNewJobForm)}
            >
                {showNewJobForm? "Cancel" : "Create New Job"}
            </button>

            {showNewJobForm && <NewJobPostForm sessionClient={sessionClient}/>}

            {jobs && jobs.length > 0 &&
                <div>
                    <p>Trending Jobs</p>
                    <ul className="list-disc">
                        {jobs.map((job, idx) => (
                            <li key={idx}>
                                {job.id.slice(0, 10)}...
                            </li>
                        ))}
                    </ul>
                </div>
            }
        </div>
    )
}