import { useEffect, useState } from "react"
import { Account, Post, SessionClient } from "@lens-protocol/client"
import { fetchAccountRecommendedJobs, fetchJobsByFeed, fetchJobsByQuery, fetchJobsToExplore } from "../utils/post";
import { client } from "../utils/client";
import JobCard from "./JobCard";

interface Profs {
    sessionClient?: SessionClient;
    currentAccount?: Account;
}

export default function FreelancerJobsPage({ sessionClient, currentAccount }: Profs) {
    const [feedJobs, setFeedJobs] = useState<ReadonlyArray<Post>>();
    const [trendingJobs, setTrendingJobs] = useState<ReadonlyArray<Post>>();
    const [forYouJobs, setForYouJobs] = useState<ReadonlyArray<Post>>();
    const [searchedJobs, setSearchedJobs] = useState<ReadonlyArray<Post>>();

    useEffect(() => {
        fetchJobsByFeed().then((paginated) => {
            if (!paginated) return;
            const jobs = paginated.items as Post[];  // No repost in the app. We're sure of only posts
            console.log("Feed jobs", jobs);
            setFeedJobs(jobs);
        })

        fetchJobsToExplore(sessionClient ?? client).then((paginated) => {
            if (!paginated) return;
            const jobs = paginated.items;
            console.log("Trending jobs", jobs);
            setTrendingJobs(jobs);
        })

        // if (currentAccount) {
        //     fetchAccountRecommendedJobs(currentAccount.address).then((paginated) => {
        //         if (!paginated) return;
        //         const jobs = paginated.items;
        //         console.log("Trending jobs", jobs);
        //         setForYouJobs(jobs);
        //         // alert(posts);
        //     })
        // }

        fetchJobsByQuery("smart solidity").then((paginated) => {
            if (!paginated) return;
            const jobs = paginated.items as Post[];  // No repost in the app. We're sure of only posts
            // const filteredJobs = jobs.filter((job) => job.__typename === "Post");  // removed reposts
            console.log("Searched jobs", jobs);
            setSearchedJobs(jobs);
        })

    }, []);

    return (
        <div className="space-y-5">
            {feedJobs && feedJobs.length > 0 &&
                <div className="space-y-4">
                    <p>Feed Jobs</p>
                    {feedJobs.map((job, idx) => (
                        <JobCard key={idx} job={job} />
                    ))}
                </div>

            }
            {trendingJobs && trendingJobs.length > 0 &&
                <div className="space-y-4">
                    <p>Trending Jobs</p>
                    {trendingJobs.map((job, idx) => (
                        <JobCard key={idx} job={job} />
                    ))}
                </div>
            }
            {searchedJobs && searchedJobs.length > 0 &&
                <div className="space-y-4">
                    <p>Searched Jobs</p>
                    {searchedJobs.map((job, idx) => (
                        <JobCard key={idx} job={job} />
                    ))}
                </div>
            }
        </div>
    )
}