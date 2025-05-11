import { useEffect, useState } from "react"
import { Post, SessionClient } from "@lens-protocol/client"
import { fetchJobsByQuery, fetchJobsToExplore } from "../utils/post";
import { client } from "../utils/client";

interface Profs {
    sessionClient?: SessionClient;
}

export function FeedsPage({ sessionClient }: Profs) {
    const [trendingJobs, setTrendingJobs] = useState<ReadonlyArray<Post>>();
    const [forYouJobs, setForYouJobs] = useState<ReadonlyArray<Post>>();
    const [searchedJobs, setSearchedJobs] = useState<ReadonlyArray<Post>>();

    useEffect(() => {
        fetchJobsToExplore(sessionClient ?? client).then((paginated) => {
            if (!paginated) return;
            const jobs = paginated.items;
            console.log("Trending jobs", jobs);
            setTrendingJobs(jobs);
            // alert(posts);
        })

        fetchJobsByQuery("Hello").then((paginated) => {
            if (!paginated) return;
            const jobs = paginated.items as Post[];  // No repost in the app. We're sure of only posts
            // const filteredJobs = jobs.filter((job) => job.__typename === "Post");  // removed reposts
            console.log("Searched jobs", jobs);
            setSearchedJobs(jobs);
            // alert(posts);
        })

    }, []);

    return (
        <div>
            {trendingJobs && trendingJobs.length > 0 &&
                <div>
                    <p>Trending Jobs</p>
                    <ul className="list-disc">
                        {trendingJobs.map((job, idx) => (
                            <li>
                                {job.id.slice(0, 10)}...
                            </li>
                        ))}
                    </ul>
                </div>
            }
            {searchedJobs && searchedJobs.length > 0 &&
                <div>
                    <p>Searched Jobs</p>
                    <ul className="list-disc">
                        {searchedJobs.map((job, idx) => (
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