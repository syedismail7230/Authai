// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AuthAI Certificate Registry
 * @dev Stores certificate hashes on Polygon blockchain for immutable verification
 */
contract AuthAICertificateRegistry {
    struct Certificate {
        bytes32 contentHash;
        address issuer;
        address owner;
        uint256 timestamp;
        string verdict;
        bool exists;
    }
    
    mapping(string => Certificate) public certificates;
    mapping(address => string[]) public userCertificates;
    
    event CertificateMinted(
        string indexed certificateId,
        bytes32 contentHash,
        address indexed owner,
        string verdict,
        uint256 timestamp
    );
    
    event CertificateTransferred(
        string indexed certificateId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    
    /**
     * @dev Mint a new certificate on the blockchain
     */
    function mintCertificate(
        string memory certificateId,
        bytes32 contentHash,
        address owner,
        string memory verdict
    ) public returns (bool) {
        require(!certificates[certificateId].exists, "Certificate already exists");
        require(owner != address(0), "Invalid owner address");
        
        certificates[certificateId] = Certificate({
            contentHash: contentHash,
            issuer: msg.sender,
            owner: owner,
            timestamp: block.timestamp,
            verdict: verdict,
            exists: true
        });
        
        userCertificates[owner].push(certificateId);
        
        emit CertificateMinted(
            certificateId,
            contentHash,
            owner,
            verdict,
            block.timestamp
        );
        
        return true;
    }
    
    /**
     * @dev Verify a certificate exists and matches the content hash
     */
    function verifyCertificate(
        string memory certificateId,
        bytes32 contentHash
    ) public view returns (bool isValid, address owner, uint256 timestamp) {
        Certificate memory cert = certificates[certificateId];
        
        if (!cert.exists) {
            return (false, address(0), 0);
        }
        
        bool hashMatches = cert.contentHash == contentHash;
        return (hashMatches, cert.owner, cert.timestamp);
    }
    
    /**
     * @dev Get certificate details
     */
    function getCertificate(string memory certificateId) 
        public 
        view 
        returns (
            bytes32 contentHash,
            address issuer,
            address owner,
            uint256 timestamp,
            string memory verdict
        ) 
    {
        require(certificates[certificateId].exists, "Certificate does not exist");
        Certificate memory cert = certificates[certificateId];
        return (
            cert.contentHash,
            cert.issuer,
            cert.owner,
            cert.timestamp,
            cert.verdict
        );
    }
    
    /**
     * @dev Transfer certificate ownership
     */
    function transferCertificate(
        string memory certificateId,
        address newOwner
    ) public returns (bool) {
        require(certificates[certificateId].exists, "Certificate does not exist");
        require(certificates[certificateId].owner == msg.sender, "Not certificate owner");
        require(newOwner != address(0), "Invalid new owner");
        
        address oldOwner = certificates[certificateId].owner;
        certificates[certificateId].owner = newOwner;
        userCertificates[newOwner].push(certificateId);
        
        emit CertificateTransferred(
            certificateId,
            oldOwner,
            newOwner,
            block.timestamp
        );
        
        return true;
    }
    
    /**
     * @dev Get all certificates owned by an address
     */
    function getUserCertificates(address user) 
        public 
        view 
        returns (string[] memory) 
    {
        return userCertificates[user];
    }
}
