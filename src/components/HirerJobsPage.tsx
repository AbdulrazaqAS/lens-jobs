import { useEffect, useState } from "react"
import { Account, ArticleMetadata, Post, SessionClient } from "@lens-protocol/client"
import { fetchJobByTxHash, fetchJobsByHirer } from "../utils/post";
import NewJobPostForm from "./NewJobPostForm";

interface Profs {
    sessionClient: SessionClient;
    currentAccount: Account;
}

export default function HirerJobsPage({ sessionClient, currentAccount }: Profs) {
    // const {data: walletClient} = useWalletClient();
    const [jobs, setJobs] = useState<ReadonlyArray<Post>>();
    const [showNewJobForm, setShowNewJobForm] = useState(false);
    const [refetchJobsCounter, setRefetchJobsCounter] = useState(0);

    useEffect(() => {
        fetchJobsByHirer(currentAccount.address).then((paginated) => {
            if (!paginated) return;
            const jobs = paginated.items;
            const filteredJobs = jobs.filter((job) => job.__typename === "Post");  // only posts, removed reposts
            console.log("Account's jobs", filteredJobs);
            setJobs(filteredJobs);
            // alert(posts);
        })

        setShowNewJobForm(false);
    }, [refetchJobsCounter]);

    return (
        <div>
            <button
                className="bg-green-600 text-white mb-4 px-4 py-2 rounded hover:bg-green-700"
                onClick={() => setShowNewJobForm(!showNewJobForm)}
            >
                {showNewJobForm? "Cancel" : "Create New Job"}
            </button>

            {showNewJobForm && <NewJobPostForm sessionClient={sessionClient} setRefetchJobsCounter={setRefetchJobsCounter} />}

            {jobs && jobs.length > 0 &&
                <div>
                    <p>My Jobs</p>
                    <ol className="list-decimal">
                        {jobs.map((job, idx) => (
                            <li key={idx}>
                                {job.metadata.__typename === "ArticleMetadata" && job.metadata.title}
                            </li>
                        ))}
                    </ol>
                </div>
            }
        </div>
    )
}