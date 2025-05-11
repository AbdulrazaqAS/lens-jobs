import { useEffect, useState } from "react"
import { Paginated, Post, SessionClient } from "@lens-protocol/client"
import { fetchJobsToExplore } from "../utils/post";

interface Profs {
    sessionClient?: SessionClient;
}

export function FeedsPage({ sessionClient }: Profs) {
    const [trendingJobs, setTrendingJobs] = useState<ReadonlyArray<Post>>();
    const [forYouJobs, setForYouJobs] = useState<ReadonlyArray<Post>>();

    useEffect(() => {
        fetchJobsToExplore().then((paginated) => {
            if (!paginated) return;
            const posts = paginated.items;
            setTrendingJobs(posts);
            alert(posts);
        })
    }, []);

    return (
        <div>
            {trendingJobs &&
                <div>
                    <p>Trending Posts</p>
                </div>
            }
        </div>
    )
}