import { ArticleMetadata, Post } from '@lens-protocol/client';
import { useState } from 'react';
import { AccountAttributeName, JobAttributeName, JobStatus } from '../utils/constants';

const durations = [
    'Less than 1 day',
    'Less than 3 days',
    'Less than 1 week',
    'Less than 1 month',
    'Greater than 1 month',
];

interface Props {
    job: Post;
    onDelete?: () => void;
    onUpdate?: () => void;
    onApply?: () => void;
}

export default function FreelancerJobsPageJobDetailsOverlay({ job }: Props) {
    const {
        metadata,
        author
    } = job;

    const {
        title: jobTitle,
        attributes: jobAttributes,
        tags: jobTags,
        content: jobContent,
    } = metadata as ArticleMetadata;

    const hirerTotalSpent = author.metadata?.attributes.find((attr) => attr.key === AccountAttributeName.totalSpent)?.value ?? 0;

    const hirerFee = jobAttributes?.find((attr) => attr.key === JobAttributeName.fee)?.value ?? 0;
    const feePerHour = jobAttributes?.find((attr) => attr.key === JobAttributeName.feePerHour)?.value ?? "false";
    const jobStatus = jobAttributes?.find((attr) => attr.key === JobAttributeName.status)?.value ?? JobStatus.Sealed;
    const jobDeadline = jobAttributes?.find((attr) => attr.key === JobAttributeName.deadline)?.value ?? "Error";

    const hasApplied = false;

    const [showApplyForm, setShowApplyForm] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [duration, setDuration] = useState('');
    const [freelancerPrice, setFreelancerPrice] = useState('');

    return (
        <div id="overlay-content" className="max-w-4xl mx-auto p-6 bg-surface text-white rounded-xl shadow-lg space-y-6">
            {/* Job Title and Status */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <h2 className="text-2xl font-bold">{jobTitle}</h2>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${jobStatus === 'applied' ? 'bg-secondary text-black' : 'bg-accent text-black'
                    }`}>
                    {jobStatus === 'applied' ? 'Already Applied' : 'Not Applied'}
                </span>
            </div>

            {/* Creator Details */}
            <div className="flex items-center gap-4">
                <img
                    src={author.metadata?.picture ?? ""}
                    alt="Creator"
                    className="w-14 h-14 rounded-full object-cover border border-secondary"
                />
                <div>
                    <p className="font-semibold">{author.metadata?.name ?? "Error"} (@{author.username?.localName ?? "Error"})</p>
                    <p className="text-sm text-gray-400">Total Spent: ${hirerTotalSpent}</p>
                </div>
            </div>

            {/* Job Description */}
            <p className="whitespace-pre-line leading-relaxed">{jobContent}</p>

            {/* Job Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-400">Fee</p>
                    <p className="text-lg font-semibold">
                        ${hirerFee} {feePerHour === "true" ? '/hr' : 'total'}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Deadline</p>
                    <p className="text-lg font-semibold">{jobDeadline}</p>
                </div>
                <div className="col-span-full">
                    <p className="text-sm text-gray-400">Tags</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {jobTags && jobTags.map((tag) => (
                            <span key={tag} className="bg-background px-3 py-1 rounded-full text-sm border border-primary">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Apply Button */}
            {!showApplyForm && !hasApplied && (
                <button
                    onClick={() => setShowApplyForm(true)}
                    className="mt-4 bg-primary hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg"
                >
                    Apply for Job
                </button>
            )}

            {/* Apply Form */}
            {showApplyForm && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        console.log({ coverLetter, duration, freelancerPrice });
                        // Send application logic...
                    }}
                    className="space-y-4 mt-6 bg-background p-4 rounded-lg border border-primary"
                >
                    <div>
                        <label className="block mb-1 text-sm">Cover Letter</label>
                        <textarea
                            rows={4}
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            className="w-full p-2 bg-surface border border-gray-600 rounded-lg focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm">Estimated Duration</label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full p-2 bg-surface border border-gray-600 rounded-lg focus:outline-none"
                            required
                        >
                            <option value="" disabled>Select duration</option>
                            {durations.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 text-sm">{feePerHour === "true" ? 'Hourly Rate' : 'Total Fee'}</label>
                        <input
                            type="number"
                            value={freelancerPrice}
                            onChange={(e) => setFreelancerPrice(e.target.value)}
                            placeholder="Enter your price"
                            className="w-full p-2 bg-surface border border-gray-600 rounded-lg focus:outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-secondary hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg"
                    >
                        Submit
                    </button>
                </form>
            )}
        </div>
    );
}
