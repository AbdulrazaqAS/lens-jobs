import { Account, ArticleMetadata, Post, SessionClient } from '@lens-protocol/client';
import { FormEvent, useEffect, useState } from 'react';
import { AccountAttributeName, JobAttributeName, JobStatus } from '../utils/constants';
import { useReadContract, useWalletClient } from 'wagmi';
import { applyForJob } from '../utils/post';
import { uplaodMetadata } from '../utils/storage-client';
import JobPostApplyActionABI from '../assets/jobPostApplyActionABI.json';

const JOB_POST_APPLY_ACTION_ADDRESS = import.meta.env.VITE_JOB_APPLY_ACTION_ADDRESS;
const FEED_ADDRESS = import.meta.env.VITE_APP_FEED_ADDRESS;

const durations = [
    'Less than 1 day',
    'Less than 3 days',
    'Less than 1 week',
    'Less than 1 month',
    'Greater than 1 month',
];

interface Props {
    job: Post;
    sessionClient?: SessionClient;
    currentAccount?: Account;
}

// TODO: Add mins and maxs for inputs.
export default function FreelancerJobsPageJobDetailsOverlay({ job, currentAccount, sessionClient }: Props) {
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

    const {data: walletClient} = useWalletClient();
    const {
        data: hasAppliedData,
        isLoading: isLoadingHasApplied,
        error: hasAppliedError
    } = useReadContract({
        abi:JobPostApplyActionABI,
        address: JOB_POST_APPLY_ACTION_ADDRESS,
        functionName: "hasApplied",
        args: [FEED_ADDRESS, job.id, sessionClient ? currentAccount!.address : ""],  // If no sessionClient, address = "", which will error.
    });
    
    const hirerTotalSpent = author.metadata?.attributes.find((attr) => attr.key === AccountAttributeName.totalSpent)?.value ?? 0;

    const hirerFee = jobAttributes?.find((attr) => attr.key === JobAttributeName.fee)?.value ?? 0;
    const feePerHour = jobAttributes?.find((attr) => attr.key === JobAttributeName.feePerHour)?.value ?? "false";
    const jobStatus = jobAttributes?.find((attr) => attr.key === JobAttributeName.status)?.value ?? JobStatus.Sealed;
    const jobDeadline = jobAttributes?.find((attr) => attr.key === JobAttributeName.deadline)?.value ?? "Error";

    
    const [hasApplied, setHasApplied] = useState(false);
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [duration, setDuration] = useState('');
    const [freelancerPrice, setFreelancerPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        console.log({hasAppliedData, isLoadingHasApplied, hasAppliedError});
        if (!isLoadingHasApplied && !hasAppliedError) setHasApplied(hasAppliedData as boolean);
    }, [hasAppliedData])

    async function handleApply(e: FormEvent){
        e.preventDefault();

        if (!sessionClient) {
            console.error("No session client detected");
            return;
        }

        if (!walletClient) {
            console.error("Wallet not connected");
            return;
        }

        try {
            setIsSubmitting(true);
            // Get application form metadata
            const appFormMetadata = {coverLetter, price: freelancerPrice, duration};
            const appFormMetadataUri = (await uplaodMetadata(appFormMetadata)).slice(7);
            console.log("Length", appFormMetadataUri.length, appFormMetadataUri);
            
            const txHash = await applyForJob({job,revokeApplication: false, appFormUri: appFormMetadataUri, sessionClient, walletClient});
            if (!txHash) throw new Error("Error applying for job");
            
            async function waitForApplyIndexing(){
                const result = await sessionClient!.waitForTransaction(txHash!);
                if (result.isErr()) throw result.error;
                console.log("Job aplication successful. TxHash:", result.value);
                setHasApplied(true); // Immediately update it, it will refetch the original value on rerender
            }

            waitForApplyIndexing(); // No need to await

            setCoverLetter("");
            setDuration("");
            setFreelancerPrice("");
            setShowApplyForm(false);

        } catch (error) {
            console.error("Error applying for job:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleRevokeApplication(e: FormEvent){
        e.preventDefault();

        if (!sessionClient) {
            console.error("No session client detected");
            return;
        }

        if (!walletClient) {
            console.error("Wallet not connected");
            return;
        }

        try {
            setIsSubmitting(true);
            
            const txHash = await applyForJob({job,revokeApplication: true, sessionClient, walletClient});
            if (!txHash) throw new Error("Error revoking job application");
            
            async function waitForRevokeApplyIndexing(){
                const result = await sessionClient!.waitForTransaction(txHash!);
                if (result.isErr()) throw result.error;
                console.log("Job application revoked successfully. TxHash:", result.value);
                setHasApplied(false);  // Immediately update it, it will refetch the original value on rerender
            }

            waitForRevokeApplyIndexing(); // No need to await
        } catch (error) {
            console.error("Error applying for job:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-surface text-white rounded-xl shadow-lg space-y-6">
            {/* Job Title and Status */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <h2 className="text-2xl font-bold">{jobTitle}</h2>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${hasApplied ? 'bg-secondary text-black' : 'bg-accent text-black'
                    }`}>
                    {hasApplied ? 'Already Applied' : 'Not Applied'}
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
            {!showApplyForm && sessionClient && (
                !hasApplied ? 
                    <button
                        onClick={() => setShowApplyForm(true)}
                        className="mt-4 bg-primary hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg"
                    >
                        Apply for Job
                    </button> :
                    <button
                        onClick={handleRevokeApplication}
                        disabled={isSubmitting}
                        className="mt-4 bg-danger hover:bg-red-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg"
                    >
                        {isSubmitting ? "Deleting..." : "Delete Application"}
                    </button>
            )}

            {/* Apply Form */}
            {/* TODO: Add back/cancel btn on small screen*/}
            {showApplyForm && (
                <form
                    onSubmit={handleApply}
                    className="space-y-4 mt-6 bg-background p-4 rounded-lg border border-primary"
                >
                    <div>
                        <label className="block mb-1 text-sm">Cover Letter</label>
                        <textarea
                            rows={8}
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
                        disabled={isSubmitting}
                        className="w-full bg-secondary hover:bg-green-400 disabled:cursor-not-allowed text-black font-semibold px-4 py-2 rounded-lg"
                    >
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                </form>
            )}
        </div>
    );
}
