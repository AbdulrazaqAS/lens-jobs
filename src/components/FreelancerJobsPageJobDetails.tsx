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

    const closeOnOutsideClick = (e: MouseEvent) => {
        const modalContent = document.getElementById('overlay-content');  // Top-level element of FreelancerJobsPageJobDetailsOverlay has this ID
        if (modalContent && !modalContent.contains(e.target as Node)) {  // If the click is outside the modal content
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', closeOnOutsideClick);
        } else {
            document.removeEventListener('mousedown', closeOnOutsideClick);
        }
        return () => {
            document.removeEventListener('mousedown', closeOnOutsideClick);
        };
    }, [isOpen]);

    return (
        <div className="relative">
            <FreelancerJobsPageJobCard job={job} onClick={() => setIsOpen(true)}/>

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <FreelancerJobsPageJobDetailsOverlay job={job}/>
                </div>
            )}
        </div>
    )
}