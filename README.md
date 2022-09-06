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
- A ***bytes*** path, which concatinates the ***remote*** and the ***local*** contract address using abi.encodePacked(). 

For example, to enable communcation between below contracts:
- 0x1234... on chain ID 101 (20 bytes / 42 characters in hex (e.g. 0x1234567890123456789012345678901234567890))
- 0xabcd... on chain ID 102 (20 bytes)
On chain 101 contract 0x1234..., setTrustedRemote(102, 0xabcd...1234...) (40 bytes)
On chain 102 contract 0xabcd..., setTrustedRemote(101, 0x1234...abcd...) (40 bytes)

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
