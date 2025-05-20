# LensJobs
LensJobs is a decentralized micro-job board built on Lens Protocol and Lens Chain, empowering freelancers and job posters to connect, apply, and collaborate with trust — all on-chain.


## Features
### For Hirers
- Create Jobs: Post freelance gigs directly on-chain with clear deliverables.
- View Applications: Expandable list to inspect freelancer profiles and proposals.
- Select Talent: Hire applicants with a single on-chain transaction.

### For Freelancers
- Apply to Jobs: Submit cover letters, pricing, and profile.

Social Metadata: Add LinkedIn, Twitter, GitHub, and more.

## Tech Stack
Frontend: Next.js + Tailwind CSS + Lucide Icons
Smart Contracts: Solidity (Lens Protocol compatible actions)

Blockchain: Lens Chain (Mainnet)

Storage: IPFS via Web3.Storage

Wallet: wagmi + viem

🧠 Lens Social Primitives Used
Lens Protocol Profiles

Open Actions: For custom job posting & application flows

Metadata Standards: All profiles and applications use Lens metadata schemas

## How It Works
- Hirer posts a job → Stored on-chain with IPFS metadata
- Freelancers apply → Application data is encoded & submitted on-chain
- Applications retrieved → Decoded on frontend using viem and rendered
- Hirer hires → On-chain selection of freelancer; could extend to escrow or verification


## License
MIT — Open to collaboration & community contributions!