import { Account, AnyPost, ArticleMetadata, Post, PostExecutedActions, SessionClient } from '@lens-protocol/client';
import { useEffect, useState } from 'react';
import { JobAttributeName, JobStatus, JobStatusStyles } from '../utils/constants';
import { checkUserCanEditJob, deleteJob, fetchJobWhoEverApplied, updateJobPost } from '../utils/post';
import { useWalletClient } from 'wagmi';
import { Paginated } from '@lens-protocol/client';
import { article, ArticleOptions, MetadataAttributeType } from '@lens-protocol/metadata';
import { uplaodMetadata } from '../utils/storage-client';
import { fetchAccountByAddress } from '../utils/account';

interface JobAttribute {
    key: string;
    type: MetadataAttributeType.NUMBER | MetadataAttributeType.STRING;
    value: string;
}

interface Props {
    job: Post;
    sessionClient: SessionClient;
    setRefetchJobsCounter: Function;
    setIsOpen: Function;
}

export default function HirerJobsPageJobDetailsOverlay({
    job,
    sessionClient,
    setRefetchJobsCounter,
    setIsOpen
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

    const { data: walletClient } = useWalletClient();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const fee = attributes?.find((attr) => attr.key === JobAttributeName.fee)?.value ?? "";
    const feePerHour = attributes?.find((attr) => attr.key === JobAttributeName.feePerHour)?.value ?? "false";
    const status = attributes?.find((attr) => attr.key === JobAttributeName.status)?.value ?? JobStatus.Hiring;
    const deadline = attributes?.find((attr) => attr.key === JobAttributeName.deadline)?.value ?? "";
    const freelancer = attributes?.find((attr) => attr.key === JobAttributeName.freelancer)?.value ?? "";

    const [selected, setSelected] = useState<string | null>(null);
    const [applications, setApplications] = useState<PostExecutedActions[]>([]);
    const [freelancerAccount, setfreelancerAccount] = useState<Account>();

    function getAttributes() {
        const feeAttr: JobAttribute = {
            key: JobAttributeName.fee,
            type: MetadataAttributeType.NUMBER,
            value: fee.toString(),
        }

        const deadlineAttr: JobAttribute = {
            key: JobAttributeName.deadline,
            type: MetadataAttributeType.STRING,
            value: deadline
        }

        const feePerHourAttr: JobAttribute = {
            key: JobAttributeName.feePerHour,
            type: MetadataAttributeType.STRING,  // Making it boolean will trigger many ts rewirings
            value: feePerHour,
        }

        const statusAttr: JobAttribute = {
            key: JobAttributeName.status,
            type: MetadataAttributeType.STRING,
            value: status
        }

        const applicantAttr: JobAttribute = {
            key: JobAttributeName.freelancer,
            type: MetadataAttributeType.STRING,
            value: selected!
        }

        return [feeAttr, deadlineAttr, feePerHourAttr, statusAttr, applicantAttr];
    }

    function generateMetadata() {
        const attrs = getAttributes();

        const metadata: ArticleOptions = {
            title: title ?? "",
            content,
            tags: tags ?? [],
            attributes: attrs,
        }

        return article(metadata);
    }

    async function handleDeleteJob() {
        if (!walletClient) {
            console.error("Wallet not connected");
            return;
        }

        try {
            setIsDeleting(true);
            const txHash = await deleteJob({ sessionClient, walletClient, job });
            if (!txHash) throw new Error("Error deleting post");
            setRefetchJobsCounter((prev: number) => prev + 1);  // refetch hirer's jobs
            setIsOpen(false);  // Close job details

            async function waitForDeleteIndexing() {
                const result = await sessionClient.waitForTransaction(txHash!);
                if (result.isErr()) throw result.error;
                console.log("Job deleted successfully. TxHash:", result.value);
            }

            waitForDeleteIndexing(); // No need to await
        } catch (error) {
            console.error("Deleting job error:", error);
        } finally {
            setIsDeleting(false);
        }
    }

    async function handleUpdateJob() {
        if (!walletClient) {
            console.error("Wallet not connected");
            return;
        }

        if (!selected) {
            console.error("No applicants seslected");
            return;
        }

        try {
            setIsUpdating(true);
            checkUserCanEditJob(job);

            const metadata = generateMetadata();
            const metadataUri = await uplaodMetadata(metadata);
            console.log("MetadataUri:", metadataUri);

            const txHash = await updateJobPost({ jobId: job.id, sessionClient, walletClient, metadataUri });
            console.log("Post update txHash", txHash);

            async function updateHirerJobsOnMined() {
                const result = await sessionClient.waitForTransaction(txHash);
                if (result.isErr()) {
                    console.error("Error mining job post tx:", txHash);
                    return;
                }
                setRefetchJobsCounter((prev: number) => prev + 1);
            }

            updateHirerJobsOnMined();  // No need to await it.
        } catch (error) {
            console.error("Job post update error:", error);
        } finally {
            setIsUpdating(false)
        }
    }

    useEffect(() => {
        fetchJobWhoEverApplied(job).then((paginated: Paginated<PostExecutedActions>) => {
            const { items, pageInfo } = paginated;
            const filtered = items.filter((item) => item.total % 2 !== 0);  // all even total means apply then revoke
            setApplications(filtered);
            // TODO: Handle next pages. Put all in a scroll view.
            console.log("Applications:", filtered);
        })
    }, []);

    useEffect(() => {
        if (!freelancer) return;

        fetchAccountByAddress(freelancer).then((account) => {
            if (!account) {
                console.error("Error fetching freelancer account");
                return;
            }

            setfreelancerAccount(account);
        }).catch(console.error);
    }, [freelancer]);

    return (
        <div id="overlay-content" className="bg-surface text-white p-6 rounded-2xl shadow-xl w-full max-w-4xl mx-auto space-y-6">
            {/* Title and Status */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${JobStatusStyles[status as JobStatus]}`}>
                        {status.toUpperCase()}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        disabled={isUpdating}
                        onClick={handleUpdateJob}
                        className="bg-primary hover:opacity-90 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg"
                    >
                        {isUpdating ? "Updating..." : "Update"}
                    </button>
                    <button
                        onClick={handleDeleteJob}
                        disabled={isDeleting}
                        className="bg-danger hover:opacity-90 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
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

            {/* Applicants/freelancer: selected freelancer or list of all applicants */}
            {freelancer ?
                (
                    freelancerAccount ?
                        <div className={'flex justify-between items-center p-3 rounded-lg bg-background border border-white/10'}>
                            <span>{freelancerAccount.metadata?.name ?? "Lens Jobs Freelancer"}</span>
                            <button
                                onClick={() => {
                                    setSelected(freelancerAccount.address);
                                }}
                                className="bg-secondary text-black text-sm px-4 py-1 rounded hover:opacity-90"
                            >
                                Select
                            </button>
                        </div>
                        :
                        // Show a skeleton instead
                        <p className="text-gray-400">Fetching selected freelancer...</p>
                )

                :
                <div>
                    <h2 className="text-lg font-semibold mb-2">Applicants ({applications.length})</h2>
                    {selected && <p className="text-gray-400">Click update to save selected applicant.</p>}

                    {applications.length === 0 ? (
                        <p className="text-gray-400">No applications yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {applications.map((application) => (
                                <li
                                    key={application.account.address}
                                    className={`flex justify-between items-center p-3 rounded-lg bg-background border ${selected === application.account.address ? 'border-secondary' : 'border-white/10'
                                        }`}
                                >
                                    <span>{application.account.metadata?.name ?? "Lens Jobs Freelancer"}</span>
                                    <button
                                        onClick={() => {
                                            setSelected(application.account.address);
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
            }
        </div>
    );
}
