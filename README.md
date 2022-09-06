# Updating Set-Trusted-Remotes (Two Methods)

Modify your dApp to ULNv2 by calling setTrustedRemote in one of two ways:

1. Script
2. Manual Update
---
# Script
This script will update the set trusted remotes to point to the new virtual chainId which is defined in `constants/virtualChainIds.json`. Instead of setting it to only the `remote address` it will set it to new `remote address + local address` standard.
Very carefully fill out `constants/setTrustedRemoteConfig.json` with the name of your setTrustedRemote `methodName`, trustedRemoteLookup `mapName` (in case they are different), and the `address` of your contracts.

## Prerequisites

1. Run yarn install
2. Add a .env file (to the root project directory) with the MNEMONIC="" that owns the contracts.
3. Add your contract addresses to `constants/setTrustedRemoteConfig.json`

## Install
`yarn install`

## Simply run this command with the chains you support:
`npx hardhat setTrustedRemote --networks ethereum,bsc,avalanche,polygon,arbitrum,optimism,fantom`
#### Note: Make sure the script finishes with 100% success and no failures. You may need to run this script multiple times.

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