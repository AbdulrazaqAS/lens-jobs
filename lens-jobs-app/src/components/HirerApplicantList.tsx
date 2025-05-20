import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Github, Twitter, Linkedin } from "lucide-react";
import { PostExecutedActions } from "@lens-protocol/client";
import { useReadContract } from "wagmi";
import JobPostApplyActionABI from '../assets/jobPostApplyActionABI.json';
import { AccountAttributeName } from "../utils/constants";
import { decodeValue } from "../utils/helpers";

const JOB_POST_APPLY_ACTION_ADDRESS = import.meta.env.VITE_JOB_APPLY_ACTION_ADDRESS;
const FEED_ADDRESS = import.meta.env.VITE_APP_FEED_ADDRESS;

interface Props {
  applications: PostExecutedActions[];
  setSelected: Function;
  selected?: string;
  jobId: string;
}

export default function HirerApplicantList({ applications, jobId, setSelected, selected }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);

  const {
    data: applicationFormUri,
    isLoading: isLoadingFormUri,
    error: formUriError,
  } = useReadContract({
    abi: JobPostApplyActionABI,
    address: JOB_POST_APPLY_ACTION_ADDRESS,
    functionName: "applicationFormUris",
    args: [FEED_ADDRESS, jobId, expanded],
    query: {
      enabled: !!expanded, // only run if expanded is not null
    },
  });

  const toggleExpand = (address: string) => {
    // if this address is already expanded, close it by setting to null
    // else set is as expanded
    setExpanded(expanded === address ? null : address);
  };

  useEffect(() => {
    console.log({isLoadingFormUri, applicationFormUri, formUriError});
    if (!applicationFormUri) return;
    try {
      const metadataUri = decodeValue(applicationFormUri as `0x${string}`, "string appFormUri");
      console.log("MetadataUri", metadataUri);
    } catch (error) {
      console.error("Error decoding value:", error);
    }
  }, [applicationFormUri]);

  return (
    <ul className="space-y-4">
      {applications.map((application: PostExecutedActions) => {
        const isSelected = selected === application.account.address;
        const isExpanded = expanded === application.account.address;

        const { name, bio, picture, attributes } = application.account.metadata ?? {};
        const twitterUrl = attributes?.find((attr) => attr.key === AccountAttributeName.twitter)?.value ?? "";
        const linkedInUrl = attributes?.find((attr) => attr.key === AccountAttributeName.linkedin)?.value ?? "";
        const githubUrl = attributes?.find((attr) => attr.key === AccountAttributeName.github)?.value ?? "";

        return (
          <li
            key={application.account.address}
            className={`bg-background border ${isSelected ? "border-secondary" : "border-white/10"} rounded-lg py-1 px-2`}
          >
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand(application.account.address)}
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-lg">
                  {name ?? "Lens Jobs Freelancer"}
                </span>
              </div>
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {isExpanded && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                {/* Picture + Bio */}
                <div className="flex items-start gap-4">
                  {picture && (
                    <img
                      src={picture}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border border-secondary"
                    />
                  )}
                  <p className="text-white">{bio ?? "No bio provided."}</p>
                </div>

                {/* Cover letter */}
                <div>
                  <p className="font-semibold text-white mb-1">Cover Letter</p>
                  
                  {isLoadingData && <p className="italic">Loading application cover letter...</p>}
                  {coverLetter && <p className="italic">{coverLetter}</p>}
                </div>

                {/* Price & Duration */}
                <div>
                  <p className="font-semibold text-white">Price & Duration</p>

                  {isLoadingData && <p className="italic">Loading application price and duration...</p>}
                  {price && duration &&
                    <p>
                      <span className="text-secondary font-bold">{price} USDC</span>{" "}
                      • <span className="text-secondary font-bold">{duration}</span>
                    </p>
                  }
                </div>

                {/* Socials */}
                <div className="flex flex-col gap-2">
                  <p className="font-semibold text-white">Socials</p>
                  <div className="flex gap-4 items-center">
                    {twitterUrl && (
                      <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
                        <Twitter className="w-5 h-5 hover:text-secondary transition" />
                      </a>
                    )}
                    {linkedInUrl && (
                      <a href={linkedInUrl} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-5 h-5 hover:text-secondary transition" />
                      </a>
                    )}
                    {githubUrl && (
                      <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="w-5 h-5 hover:text-secondary transition" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Select Button */}
                <div className="mt-4 md:mt-0 md:col-span-2">
                  <button
                    onClick={() => setSelected(application.account.address)}
                    className={`px-4 py-2 rounded font-semibold text-sm transition ${isSelected
                        ? "bg-secondary text-black"
                        : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
