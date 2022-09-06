import "dotenv/config"
import "@nomiclabs/hardhat-solhint"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-web3"
import "@nomiclabs/hardhat-ethers"
import "hardhat-gas-reporter"
import "solidity-coverage"
import "hardhat-contract-sizer"
import "hardhat-tracer"
import "hardhat-deploy"
import "hardhat-deploy-ethers"
import "hardhat-spdx-license-identifier"
import "./tasks"

import {HardhatUserConfig} from "hardhat/types"
import {accounts, ChainId, setupNetwork, setupNetworks} from "@layerzerolabs/lz-sdk"

const config: HardhatUserConfig = {

    solidity: {
        version: "0.8.4",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },

    contractSizer: {
        alphaSort: false,
        runOnCompile: true,
        disambiguatePaths: false,
    },

    // for hardhat-deploy
    namedAccounts: {
        deployer: 0,
    },

    defaultNetwork: "hardhat",

    networks: {
        hardhat: {
            accounts: accounts()
        },

        ...setupNetworks([
            // mainnets
            [ChainId.ETHEREUM, { rpcIndex: 0 }],
            [ChainId.BSC, { rpcIndex: 0 }],
            [ChainId.AVALANCHE, { rpcIndex: 0 }],
            [ChainId.POLYGON, { rpcIndex: 0 }],
            [ChainId.ARBITRUM, {rpcIndex: 0 }],
            [ChainId.OPTIMISM, {rpcIndex: 0 }],
            [ChainId.FANTOM, { rpcIndex: 0 }],
            [ChainId.SWIMMER, { rpcIndex: 0 }],
            [ChainId.DFK, { rpcIndex: 0 }],
            [ChainId.HARMONY, { rpcIndex: 0 }],

            // testnets
            [ChainId.RINKEBY, {rpcIndex: 0}],
            [ChainId.BSC_TESTNET, {rpcIndex: 1}],
            [ChainId.FUJI, {rpcIndex: 0}],
            [ChainId.MUMBAI, {rpcIndex: 0}],
            [ChainId.ARBITRUM_RINKEBY, {rpcIndex: 0}],
            [ChainId.OPTIMISM_KOVAN, {rpcIndex: 0}],
            [ChainId.FANTOM_TESTNET, {rpcIndex: 0}]
        ]),

        // note: setup a single rpc like this. (be sure to comment out the above)
        // https://rpc.ftm.tools
        // ...setupNetwork(
        //     {
        //         url: `https://rpc.ftm.tools`,
        //     },
        //     [ChainId.FANTOM]
        // ),

    }
}

export default config
