import { useState, useEffect } from 'react';
import { Post } from '@lens-protocol/client';
import FreelancerJobsPageJobCard from './FreelancerJobsPageJobCard';
import FreelancerJobsPageJobDetailsOverlay from './FreelancerJobsPageJobDetailsOverlay';

interface Props {
    job: Post;
    onDelete?: () => void;
    onUpdate?: () => void;
}

export default function FreelancerJobsPageJobDetails({
    job,
    onDelete,
    onUpdate,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(()=>{
        if (isOpen){
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <div className="relative">
            <FreelancerJobsPageJobCard job={job} onClick={() => setIsOpen(true)}/>

            {isOpen && (
                // <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-auto">
                <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div onClick={(e)=>e.stopPropagation()} className="relative w-full max-w-4xl mx-auto my-10 bg-surface text-white rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
                        <FreelancerJobsPageJobDetailsOverlay job={job}/>
                    </div>
                </div>
            )}
        </div>
    )
}