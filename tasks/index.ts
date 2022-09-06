import { task } from "hardhat/config";

// connect UserApplications by calls setTrustedRemote() to enable communication
task("setTrustedRemote", "set trusted remote", require('./setTrustedRemote'))
    .addParam('networks', "csv (no spaces) of network names to operate on")

// show the signers (public addresses) associated with .env MNEMONIC
task("getSigners", "show the signers of the current mnemonic", require("./getSigners"))