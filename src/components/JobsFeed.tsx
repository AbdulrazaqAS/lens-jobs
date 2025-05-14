'use client';

import { useState } from 'react';
import JobCard from './JobCard';
import sampleJobs from "../assets/jobs-sample.json";
import { ChevronDown } from 'lucide-react';
import { JobSearchCategories, JobsTab } from '../utils/constants';

export default function JobsFeed() {
  const [activeTab, setActiveTab] = useState<JobsTab>(JobsTab.Recent);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchCategory, setSearchCategory] = useState(JobSearchCategories.Content);
  const [searchQuery, setSearchQuery] = useState('');

  const jobsPerPage = 4;

  const filteredJobs = sampleJobs.filter((job) => {
    const field = job[searchCategory as keyof typeof job];
    if (Array.isArray(field)) {
      return field.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return String(field).toLowerCase().includes(searchQuery.toLowerCase());
  });

  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  const changeTab = (tab: JobsTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 px-4 text-white">
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
            className={`pb-2 capitalize ${
              activeTab === tab
                ? 'border-b-2 border-primary text-primary font-medium'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'recent' ? 'Recent Jobs' : 'Jobs For You'}
          </button>
        ))}
      </div>

      {/* Jobs Feed */}
      <div className="grid gap-6">
        {paginatedJobs.length > 0 ? (
          paginatedJobs.map((job, i) => (
            // <JobCard key={i} {...job} />
            <p>Fix me</p>
          ))
        ) : (
          <p className="text-gray-500">No jobs found for this search.</p>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg bg-surface text-gray-300 hover:bg-slate-800 disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <span className="text-sm text-gray-400">
          Page {currentPage} of {Math.ceil(filteredJobs.length / jobsPerPage)}
        </span>
        <button
          disabled={currentPage >= Math.ceil(filteredJobs.length / jobsPerPage)}
          className="px-4 py-2 rounded-lg bg-surface text-gray-300 hover:bg-slate-800 disabled:opacity-50"
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
