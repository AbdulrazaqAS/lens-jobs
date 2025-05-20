import { Deployer } from "@matterlabs/hardhat-zksync";
import { Wallet } from "zksync-ethers";
import 'dotenv/config'

import addresses from "../constants.json" with { type: "json" };

const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;

export default async function (hre) {
  // Initialize the wallet.
  const wallet = new Wallet(WALLET_PRIVATE_KEY);

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);

  // Load contract
  const artifact = await deployer.loadArtifact("JobPostApplyAction");

  const actionHubAddress = addresses.mainnetActionHub;
  const actionContract = await deployer.deploy(artifact, [actionHubAddress]);

  // Show the contract info.
  console.log(
    `${artifact.contractName
    } was deployed to ${await actionContract.getAddress()}`
  );
}