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

npx hardhat verify 0x6c1f23ABE62E139D34cE932c5D49DF5D23FFAcd7 "0x4A92a97Ff3a3604410945ae8CA25df4fBB2fDC11" --network lensTestnet
