// @ts-nocheck
import * as ethers from "ethers"
import { getDeploymentAddresses, getRpc } from "./readStatic"
import { ChainKey, CHAIN_ID, getEndpointIdByName } from "@layerzerolabs/lz-sdk"
import { TransactionReceipt } from "@ethersproject/abstract-provider"

export interface ExecutableTransaction {
    contractName: string
    methodName: string
    args: any[]
}

export interface Transaction {
    needChange: boolean
    contractName: string
    methodName: string
    args: any[]
    chainId: string
    remoteChainId?: string
    diff?: { [key: string]: { newValue: any; oldValue: any } }
}

export let FORKING = false
export const setForking = (fork: boolean) => {
    FORKING = fork
}

// encode the calldata into the 'calldata' the transaction requires to be sent
// hre: the hardhat runtime environment, for access to hre.web3.utils.keccak256()
// methodName: "setPause" or "setRemoteUln"  ie: the string name of the contract function
// params: ['bool','uint256'] ie: a string array of the types of the function parameters
// args: [ true, 1234 ] ie: the array of values that correspond to the types in params
//
// return: string like: "0xbedb86fb0000000000000000000000000000000000000000000000000000000000000001"
export function generateCalldata(hre: any, methodName: string, params: string[], args: any){
    return `${hre.web3.utils.keccak256(`${methodName}(${params.join(',')})`).substring(0, 10)}${hre.web3.eth.abi
        .encodeParameters(params, args)
        .substring(2)}`
}

export const isRoolup = (network) =>
    ["optimism", "optimism-kovan", "optimism-kovan-sandbox", "arbitrum", "arbitrum-rinkeby", "arbitrum-rinkeby-sandbox"].includes(network)

//todo: after deprecating ulnv1, update sdk to new chainId and get id directly from CHAIN_ID
export function getEndpointId(networkName: string, ulnVersion: number): number {
    switch (ulnVersion) {
        case 1:
            return CHAIN_ID[networkName.replace("-fork", "")]
        case 2:
            return CHAIN_ID[networkName.replace("-fork", "")] + 100
        default:
            throw new Error(`Unknown ULN version: ${ulnVersion}`)
    }
}

const providerByNetwork = {}
export const getProvider = (network) => {
    if (!providerByNetwork[network]) {
        let networkUrl = FORKING && !network.includes("-fork") ? getRpc(`${network}-fork`) : getRpc(network)
        providerByNetwork[network] = new ethers.providers.JsonRpcProvider(networkUrl)
    }
    return providerByNetwork[network]
}

export const getWallet = (index) => {
    return ethers.Wallet.fromMnemonic(process.env.MNEMONIC || "", `m/44'/60'/0'/0/${index}`)
}

const connectedWallets = {}
export const getConnectedWallet = (network, walletIndex) => {
    const key = `${network}-${walletIndex}`
    if (!connectedWallets[key]) {
        const provider = getProvider(network)
        const wallet = getWallet(walletIndex)
        connectedWallets[key] = wallet.connect(provider)
    }
    return connectedWallets[key]
}

const contractFactories = {}
export const getContractFactory = async (hre, contractName) => {
    if (!contractFactories[contractName]) {
        contractFactories[contractName] = await hre.ethers.getContractFactory(contractName)
    }
    return contractFactories[contractName]
}

const deploymentAddresses = {}
export const getDeploymentAddress = (network, contractName) => {
    network = network.replace("-fork", "")
    const key = `${network}-${contractName}`
    if (!deploymentAddresses[key]) {
        deploymentAddresses[key] = getDeploymentAddresses(network)[contractName]
    }
    return deploymentAddresses[key]
}

const contracts = {}
export const getContract = async (hre, network, contractName) => {
    if (network == "hardhat") {
        return await hre.ethers.getContract(contractName)
    }

    const key = `${network}-${contractName}`
    if (!contracts[key]) {
        const contractAddress = getDeploymentAddress(network, contractName)
        // console.log(`contractAddress[${contractAddress}] for ${network} - ${contractName}`)
        const provider = getProvider(network)
        const contractFactory = await getContractFactory(hre, contractName)
        const contract = contractFactory.attach(contractAddress)
        contracts[key] = contract.connect(provider)
    }
    return contracts[key]
}

export const getContractAtAddress = async (hre, network, contractName, contractAddress) => {
    if (network == "hardhat") {
        return await hre.ethers.getContract(contractName)
    }

    const key = `${network}-${contractName}-${contractAddress}`
    if (!contracts[key]) {
        // console.log(`contractAddress[${contractAddress}] for ${network} - ${contractName}`)
        const provider = getProvider(network)
        const contractFactory = await getContractFactory(hre, contractName)
        const contract = contractFactory.attach(contractAddress)
        contracts[key] = contract.connect(provider)
    }
    return contracts[key]
}

export const getWalletContract = async (hre, network, contractName, walletIndex) => {
    const contract = await getContract(hre, network, contractName)
    const wallet = getConnectedWallet(network, walletIndex)
    return contract.connect(wallet)
}

export async function setTrustedRemote(hre: any, network: string, remoteNetwork: string, vChainIds: any): Promise<Transaction[]> {
    const contractName = "ExampleWithTrustedRemote"

    const chainId = vChainIds[network]
    const remoteChainId = vChainIds[remoteNetwork]
    const example = await getContract(hre, network, contractName)
    const remoteExample = await getContract(hre, remoteNetwork, contractName)
    const currRemote = await example.trustedRemoteLookup(remoteChainId)
    const setRemote = `${remoteExample.address}${example.address.slice(2)}`
    console.log(setRemote)
    const needChange = currRemote == '0x' // it only needs to be set once to get rid of 0x

    const methodName = 'setTrustedRemote'
    const params = [
        'uint16',
        'bytes'
    ]
    const args = [
        remoteChainId,
        setRemote
    ]
    const calldata = generateCalldata(hre, methodName, params, args)

    const tx: any = {
        needChange,
        chainId,
        remoteChainId,
        contractName,
        methodName,
        args,
        calldata
    }
    if (tx.needChange) {
        tx.diff = { oldValue: currRemote, newValue: setRemote }
    }
    return [tx]
}

export const executeTransaction = async (
    hre: any,
    network: string,
    transaction: Transaction | ExecutableTransaction
): Promise<TransactionReceipt> => {

    const walletContract = await getWalletContract(hre, network, transaction.contractName, 0)

    const gasPrice = await getProvider(network).getGasPrice()
    const finalGasPrice = gasPrice.mul(10).div(8)
    // const receipt: TransactionReceipt = await (await walletContract[transaction.methodName](...transaction.args, {gasPrice: finalGasPrice})).wait()
    // const receipt: TransactionReceipt = await (await walletContract[transaction.methodName](...transaction.args, { gasLimit: 8000000 })).wait()
    return await (await walletContract[transaction.methodName](...transaction.args, { gasPrice: finalGasPrice, gasLimit: 8000000 })).wait()

}

