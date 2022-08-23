const path = require("path")
const fs = require("fs")
const config = require("../hardhat.config")

function readContractAddressesFromDeployment(deploymentsPath, networkName) {
    let folderName = networkName
    if (networkName === "hardhat") {
        folderName = "localhost"
    }
    console.log(`deploymentsPath: ${deploymentsPath}`)
    const networkFolderName = fs.readdirSync(deploymentsPath).filter((f) => f === folderName)[0]
    if (!networkFolderName) {
        // throw Error(`Missing deployment files for ${networkName} in ${deploymentsPath}`)
        return {}
    }

    const networkFolderPath = path.resolve(deploymentsPath, networkName)
    const rtnAddresses = {}
    let files = fs.readdirSync(networkFolderPath).filter((f) => f.includes(".json"))
    files.forEach((file) => {
        const filepath = path.resolve(networkFolderPath, file)
        const data = JSON.parse(fs.readFileSync(filepath, "utf-8"))
        const contractName = file.split(".")[0]
        rtnAddresses[contractName] = data.address
    })
    return rtnAddresses
}


function getDeploymentAddresses(networkName) {
    const PROJECT_ROOT = path.resolve(__dirname, "..")
    const DEPLOYMENT_PATH = path.resolve(PROJECT_ROOT, "deployments")

    let rtnAddresses = readContractAddressesFromDeployment(path.resolve(DEPLOYMENT_PATH), networkName)
    const orgKeys = Object.keys(rtnAddresses)

    let lzAddress = {}
    const filtered = Object.keys(lzAddress)
        .filter((key) => !orgKeys.includes(key))
        .reduce((obj, key) => {
            return {
                ...obj,
                [key]: lzAddress[key],
            }
        }, {})
    rtnAddresses = {
        ...rtnAddresses,
        ...filtered,
    }

    return rtnAddresses
}

function getDeploymentAddressesAndAbi(networkName) {
    const PROJECT_ROOT = path.resolve(__dirname, "..")
    const DEPLOYMENT_PATH = path.resolve(PROJECT_ROOT, "deployments")

    let folderName = networkName
    if (networkName === "hardhat") {
        folderName = "localhost"
    }

    const networkFolderName = fs.readdirSync(DEPLOYMENT_PATH).filter((f) => f === folderName)[0]
    if (networkFolderName === undefined) {
        throw new Error("missing deployment files for endpoint " + folderName)
    }

    let rtnAddresses = {}
    const networkFolderPath = path.resolve(DEPLOYMENT_PATH, folderName)
    const files = fs.readdirSync(networkFolderPath).filter((f) => f.includes(".json"))
    files.forEach((file) => {
        const filepath = path.resolve(networkFolderPath, file)
        const data = JSON.parse(fs.readFileSync(filepath))
        const contractName = file.split(".")[0]
        rtnAddresses[contractName] = { address: data.address, abi: data.abi }
    })

    return rtnAddresses
}

function getRpc(network) {
    return config.default.networks[network].url
}

module.exports = {
    getDeploymentAddresses,
    getDeploymentAddressesAndAbi,
    getRpc,
}
