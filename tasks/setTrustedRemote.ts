// @ts-nocheck
import * as crossChainHelper from "../utils/crossChainHelper"
import {BigNumber, ethers} from "ethers";
const CONFIG = require('../constants/setTrustedRemoteConfig.json')
const V_CHAIN_IDS = require('../constants/virtualChainIds.json')

module.exports = async function (taskArgs, hre) {

    let networks = taskArgs.networks.split(',')
    console.log(networks)

    let totalRuns = networks.length * networks.length;
    let successCounter = 0;
    let failureCounter = 0;
    for (const local of networks) {
        for (const remote of networks) {
            let rpc = await crossChainHelper.getProvider(local);
            let wallet = await crossChainHelper.getConnectedWallet(local, 0)
            try {
                let contract = new ethers.Contract(
                    CONFIG[local].address,
                    new ethers.utils.Interface([
                        `function ${CONFIG.methodName}(uint16, bytes) external`,
                        `function ${CONFIG.mapName}(uint16) external view returns (bytes)`
                    ])
                ).connect(rpc)

                let remoteChainId = BigNumber.from(V_CHAIN_IDS[remote]);
                let trustedRemote = hre.ethers.utils.solidityPack(
                    ['address','address'],
                    [CONFIG[remote].address, CONFIG[local].address]
                )
                const currRemote = await contract[`${CONFIG.mapName}`](remoteChainId)
                if(currRemote === trustedRemote) {
                    console.log(`skipping ${local} ${CONFIG.methodName}(${remoteChainId},${trustedRemote}) ✅ `)
                    successCounter++;

                } else {
                    console.log(`${local} calling ${CONFIG.methodName}(${remoteChainId},${trustedRemote})`)
                    let finalGasPrice = await rpc.getGasPrice();
                    finalGasPrice = finalGasPrice.mul(10).div(5);

                    let tx = await (await contract.connect(wallet)[`${CONFIG.methodName}`](remoteChainId, trustedRemote, {gasPrice: finalGasPrice})).wait()
                    console.log(`tx hash[${local}]: ${tx.transactionHash}  ✅  `)
                    successCounter++;
                }
            } catch (err: any) {
                console.log(`error ${local} ${CONFIG.methodName} with ${remote} 🟥 `)
                failureCounter++;
            }
            if(failureCounter > 0) {
                console.log(`successful: ${successCounter}/${totalRuns} - (${Math.round((successCounter / totalRuns) * 100)}%) | failures: ${failureCounter}/${totalRuns} - (${Math.round((failureCounter / totalRuns) * 100)}%)`)
            } else {
                console.log(`successful: ${successCounter}/${totalRuns} - (${Math.round((successCounter / totalRuns) * 100)}%)`)
            }
        }
    }
}
