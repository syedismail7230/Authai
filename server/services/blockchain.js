// Blockchain Service for Certificate Management
import { ethers } from 'ethers';

// Contract ABI (simplified - full ABI would be generated after compilation)
const CONTRACT_ABI = [
    "function mintCertificate(string certificateId, bytes32 contentHash, address owner, string verdict) public returns (bool)",
    "function verifyCertificate(string certificateId, bytes32 contentHash) public view returns (bool isValid, address owner, uint256 timestamp)",
    "function getCertificate(string certificateId) public view returns (bytes32 contentHash, address issuer, address owner, uint256 timestamp, string verdict)",
    "event CertificateMinted(string indexed certificateId, bytes32 contentHash, address indexed owner, string verdict, uint256 timestamp)"
];

// Polygon Mumbai Testnet Configuration
const POLYGON_MUMBAI_RPC = 'https://rpc-mumbai.maticvigil.com';
const POLYGON_MAINNET_RPC = 'https://polygon-rpc.com';

// Contract addresses (deploy and update these)
const CONTRACT_ADDRESSES = {
    testnet: process.env.POLYGON_TESTNET_CONTRACT || '0x0000000000000000000000000000000000000000',
    mainnet: process.env.POLYGON_MAINNET_CONTRACT || '0x0000000000000000000000000000000000000000'
};

class BlockchainService {
    constructor() {
        this.isTestnet = process.env.NODE_ENV !== 'production';
        this.rpcUrl = this.isTestnet ? POLYGON_MUMBAI_RPC : POLYGON_MAINNET_RPC;
        this.contractAddress = this.isTestnet ? CONTRACT_ADDRESSES.testnet : CONTRACT_ADDRESSES.mainnet;
        
        // Initialize provider
        this.provider = new ethers.providers.JsonRpcProvider(this.rpcUrl);
        
        // Initialize wallet (use environment variable for private key)
        if (process.env.BLOCKCHAIN_PRIVATE_KEY) {
            this.wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, this.provider);
            this.contract = new ethers.Contract(this.contractAddress, CONTRACT_ABI, this.wallet);
        } else {
            console.warn('Blockchain private key not set - using read-only mode');
            this.contract = new ethers.Contract(this.contractAddress, CONTRACT_ABI, this.provider);
        }
    }
    
    /**
     * Mint certificate on blockchain
     */
    async mintCertificate(certificateId, contentHash, ownerAddress, verdict) {
        try {
            if (!this.wallet) {
                throw new Error('Blockchain wallet not configured');
            }
            
            // Convert content hash to bytes32
            const hashBytes32 = ethers.utils.hexZeroPad(
                ethers.utils.hexlify(ethers.utils.toUtf8Bytes(contentHash)),
                32
            );
            
            // Send transaction
            const tx = await this.contract.mintCertificate(
                certificateId,
                hashBytes32,
                ownerAddress,
                verdict
            );
            
            // Wait for confirmation
            const receipt = await tx.wait();
            
            return {
                success: true,
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                network: this.isTestnet ? 'mumbai' : 'polygon'
            };
        } catch (error) {
            console.error('Blockchain minting error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Verify certificate on blockchain
     */
    async verifyCertificate(certificateId, contentHash) {
        try {
            const hashBytes32 = ethers.utils.hexZeroPad(
                ethers.utils.hexlify(ethers.utils.toUtf8Bytes(contentHash)),
                32
            );
            
            const [isValid, owner, timestamp] = await this.contract.verifyCertificate(
                certificateId,
                hashBytes32
            );
            
            return {
                isValid,
                owner,
                timestamp: timestamp.toNumber(),
                verifiedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Blockchain verification error:', error);
            return {
                isValid: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get certificate details from blockchain
     */
    async getCertificateDetails(certificateId) {
        try {
            const [contentHash, issuer, owner, timestamp, verdict] = 
                await this.contract.getCertificate(certificateId);
            
            return {
                contentHash: ethers.utils.toUtf8String(contentHash),
                issuer,
                owner,
                timestamp: timestamp.toNumber(),
                verdict,
                blockchainVerified: true
            };
        } catch (error) {
            console.error('Error fetching certificate:', error);
            return null;
        }
    }
    
    /**
     * Get transaction explorer URL
     */
    getExplorerUrl(txHash) {
        const baseUrl = this.isTestnet 
            ? 'https://mumbai.polygonscan.com'
            : 'https://polygonscan.com';
        return `${baseUrl}/tx/${txHash}`;
    }
    
    /**
     * Check if blockchain is available
     */
    async isAvailable() {
        try {
            await this.provider.getBlockNumber();
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Singleton instance
let blockchainService = null;

export function getBlockchainService() {
    if (!blockchainService) {
        blockchainService = new BlockchainService();
    }
    return blockchainService;
}

export default {
    getBlockchainService,
    BlockchainService
};
