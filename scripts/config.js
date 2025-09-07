/**
 * Centralized Configuration for NFT Split Platform
 * Contains all static contract addresses and network settings
 */

const CONFIG = {
  // Network Configuration
  NETWORK: {
    name: "testnet",
    chainId: 11155111, // Sepolia testnet
    rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/aQ_zjf5PpA0kHbAPKeSd9",
    blockExplorer: "https://sepolia.etherscan.io/"
  },

  // Contract Addresses (Sepolia Testnet)
  CONTRACTS: {
    NFTRegistry: "0x74d24760573516672b93d3B252407DB66Ec6b445",
    Manager: "0x68481fe2458F06c3F10Ae6CD7Ef889bA19E19544",
    NFTShares: "0xDA809A7B74229b892471A8Dbe407993c91f810A4",
    NFTContract: "0x018394653bCB2e06886fdA8EbCF297F93307c285"
  },

  // Test Addresses
  TEST_ADDRESSES: {
    firstOwner: "0x355bC79D9D58d9cfb9abEda3aa8A25e7A87b809d",
    buyer: "0x742d35Cc6634C0532925a3b8D0C0E1C2C5E5C5E5", // Example buyer address
    tokenId: 3
  },

  // Default Values
  DEFAULTS: {
    NFT_PRICE: "0.0001", // ETH
    MAX_SELLABLE_PERCENTAGE: 80, // %
    METADATA_URI: "https://i2.seadn.io/collection/nodes-by-hunter/image_type_preview_media/8049a798f688ef8b56face415f44e0/f58049a798f688ef8b56face415f44e0.gif?w=3840"
  },

  // Faucet URLs for getting testnet ETH
  FAUCETS: [
    "https://sepoliafaucet.com/",
    "https://faucets.chain.link/sepolia",
    "https://www.alchemy.com/faucets/ethereum-sepolia"
  ]
};

module.exports = CONFIG;
