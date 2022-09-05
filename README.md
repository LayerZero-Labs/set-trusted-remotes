# Updating Set-Trusted-Remotes (Two Methods)

Modify your dApp to ULNv2 by calling setTrustedRemote in one of two ways:

1. Script
2. Manual Update
---
# Script
use hardhat to easily setTrustedRemote(uint16,bytes) to new chainIds for your contracts

## Prerequisite:
- add your contract addresses to `/constants/config.json`

## Install
`yarn install`

## Run
`npx hardhat setTrustedRemotes --networks ethereum,bsc,avalanche,polygon,arbitrum,optimism,fantom`

---
# Manual
1. Each contract built on LayerZero has a function, `setTrustedRemote(uint16, bytes)` (or something similar), which specifies its trusted contracts. You will have already set your trusted remotes once. You will need to do this again with the new format for addresses.

2. `setTrustedRemote(uint16, bytes)` takes two parameters:
- ***uint16*** chainId
- A 40-byte ***bytes***, which is the abi.encode()’ed ***remote*** plus ***local*** contract address. 

3. Call setTrustedRemote() for the ***NEW chainIds*** your contracts need for LayerZero messaging. 
- Ethereum: 101
- BNB: 102
- Avalanche: 106
- Polygon: 109
- Arbitrum: 110
- Optimism: 111
- Fantom: 112
- Swimmer: 114
- DFK: 115
- Harmony: 116
