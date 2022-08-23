// @ts-nocheck
import { cli } from "cli-ux"
import * as crossChainHelper from "../utils/crossChainHelper"
const V_CHAIN_IDS = require('../constants/virtualChainIds.json')
import markdownTable from "markdown-table"
const fs = require("fs").promises

export async function promptToProceed(msg: string): Promise<boolean> {
    const proceed = await cli.prompt(`${msg} y/N`)
    return ["y", "yes"].includes(proceed.toLowerCase())
}

module.exports = async function (taskArgs, hre) {

    let networks = taskArgs.networks.split(',')
    console.log(networks)

    await promptToProceed(`do you want to wire these networks: ${networks} ?`)

    console.log(`************************************************`)
    console.log(`Computing diff`)
    console.log(`************************************************`)

    let transactionBynetwork = await Promise.all(
        networks.map(async (network) => {
            const transactions: crossChainHelper.Transaction[] = []
            console.log(`network: ${network}`)
            await Promise.all(
                networks.map(async (remoteNetwork) => {
                    console.log(`   remote: ${remoteNetwork}`)
                    const remoteConfigurationTransactions: crossChainHelper.Transaction[] = []
                    // setVirtualRemotes
                    remoteConfigurationTransactions.push(
                        ...(await crossChainHelper.setTrustedRemote(hre, network, remoteNetwork, V_CHAIN_IDS)))
                    // push the txns into the array returned
                    transactions.push(...remoteConfigurationTransactions)
                })
            )

            return {
                network,
                transactions,
            }
        })
    )


    transactionBynetwork.forEach(({ network, transactions }) => {
        console.log(`************************************************`)
        console.log(`Transaction for ${network}`)
        console.log(`************************************************`)
        const transactionNeedingChange = transactions.filter((transaction) => transaction.needChange)
        if (!transactionNeedingChange.length) {
            console.log("No change needed")
        } else {
            console.table(transactionNeedingChange)
        }
    })
    const columns = ["needChange", "chainId", "remoteChainId", "contractName", "methodName", "args", "diff", "calldata"]

    await fs.writeFile(
        "./transactions.md",
        markdownTable([
            ["network"].concat(columns),
            ...transactionBynetwork.reduce((acc, { network, transactions }) => {
                transactions.forEach((transaction) => {
                    acc.push([
                        network,
                        ...columns.map((key) => {
                            if (typeof transaction[key] === "object") {
                                return JSON.stringify(transaction[key])
                            } else {
                                return transaction[key]
                            }
                        }),
                    ])
                })
                return acc
            }, []),
        ])
    )

    console.log("Full configuration is written at:")
    console.log(`file:/${process.cwd()}/transactions.md`)

    if (taskArgs.s) {
        const skipNetworks = taskArgs.s.split(",")
        console.log(`Skipping commit for networks ${skipNetworks}`)
        transactionBynetwork = transactionBynetwork.filter((txs) => !skipNetworks.includes(txs.network))
    }

    if (
        !(await promptToProceed(
            taskArgs.n ? "Would you like to proceed with above instructions in Gnosis?" : "Would you like to proceed with above instruction?"
        ))
    ) {
        return
    }

    const errs: any[] = []
    const print: any = {}
    let previousPrintLine = 0
    const printResult = () => {
        if (previousPrintLine) {
            process.stdout.moveCursor(0, -previousPrintLine)
        }
        if (Object.keys(print)) {
            previousPrintLine = Object.keys(print).length + 4
            console.table(Object.keys(print).map((network) => ({ network, ...print[network] })))
        }
    }

    await Promise.all(
        transactionBynetwork.map(async ({ network, transactions }) => {
            const transactionToCommit = transactions.filter((transaction) => transaction.needChange)

            let successTx = 0
            print[network] = print[network] || { requests: `${successTx}/${transactionToCommit.length}` }
            for (let transaction of transactionToCommit) {
                print[network].current = `${transaction.contractName}.${transaction.methodName}`
                printResult()
                try {
                    const tx = await crossChainHelper.executeTransaction(hre, network, transaction)
                    print[network].past = `${transaction.contractName}.${transaction.methodName} (${tx.transactionHash})`
                    successTx++
                    print[network].requests = `${successTx}/${transactionToCommit.length}`
                    printResult()
                } catch (err: any) {
                    console.log(
                        `Failing calling ${transaction.contractName}.${transaction.methodName} for network ${network} with err ${err}`
                    )
                    console.log(err)
                    errs.push({
                        network,
                        err,
                    })
                    print[network].current = err
                    print[network].err = true
                    printResult()
                    break
                }
            }
        })
    )

    if (!errs.length) {
        console.log("Wired all networks successfully")
    } else {
        console.log(errs)
    }
}
