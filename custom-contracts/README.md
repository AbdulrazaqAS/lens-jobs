# Sample Hardhat Project

Deploy
```bash
npx hardhat deploy-zksync --script deploy-regular-storage.js --network lensTestnet
```

Verify regular contract
```bash
# npx hardhat verify <CONTRACT-ADDRESS> [<constructor-args>] --network lensTestnet
npx hardhat verify 0xda2BFD327d880A42Ec72E3392E10e43bb32B874F "42" --network lensTestnet
```

npx hardhat deploy-zksync --script deploy-regular-applyaction.js --network lensTestnet

npx hardhat verify 0x16589AC99D1F36f08dbE8EA6363F671AC161ef2F "0x4e6cF1F803CdbEE5Fe02360C7242268f3D9C2235" --network lensTestnet
