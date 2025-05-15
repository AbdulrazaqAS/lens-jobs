import React, { useState } from 'react';

type JobStatus = 'hiring' | 'finished' | 'sealed' | 'deleted';

interface Job {
  id: string;
  title: string;
  reward: number;
  status: JobStatus;
  createdAt: string;
}

const TABS = ['All Jobs', 'Completed Jobs', 'Money Spent'] as const;
type Tab = typeof TABS[number];

const statusStyles: Record<JobStatus, string> = {
  hiring: 'bg-secondary text-black',
  finished: 'bg-accent text-black',
  sealed: 'bg-primary text-white',
  deleted: 'bg-danger text-white',
};

// Dummy data (replace with real backend data)
const dummyJobs: Job[] = Array.from({ length: 32 }, (_, i) => ({
  id: `job-${i + 1}`,
  title: `Job Title #${i + 1}`,
  reward: 100 + i * 10,
  status: i % 4 === 0 ? 'finished' : i % 4 === 1 ? 'hiring' : i % 4 === 2 ? 'sealed' : 'deleted',
  createdAt: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
}));

const PAGE_SIZE = 10;

export default function CreatorJobsPage() {
  const [currentTab, setCurrentTab] = useState<Tab>('All Jobs');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredJobs = dummyJobs.filter(job => {
    if (currentTab === 'Completed Jobs') return job.status === 'finished';
    return true;
  });

  const paginatedJobs = filteredJobs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalSpent = dummyJobs
    .filter(j => j.status === 'finished')
    .reduce((sum, job) => sum + job.reward, 0);

  return (
    <div className="p-4 text-white max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Jobs</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              currentTab === tab
                ? 'bg-primary text-white'
                : 'bg-surface text-gray-300 hover:bg-primary/20'
            }`}
            onClick={() => {
              setCurrentTab(tab);
              setCurrentPage(1);
            }}
          >
            {tab}
            {tab === 'Money Spent' && (
              <span className="ml-2 text-accent font-semibold">${totalSpent}</span>
            )}
          </button>
        ))}
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {paginatedJobs.map((job) => (
          <div
            key={job.id}
            className="bg-surface rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow"
          >
            <div>
              <h2 className="text-lg font-semibold">{job.title}</h2>
              <p className="text-sm text-gray-400">Created: {job.createdAt}</p>
            </div>
            <div className="flex flex-col sm:items-end text-sm gap-2">
              <span className="text-accent font-medium">${job.reward}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[job.status]}`}>
                {job.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: Math.ceil(filteredJobs.length / PAGE_SIZE) }).map((_, i) => (
          <button
            key={i}
            className={`w-8 h-8 rounded-full text-sm font-medium ${
              currentPage === i + 1
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
