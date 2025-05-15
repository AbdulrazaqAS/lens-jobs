import { ArticleMetadata, Post } from '@lens-protocol/client';
import { useState } from 'react';
import { JobAttributeName } from '../utils/constants';

type JobStatus = 'hiring' | 'finished' | 'sealed' | 'deleted';

interface Props {
    job: Post;
    onSelectApplicant: (applicant: string) => void;
    onDelete: () => void;
    onUpdate: () => void;
}

const statusStyles: Record<JobStatus, string> = {
    hiring: 'bg-secondary text-black',
    finished: 'bg-accent text-black',
    sealed: 'bg-primary text-white',
    deleted: 'bg-danger text-white',
};

export default function HirerJobDetails({
    job,
    onSelectApplicant,
    onDelete,
    onUpdate,
}: Props) {
    const {
        metadata,
        author
    } = job;

    const {
        title,
        attributes,
        tags,
        content,
    } = metadata as ArticleMetadata;

    const { username } = author;

    const fee = attributes?.find((attr) => attr.key === JobAttributeName.fee)?.value ?? 0;
    const feePerHour = attributes?.find((attr) => attr.key === JobAttributeName.feePerHour)?.value ?? "false";
    const status = attributes?.find((attr) => attr.key === JobAttributeName.status)?.value ?? "Error";
    const deadline = attributes?.find((attr) => attr.key === JobAttributeName.deadline)?.value ?? "Error";
    const applicantsString = attributes?.find((attr) => attr.key === JobAttributeName.deadline)?.value ?? "";
    const applicants = applicantsString.split(",");

    const [selected, setSelected] = useState<string | null>(null);

    return (
        <div className="bg-surface text-white p-6 rounded-2xl shadow-xl w-full max-w-4xl mx-auto space-y-6">
            {/* Title and Status */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${statusStyles[status as JobStatus]}`}>
                        {status.toUpperCase()}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onUpdate}
                        className="bg-primary hover:opacity-90 text-white px-4 py-2 rounded-lg"
                    >
                        Update
                    </button>
                    <button
                        onClick={onDelete}
                        className="bg-danger hover:opacity-90 text-white px-4 py-2 rounded-lg"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 whitespace-pre-line">{content}</p>

            {/* Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="font-semibold">Reward:</span>{' '}
                    {feePerHour === "true" ? `${fee} / hr` : `${fee} total`}
                </div>
                <div>
                    <span className="font-semibold">Deadline:</span> {deadline}
                </div>
                <div className="sm:col-span-2">
                    <span className="font-semibold">Tags:</span>{' '}
                    {tags && tags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-block bg-background text-white border border-white/10 rounded-full px-3 py-1 text-xs mr-2 mt-2"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Applicants */}
            <div>
                <h2 className="text-lg font-semibold mb-2">Applicants</h2>
                {applicants.length === 0 ? (
                    <p className="text-gray-400">No applicants yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {applicants.map((applicant) => (
                            <li
                                key={applicant}
                                className={`flex justify-between items-center p-3 rounded-lg bg-background border ${selected === applicant ? 'border-secondary' : 'border-white/10'
                                    }`}
                            >
                                <span>{applicant}</span>
                                <button
                                    onClick={() => {
                                        setSelected(applicant);
                                        onSelectApplicant(applicant);
                                    }}
                                    className="bg-secondary text-black text-sm px-4 py-1 rounded hover:opacity-90"
                                >
                                    Select
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
