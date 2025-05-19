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

npx hardhat verify 0x415426Ef44F8E71e919864E3143b50f40Ce9073D "0x4e6cF1F803CdbEE5Fe02360C7242268f3D9C2235" --network lensTestnet

npx hardhat verify 0xF4E03643dD3a3D07608DB20a0ec0Bb83229149d8