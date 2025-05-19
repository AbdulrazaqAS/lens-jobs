import { Deployer } from "@matterlabs/hardhat-zksync";
import { Wallet } from "zksync-ethers";
import 'dotenv/config'

const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;

export default async function (hre) {
  // Initialize the wallet.
  const wallet = new Wallet(WALLET_PRIVATE_KEY);

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);

  // Load contract
  const artifact = await deployer.loadArtifact("Storage");

  // `initialNumber` is an argument for contract constructor.
  const initialNumber = 42;
  const greeterContract = await deployer.deploy(artifact, [initialNumber]);

  // Show the contract info.
  console.log(
    `${artifact.contractName
    } was deployed to ${await greeterContract.getAddress()}`
  );
}