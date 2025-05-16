import { ArticleMetadata, Post } from "@lens-protocol/client";
import { JobAttributeName, JobStatus, JobStatusStyles } from "../utils/constants";

export default function HirerJobsPageJobCard({job, onClick}: {job: Post, onClick: (e:any)=>any}) {
    const {
        metadata,
      } = job;
    
      const {
          title,
          attributes,
        } = metadata as ArticleMetadata;
    
      const fee = attributes?.find((attr) => attr.key === JobAttributeName.fee)?.value ?? 0;
      const feePerHour = attributes?.find((attr) => attr.key === JobAttributeName.feePerHour)?.value ?? "true";
      const status = attributes?.find((attr) => attr.key === JobAttributeName.status)?.value ?? JobStatus.Sealed;
    
    return (
        <div
            key={job.id}
            onClick={onClick}
            className="bg-surface rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow transition hover:scale-[1.01] duration-200"
        >
            <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-sm text-gray-400">Created: {job.timestamp}</p>
            </div>
            <div className="flex flex-col sm:items-end text-sm gap-2">
                <span className="text-accent font-medium">${fee}{feePerHour === "true" && "/hour"}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${JobStatusStyles[status as JobStatus]}`}>
                    {status}
                </span>
            </div>
        </div>
    )
}