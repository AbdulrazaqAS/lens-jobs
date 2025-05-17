import { useEffect, useState, MouseEvent } from "react";
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { JobAttributeName } from '../utils/constants';
import { ArticleMetadata, Post, SessionClient } from '@lens-protocol/client';
import { bookmarkPostById, removeBookmarkedPostById } from "../utils/post";

import React from 'react';

interface Props {
  job: Post;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  sessionClient?: SessionClient
}

export default function FreelancerJobsPageJobCard({ sessionClient, job, onClick }: Props) {
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

  const [isBookmarked, setIsBookmarked] = useState(false);

  async function handleBookmarking(e: MouseEvent<SVGSVGElement>) {
    e.stopPropagation(); // Don't let the click reach the card

    if (!sessionClient) return;

    try {
      if (isBookmarked) await removeBookmarkedPostById({ sessionClient, id: job.id });
      else await bookmarkPostById({ sessionClient, id: job.id });

      setIsBookmarked(!isBookmarked);  // TODO: load value from the server instead.
    } catch (error) {
      console.error("Error bookmarking job:", error);
    }
  }

  useEffect(() => {
    if (!sessionClient) return;
    const isBookmarked = job.operations?.hasBookmarked ?? false;
    setIsBookmarked(isBookmarked);
  }, []);

  return (
    <div onClick={onClick} className="bg-surface text-white rounded-2xl p-6 shadow-md border border-slate-800 relative transition hover:scale-[1.01] duration-200">
      <div className="absolute top-4 right-4 text-accent cursor-pointer hover:text-yellow-400">
        {isBookmarked ?
          <BookmarkCheck onClick={(e) => handleBookmarking(e)} size={20} strokeWidth={2} /> :
          <Bookmark onClick={(e) => handleBookmarking(e)} size={20} strokeWidth={2} />
        }
      </div>

      <h2 className="text-xl font-semibold text-primary mb-2">{title}</h2>

      <p className="text-sm text-gray-300 mb-4 line-clamp-4 whitespace-pre-wrap">
        {content}
      </p>

      <div className="flex items-center justify-between text-sm mb-3">
        <span className="text-secondary font-medium">💰 {fee}{feePerHour === "true" && "/hr"}</span>
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
