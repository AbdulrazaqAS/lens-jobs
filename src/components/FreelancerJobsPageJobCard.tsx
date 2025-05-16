import { Bookmark } from 'lucide-react';
import { JobAttributeName } from '../utils/constants';
import { ArticleMetadata, Post } from '@lens-protocol/client';

import React from 'react';

interface Props {
  job: Post;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

export default function FreelancerJobsPageJobCard({job, onClick}: Props) {
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

  const {username} = author;

  const fee = attributes?.find((attr) => attr.key === JobAttributeName.fee)?.value ?? 0;
  const feePerHour = attributes?.find((attr) => attr.key === JobAttributeName.feePerHour)?.value ?? "false";

  return (
    <div onClick={onClick} className="bg-surface text-white rounded-2xl p-6 shadow-md border border-slate-800 relative transition hover:scale-[1.01] duration-200">
      <div className="absolute top-4 right-4 text-accent cursor-pointer hover:text-yellow-400">
        <Bookmark size={20} strokeWidth={2} />
      </div>

      <h2 className="text-xl font-semibold text-primary mb-2">{title}</h2>

      <p className="text-sm text-gray-300 mb-4 line-clamp-4 whitespace-pre-wrap">
        {content}
      </p>

      <div className="flex items-center justify-between text-sm mb-3">
        <span className="text-secondary font-medium">💰 {fee}</span>
        <span className="text-gray-400">Posted by @{username?.localName ?? "User"}</span>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {tags!.map((tag) => (
          <span
            key={tag}
            className="text-xs px-3 py-1 bg-background text-gray-200 rounded-full border border-slate-700"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
