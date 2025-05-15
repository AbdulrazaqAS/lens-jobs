import { useEffect, useState } from "react"
import { Account, PageSize, PaginatedResultInfo, Post, SessionClient } from "@lens-protocol/client"
import { fetchAccountRecommendedJobs, fetchJobsByFeed, fetchJobsByQuery, fetchJobsToExplore } from "../utils/post";
import { client } from "../utils/client";
import JobCard from "./JobCard";
import { JobsTab, JobSearchCategories } from "../utils/constants";
import JobSkeleton from "./JobSkeleton";

interface Profs {
    sessionClient?: SessionClient;
    currentAccount?: Account;
    scrollToTop: Function;
}

export default function FreelancerJobsPage({ sessionClient, currentAccount, scrollToTop }: Profs) {
    // const [feedJobs, setFeedJobs] = useState<ReadonlyArray<Post>>();
    const [feedJobs, setFeedJobs] = useState<Post[]>([]);
    const [trendingJobs, setTrendingJobs] = useState<ReadonlyArray<Post>>([]);
    const [forYouJobs, setForYouJobs] = useState<ReadonlyArray<Post>>([]);
    const [searchedJobs, setSearchedJobs] = useState<ReadonlyArray<Post>>([]);

    const [activeTab, setActiveTab] = useState<JobsTab>(JobsTab.Recent);
    const [currentPage, setCurrentPage] = useState(0);
    const [currentPageJobs, setCurrentPageJobs] = useState<ReadonlyArray<Post>>([]);
    const [lastPageInfo, setLastPageInfo] = useState<PaginatedResultInfo>();
    const [searchCategory, setSearchCategory] = useState(JobSearchCategories.Content);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const pageSize = PageSize.Ten;
    const jobsPerPage = pageSize === PageSize.Ten ? 10 : 50;

    const changeTab = (tab: JobsTab) => {
        setActiveTab(tab);
        // setCurrentPage(0);
    };

    const getPageJobsFromJobs = (page: number, jobs: Post[]) => {
        const pageJobs = jobs.slice(
            page * jobsPerPage,
            (page + 1) * jobsPerPage
        );

        return pageJobs
    }

    const gotoNextPage = () => {
        const lastPageHasNext = lastPageInfo?.next;
        const pageAlreadyLoaded = pageJobsLoaded(currentPage + 1);

        if (pageAlreadyLoaded || lastPageHasNext) {  // order is important here
            scrollToTop();
            setCurrentPage(currentPage + 1);
        }
        else console.error("Page has no next page");
    }

    const gotoPrevPage = () => {
        if (currentPage > 0) {
            scrollToTop();
            setCurrentPage(currentPage - 1);
        }
        else console.error("Page has no prev page");
    }

    const pageJobsLoaded = (page: number) => {
        if (feedJobs.length > jobsPerPage * (currentPage + 1)) return true;
        else return false;
    }

    useEffect(() => {
        async function fetchJobs() {
            let pageJobs: Post[];
            
            console.log("Page", currentPage);
            if (pageJobsLoaded(currentPage)) {
                console.log("Current page already loaded", currentPage);
                pageJobs = getPageJobsFromJobs(currentPage, feedJobs);
            } else {
                try {
                    console.log("Current page not already loaded", currentPage);
                    const cursor = lastPageInfo?.next;
                    const result = await fetchJobsByFeed({ cursor });
                    if (!result) { // TODO: Test this error
                        throw new Error(`Error fetching ${currentPage} jobs.`);
                    }

                    const { items, pageInfo } = result;
                    pageJobs = items as Post[];  // No repost in the app. We're sure of only posts
                    setLastPageInfo(pageInfo);
                    setFeedJobs(prev => [...prev, ...pageJobs]);
                } catch (error) {
                    console.error(`Error fetching page jobs (Trying prev page ${currentPage - 1}):`, error);
                    gotoPrevPage();
                    return;
                }
            }

            setCurrentPageJobs(pageJobs);
            if (loading) setLoading(false);
            console.log("Page jobs:", pageJobs?.length, "first id", pageJobs && pageJobs[0].id.slice(-5));
        }

        fetchJobs();

        // fetchJobsToExplore(sessionClient ?? client).then((paginated) => {
        //     if (!paginated) return;
        //     const jobs = paginated.items;
        //     console.log("Trending jobs", jobs);
        //     setTrendingJobs(jobs);
        // })

        // if (currentAccount) {
        //     fetchAccountRecommendedJobs(currentAccount.address).then((paginated) => {
        //         if (!paginated) return;
        //         const jobs = paginated.items;
        //         console.log("Trending jobs", jobs);
        //         setForYouJobs(jobs);
        //         // alert(posts);
        //     })
        // }

        // fetchJobsByQuery("smart solidity").then((paginated) => {
        //     if (!paginated) return;
        //     const jobs = paginated.items as Post[];  // No repost in the app. We're sure of only posts
        //     // const filteredJobs = jobs.filter((job) => job.__typename === "Post");  // removed reposts
        //     console.log("Searched jobs", jobs);
        //     setSearchedJobs(jobs);
        // })

    }, [currentPage]);

    return (
        <div className="w-full max-w-4xl mx-auto px-4 text-white">
            {/* Search Input + Dropdown */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
                <div className="relative w-full">
                    <input
                        type="text"
                        className="w-full bg-surface border border-slate-700 rounded-xl px-4 py-2 pr-32 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={`Search by ${searchCategory}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute right-2 top-1.5">
                        <select
                            className="bg-background border border-slate-700 text-sm text-white px-2 py-1 rounded-md"
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value as JobSearchCategories)}
                        >
                            {Object.values(JobSearchCategories).map((category) => (
                                <option key={category} value={category}>
                                    {category[0].toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-4 border-b border-slate-700">
                {Object.values(JobsTab).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => changeTab(tab)}
                        className={`pb-2 capitalize ${activeTab === tab
                            ? 'border-b-2 border-primary text-primary font-medium'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        {tab === JobsTab.Recent ? 'Recent Jobs' : 'Jobs For You'}
                    </button>
                ))}
            </div>

            {/* Jobs Feed */}
            <div className="grid gap-6">
                {loading ? (
                    Array.from({ length: jobsPerPage }).map((_, i) => <JobSkeleton key={i} />)
                ) : currentPageJobs.length > 0 ? (
                    currentPageJobs.map((job, i) => <JobCard key={i} job={job} />)
                ) : (
                    <p className="text-gray-500">No jobs found for this search.</p>
                )}
            </div>


            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
                <button
                    disabled={currentPage === 0}
                    className="px-4 py-2 rounded-lg bg-surface text-gray-300 hover:bg-slate-800 disabled:opacity-50"
                    onClick={gotoPrevPage}
                >
                    Prev
                </button>
                <span className="text-sm text-gray-400">
                    Page {currentPage + 1}
                </span>
                <button
                    disabled={!pageJobsLoaded(currentPage + 1) || !lastPageInfo || !Boolean(lastPageInfo?.next)}
                    className="px-4 py-2 rounded-lg bg-surface text-gray-300 hover:bg-slate-800 disabled:opacity-50"
                    onClick={gotoNextPage}
                >
                    Next
                </button>
            </div>
        </div>
    );
}