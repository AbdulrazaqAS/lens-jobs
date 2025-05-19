import { Account, Post, SessionClient } from '@lens-protocol/client';
import { useEffect, useState } from 'react';
import { fetchJobsByHirer } from '../utils/post';
import { JobAttributeName, JobsPerPage, JobStatus } from '../utils/constants';
import HirerJobsPageJobDetails from './HirerJobsPageJobDetails';
import JobSkeleton from './JobSkeleton';
import NewJobPostForm from './NewJobPostForm';

enum Tabs {
  AllJobs = 'All Jobs',
  Completed = 'Completed Jobs',
  Sealed = 'Sealed Jobs',
  Hiring = 'Hiring Jobs',
  TotalSpent = 'Total Spent',
  CreateJob = 'Create Job'
}

interface Profs {
  sessionClient: SessionClient;
  currentAccount: Account;
}

export default function HirerJobsPage({ sessionClient, currentAccount }: Profs) {
  const [currentTab, setCurrentTab] = useState<Tabs>(Tabs.AllJobs);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobs, setJobs] = useState<ReadonlyArray<Post>>([]);
  const [finishedJobs, setFinishedJobs] = useState<ReadonlyArray<Post>>([]);
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [refetchJobsCounter, setRefetchJobsCounter] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const PAGE_SIZE = 10;

  const filterJobsByStatus = (status: JobStatus) => {
    const filteredJobs = jobs.filter((job) => {
      if (job.metadata.__typename !== "ArticleMetadata") return false;
      const jobStatus = job.metadata.attributes?.find((attr) => attr.key === JobAttributeName.status)?.value ?? "Error";
      return jobStatus === status;
    });

    return filteredJobs;
  };

  const getTotalSpent = () => {
    const totalSpent = finishedJobs.reduce((sum, job) => {
      if (job.metadata.__typename !== "ArticleMetadata") return 0;
      const fee = job.metadata.attributes?.find((attr) => attr.key === JobAttributeName.fee)?.value ?? 0;
      return sum + Number(fee);
    }, 0);

    return totalSpent;
  }

  useEffect(() => {
    // TODO: Show job skeleton while loading
    fetchJobsByHirer({ addr: currentAccount.address, sessionClient }).then((paginated) => {
      if (!paginated) return;
      const jobs = paginated.items;
      const filteredJobs = jobs.filter((job) => job.__typename === "Post");  // only posts, removed reposts
      console.log("Account's jobs", filteredJobs);
      setJobs(filteredJobs);

      if (isLoading) setIsLoading(false);
    })
  }, [refetchJobsCounter]);

  return (
    <div className="p-4 text-white max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Jobs</h1>
    
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {Object.values(Tabs).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${currentTab === tab
              ? 'bg-primary text-white'
              : 'bg-surface text-gray-300 hover:bg-primary/20'
              }`}
            onClick={() => {
              setCurrentTab(tab);
              setCurrentPage(1);
            }}
          >
            {tab}
            {tab === Tabs.TotalSpent && (
              <span className="ml-2 text-accent font-semibold">${totalSpent}</span>
            )}
          </button>
        ))}
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {currentTab === Tabs.CreateJob ?
          <NewJobPostForm sessionClient={sessionClient} setRefetchJobsCounter={setRefetchJobsCounter} /> :
          isLoading ? (
            Array.from({ length: JobsPerPage }).map((_, i) => <JobSkeleton key={i} />)
          ) : jobs.length > 0 ? (
            jobs.map((job, i) => <HirerJobsPageJobDetails key={i} job={job} sessionClient={sessionClient} setRefetchJobsCounter={setRefetchJobsCounter}/>)
          ) : (
            <p className="text-gray-500">No jobs found.</p>
          )
        }
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: Math.ceil(jobs.length / PAGE_SIZE) }).map((_, i) => (
          <button
            key={i}
            className={`w-8 h-8 rounded-full text-sm font-medium ${currentPage === i + 1
              ? 'bg-primary text-white'
              : 'bg-surface text-gray-300 hover:bg-primary/20'
              }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
