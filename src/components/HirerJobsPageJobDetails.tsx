import { useState, useRef, useEffect } from 'react';
import HirerJobsPageJobCard from './HirerJobsPageJobCard';
import { Post } from '@lens-protocol/client';
import HirerJobsPageJobDetailsOverlay from './HirerJobsPageJobDetailsOverlay';

interface Props {
	job: Post;
	onSelectApplicant?: (applicant: string) => void;
	onDelete?: () => void;
	onUpdate?: () => void;
}

export default function HirerJobsPageJobDetails({
	job,
	onSelectApplicant,
	onDelete,
	onUpdate,
}: Props) {
	const [isOpen, setIsOpen] = useState(false);

	const closeOnOutsideClick = (e: MouseEvent) => {
		const modalContent = document.getElementById('overlay-content');  // Top-level element of HirerJobsPageJobDetailsOverlay has this ID
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
			<HirerJobsPageJobCard job={job} onClick={() => setIsOpen(true)}/>

			{isOpen && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
					<HirerJobsPageJobDetailsOverlay job={job} onSelectApplicant={()=>{}} onDelete={()=>{}} onUpdate={()=>{}}/>
				</div>
			)}
		</div>

	)
}