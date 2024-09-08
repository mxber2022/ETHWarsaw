// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IProofVerifier {
    function verifyProofAttestation(
        uint256 _attestationId,
        bytes32 _leaf,
        bytes32[] calldata _merklePath,
        uint256 _leafCount,
        uint256 _index
    ) external returns (bool);
}

contract AttestationCaller {
    // Address of the contract with verifyProofAttestation function
    address public verifierContract = 0x209f82A06172a8d96CF2c95aD8c42316E80695c1;

    // Mapping to store attestationId and verification result
    mapping(uint256 => bool) public verificationResults;

    // Call the verifyProofAttestation function on the external contract
    function callVerifyProofAttestation(
        uint256 _attestationId,
        bytes32 _leaf,
        bytes32[] calldata _merklePath,
        uint256 _leafCount,
        uint256 _index
    ) external returns (bool) {
        IProofVerifier verifier = IProofVerifier(verifierContract);
        
        // Call the function on the verifier contract
        bool result = verifier.verifyProofAttestation(_attestationId, _leaf, _merklePath, _leafCount, _index);
        
        // Ensure the result is true
        require(result, "Attestation verification failed");
        
        // Store the result in the mapping
        verificationResults[_attestationId] = result;
        
        // Return the result of the verification
        return result;
    }
}
