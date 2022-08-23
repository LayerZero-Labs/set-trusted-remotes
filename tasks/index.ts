import { task, types } from "hardhat/config";
const crossChainHelper = require("../utils/crossChainHelper")

// connect UserApplications by calls setTrustedRemote() to enable communication
task("setTrustedRemotes", "set trusted remotes helper", require('./setTrustedRemotes'))
    .addOptionalParam('networks', "csv (no spaces) of network names to operate on", "fuji,mumbai,fantom-testnet", types.string)

// show the signers (public addresses) associated with .env MNEMONIC
task("getSigners", "show the signers of the current mnemonic", require("./getSigners"))