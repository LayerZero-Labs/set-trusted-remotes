// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.4;

contract ExampleWithTrustedRemote {

    mapping(uint16 => bytes) public trustedRemoteLookup;

    event SetTrustedRemote(uint16 _srcChainId, bytes _srcAddress);

    function setTrustedRemote(uint16 _srcChainId, bytes calldata _srcAddress) external {
        trustedRemoteLookup[_srcChainId] = _srcAddress;
        emit SetTrustedRemote(_srcChainId, _srcAddress);
    }
}
