require("@nomicfoundation/hardhat-toolbox");
require("@matterlabs/hardhat-zksync");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  zksolc: {
    version: "latest",
    settings: {},
  },
  networks: {
    lensTestnet: {
      chainId: 37111,
      ethNetwork: "sepolia",
      url: "https://rpc.testnet.lens.xyz",
      verifyURL:
        "https://verify.lens.xyz/contract_verification",
      zksync: true,
    },
    lensMainnet: {
      chainId: 232,
      ethNetwork: "mainnet",
      url: "https://rpc.lens.xyz",
      verifyURL:
        "https://block-explorer-verify.testnet.lens.dev/contract_verification",
      zksync: true,
    },

    hardhat: {
      zksync: true,
    },
  }
};
