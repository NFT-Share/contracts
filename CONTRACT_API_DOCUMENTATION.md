# Contract API Documentation - Sepolia Testnet

This document provides comprehensive documentation for all contract functions, events, and frontend integration examples for the NFT Sharing Platform.

**⚠️ IMPORTANT: This platform is designed for Sepolia testnet only. Do not use on mainnet.**

## Contract Overview

The platform consists of three main contracts:

1. **Manager Contract** - Manages individual NFT sharing instances
2. **NFTRegistry Contract** - Central registry for all shared NFTs
3. **NFTShares Contract** - ERC20 token representing ownership shares

## Contract Addresses (Sepolia Testnet)

```javascript
const CONTRACT_ADDRESSES = {
    NFTRegistry: "0x74d24760573516672b93d3B252407DB66Ec6b445",
    Manager: "0x68481fe2458F06c3F10Ae6CD7Ef889bA19E19544", 
    NFTShares: "0xDA809A7B74229b892471A8Dbe407993c91f810A4",
    NFTContract: "0x018394653bCB2e06886fdA8EbCF297F93307c285"
};
```

---

## Manager Contract API

### Query Functions

#### `getNFTInfo()`
Returns comprehensive NFT information.

**Returns:**
```solidity
(
    address nftContract,    // Address of the NFT contract
    uint256 id,             // Token ID
    address owner,          // First owner address
    uint256 price,          // NFT price in wei
    uint256 maxSellable,    // Maximum sellable percentage
    uint256 totalSold       // Total sold percentage
)
```

**Frontend Usage:**
```javascript
const nftInfo = await managerContract.getNFTInfo();
console.log(`Price: ${ethers.formatEther(nftInfo[3])} ETH`);
console.log(`Max Sellable: ${nftInfo[4]}%`);
```

#### `getOwnershipPercentage(address _owner)`
Returns the ownership percentage for a specific address.

**Parameters:**
- `_owner` (address): The address to check

**Returns:**
- `uint256`: Ownership percentage (0-100)

**Frontend Usage:**
```javascript
const percentage = await managerContract.getOwnershipPercentage(userAddress);
console.log(`User owns ${percentage}%`);
```

#### `getRemainingOwnership()`
Returns the remaining ownership percentage of the first owner.

**Returns:**
- `uint256`: Remaining ownership percentage

#### `getAvailableForSale()`
Returns the percentage available for purchase.

**Returns:**
- `uint256`: Available percentage for sale

#### `calculateCost(uint256 _percentage)`
Calculates the cost for purchasing a specific percentage.

**Parameters:**
- `_percentage` (uint256): Percentage to purchase (1-100)

**Returns:**
- `uint256`: Cost in wei

**Frontend Usage:**
```javascript
const cost = await managerContract.calculateCost(25); // 25%
const costInEth = ethers.formatEther(cost);
console.log(`Cost for 25%: ${costInEth} ETH`);
```

#### `isOwner(address _address)`
Checks if an address owns any shares.

**Parameters:**
- `_address` (address): Address to check

**Returns:**
- `bool`: True if address owns shares

#### `canBuyPercentage(uint256 _percentage)`
Checks if a percentage can be purchased.

**Parameters:**
- `_percentage` (uint256): Percentage to check

**Returns:**
- `bool`: True if percentage can be purchased

#### `getContractStatus()`
Returns the current contract status.

**Returns:**
```solidity
(
    bool nftInContract,        // Is NFT in the contract
    bool nftTransferredFlag,  // NFT transfer flag
    address currentNFTOwner    // Current NFT owner
)
```

#### `getOwnershipBreakdown()`
Returns detailed ownership breakdown.

**Returns:**
```solidity
(
    address firstOwner,           // First owner address
    uint256 firstOwnerPercentage, // First owner's percentage
    uint256 totalSold,           // Total sold percentage
    uint256 remainingAvailable   // Remaining available percentage
)
```

#### `getSharesTokenAddress()`
Returns the address of the shares token contract.

**Returns:**
- `address`: Shares token contract address

#### `getSharesBalance(address account)`
Returns the shares balance for an account.

**Parameters:**
- `account` (address): Account address

**Returns:**
- `uint256`: Shares balance

#### `getSharesForPercentage(uint256 percentage)`
Returns the number of shares for a given percentage.

**Parameters:**
- `percentage` (uint256): Percentage (1-100)

**Returns:**
- `uint256`: Number of shares

### Events

#### `NFTShared`
Emitted when an NFT is shared.

```solidity
event NFTShared(
    address indexed nftContract,
    uint256 indexed tokenId,
    address indexed managerContract,
    address firstOwner,
    uint256 nftPrice,
    uint256 maxSellablePercentage
);
```

**Frontend Usage:**
```javascript
managerContract.on("NFTShared", (nftContract, tokenId, managerContract, firstOwner, nftPrice, maxSellable) => {
    console.log(`NFT shared: ${nftContract} token ${tokenId}`);
    console.log(`Price: ${ethers.formatEther(nftPrice)} ETH`);
});
```

#### `NFTPurchased`
Emitted when someone purchases shares.

```solidity
event NFTPurchased(
    address indexed managerContract,
    address indexed buyer,
    uint256 percentage,
    uint256 cost
);
```

**Frontend Usage:**
```javascript
managerContract.on("NFTPurchased", (managerContract, buyer, percentage, cost) => {
    console.log(`${buyer} purchased ${percentage}% for ${ethers.formatEther(cost)} ETH`);
});
```

#### `PriceUpdated`
Emitted when the NFT price is updated.

```solidity
event PriceUpdated(
    address indexed managerContract,
    uint256 oldPrice,
    uint256 newPrice
);
```

#### `MaxSellableUpdated`
Emitted when the maximum sellable percentage is updated.

```solidity
event MaxSellableUpdated(
    address indexed managerContract,
    uint256 oldMax,
    uint256 newMax
);
```

---

## NFTRegistry Contract API

### Query Functions

#### `getTotalSharedNFTs()`
Returns the total number of shared NFTs.

**Returns:**
- `uint256`: Total count

#### `getNFTIndex(uint256 _index)`
Returns NFT information by index.

**Parameters:**
- `_index` (uint256): Index in the registry

**Returns:**
```solidity
struct NFTIndex {
    address nftContract;     // NFT contract address
    uint256 tokenId;         // Token ID
    address managerContract; // Manager contract address
    address firstOwner;      // First owner address
    bool isActive;          // Is NFT active
    uint256 createdAt;      // Creation timestamp
    string metadataURI;      // Metadata URI
}
```

#### `getNFTIndexByManager(address _managerContract)`
Returns NFT information by manager contract address.

**Parameters:**
- `_managerContract` (address): Manager contract address

**Returns:**
- `NFTIndex`: NFT information struct

#### `getActiveNFTIndices()`
Returns all active NFT indices.

**Returns:**
- `NFTIndex[]`: Array of active NFT indices

**Frontend Usage:**
```javascript
const activeNFTs = await registryContract.getActiveNFTIndices();
activeNFTs.forEach(nft => {
    console.log(`Active NFT: ${nft.nftContract} token ${nft.tokenId}`);
});
```

#### `getNFTIndicesByOwner(address _owner)`
Returns NFTs owned by a specific address.

**Parameters:**
- `_owner` (address): Owner address

**Returns:**
- `NFTIndex[]`: Array of NFT indices

#### `getNFTIndicesByShareholder(address _shareholder)`
Returns NFTs where an address has shares.

**Parameters:**
- `_shareholder` (address): Shareholder address

**Returns:**
- `NFTIndex[]`: Array of NFT indices

#### `getManagerContract(address _nftContract, uint256 _tokenId)`
Returns the manager contract for a specific NFT.

**Parameters:**
- `_nftContract` (address): NFT contract address
- `_tokenId` (uint256): Token ID

**Returns:**
- `address`: Manager contract address

#### `isNFTShared(address _nftContract, uint256 _tokenId)`
Checks if an NFT is shared.

**Parameters:**
- `_nftContract` (address): NFT contract address
- `_tokenId` (uint256): Token ID

**Returns:**
- `bool`: True if NFT is shared

#### `getRecentNFTIndices(uint256 _count)`
Returns the most recent NFT indices.

**Parameters:**
- `_count` (uint256): Number of recent NFTs to return

**Returns:**
- `NFTIndex[]`: Array of recent NFT indices

### Events

#### `NFTRegistered`
Emitted when an NFT is registered in the registry.

```solidity
event NFTRegistered(
    address indexed nftContract,
    uint256 indexed tokenId,
    address indexed managerContract,
    address firstOwner,
    string metadataURI
);
```

#### `NFTPurchased`
Emitted when a purchase is recorded in the registry.

```solidity
event NFTPurchased(
    address indexed managerContract,
    address indexed buyer,
    uint256 percentage
);
```

#### `NFTDeactivated`
Emitted when an NFT is deactivated.

```solidity
event NFTDeactivated(
    address indexed managerContract,
    address indexed nftContract,
    uint256 indexed tokenId
);
```

---

## NFTShares Contract API

### Query Functions

#### `name()`
Returns the token name.

**Returns:**
- `string`: Token name ("NFT Shares")

#### `symbol()`
Returns the token symbol.

**Returns:**
- `string`: Token symbol ("NFTS")

#### `totalSupply()`
Returns the total supply of shares.

**Returns:**
- `uint256`: Total supply (1000 * 10^18)

#### `decimals()`
Returns the number of decimals.

**Returns:**
- `uint8`: Number of decimals (18)

#### `balanceOf(address account)`
Returns the balance of shares for an account.

**Parameters:**
- `account` (address): Account address

**Returns:**
- `uint256`: Share balance

#### `getPercentageOwnership(address account)`
Returns the percentage ownership for an account.

**Parameters:**
- `account` (address): Account address

**Returns:**
- `uint256`: Ownership percentage (0-100)

**Frontend Usage:**
```javascript
const percentage = await sharesContract.getPercentageOwnership(userAddress);
console.log(`User owns ${percentage}% of the NFT`);
```

#### `getSharesForPercentage(uint256 percentage)`
Returns the number of shares for a given percentage.

**Parameters:**
- `percentage` (uint256): Percentage (1-100)

**Returns:**
- `uint256`: Number of shares

#### `getPercentageForShares(uint256 shares)`
Returns the percentage for a given number of shares.

**Parameters:**
- `shares` (uint256): Number of shares

**Returns:**
- `uint256`: Percentage

---

## Frontend Integration Examples

### React Hooks

#### Custom Hook for NFT Data
```javascript
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const useNFTData = (managerAddress, provider) => {
    const [nftInfo, setNftInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNFTData = async () => {
            try {
                setLoading(true);
                const contract = new ethers.Contract(managerAddress, ManagerABI, provider);
                const info = await contract.getNFTInfo();
                
                setNftInfo({
                    nftContract: info[0],
                    tokenId: info[1].toString(),
                    firstOwner: info[2],
                    price: ethers.formatEther(info[3]),
                    maxSellable: info[4].toString(),
                    totalSold: info[5].toString()
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (managerAddress && provider) {
            fetchNFTData();
        }
    }, [managerAddress, provider]);

    return { nftInfo, loading, error };
};
```

#### Custom Hook for Registry Data
```javascript
const useRegistryData = (registryAddress, provider) => {
    const [activeNFTs, setActiveNFTs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActiveNFTs = async () => {
            try {
                const contract = new ethers.Contract(registryAddress, RegistryABI, provider);
                const nfts = await contract.getActiveNFTIndices();
                
                const formattedNFTs = nfts.map(nft => ({
                    nftContract: nft.nftContract,
                    tokenId: nft.tokenId.toString(),
                    managerContract: nft.managerContract,
                    firstOwner: nft.firstOwner,
                    isActive: nft.isActive,
                    createdAt: new Date(Number(nft.createdAt) * 1000),
                    metadataURI: nft.metadataURI
                }));
                
                setActiveNFTs(formattedNFTs);
            } catch (error) {
                console.error('Error fetching active NFTs:', error);
            } finally {
                setLoading(false);
            }
        };

        if (registryAddress && provider) {
            fetchActiveNFTs();
        }
    }, [registryAddress, provider]);

    return { activeNFTs, loading };
};
```

### Event Listening

#### Real-time Updates
```javascript
const setupEventListeners = (managerContract, registryContract) => {
    // Listen for purchases
    managerContract.on("NFTPurchased", (managerContract, buyer, percentage, cost) => {
        console.log(`Purchase: ${buyer} bought ${percentage}% for ${ethers.formatEther(cost)} ETH`);
        // Update UI here
    });

    // Listen for price updates
    managerContract.on("PriceUpdated", (managerContract, oldPrice, newPrice) => {
        console.log(`Price updated: ${ethers.formatEther(oldPrice)} → ${ethers.formatEther(newPrice)} ETH`);
        // Update UI here
    });

    // Listen for new registrations
    registryContract.on("NFTRegistered", (nftContract, tokenId, managerContract, firstOwner, metadataURI) => {
        console.log(`New NFT registered: ${nftContract} token ${tokenId}`);
        // Update UI here
    });
};
```

#### Event Filtering
```javascript
const getPurchaseHistory = async (managerContract, buyerAddress, fromBlock, toBlock) => {
    const filter = managerContract.filters.NFTPurchased(null, buyerAddress);
    const events = await managerContract.queryFilter(filter, fromBlock, toBlock);
    
    return events.map(event => ({
        buyer: event.args.buyer,
        percentage: event.args.percentage.toString(),
        cost: ethers.formatEther(event.args.cost),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash
    }));
};
```

### Utility Functions

#### Number Formatting
```javascript
// Format ETH values
const formatETH = (weiValue) => {
    return ethers.formatEther(weiValue);
};

// Format percentage
const formatPercentage = (value) => {
    return `${value}%`;
};

// Format shares
const formatShares = (shares, decimals = 18) => {
    return ethers.formatUnits(shares, decimals);
};
```

#### Contract Initialization
```javascript
const initializeContracts = async (provider, addresses) => {
    const managerContract = new ethers.Contract(
        addresses.Manager, 
        ManagerABI, 
        provider
    );
    
    const registryContract = new ethers.Contract(
        addresses.NFTRegistry, 
        RegistryABI, 
        provider
    );
    
    const sharesContract = new ethers.Contract(
        addresses.NFTShares, 
        SharesABI, 
        provider
    );
    
    return { managerContract, registryContract, sharesContract };
};
```

---

## Error Handling

### Common Error Patterns
```javascript
const safeContractCall = async (contractFunction, ...args) => {
    try {
        const result = await contractFunction(...args);
        return { success: true, data: result };
    } catch (error) {
        console.error('Contract call failed:', error);
        return { success: false, error: error.message };
    }
};
```

### Network Error Handling
```javascript
const handleNetworkErrors = (error) => {
    if (error.code === 'NETWORK_ERROR') {
        return 'Network connection failed. Please check your internet connection.';
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
        return 'Insufficient funds for this transaction.';
    } else if (error.code === 'USER_REJECTED') {
        return 'Transaction was rejected by user.';
    } else {
        return 'An unexpected error occurred.';
    }
};
```

---

## Best Practices

1. **Always handle loading states** - Show loading indicators during contract calls
2. **Implement proper error handling** - Catch and display meaningful error messages
3. **Use proper number formatting** - Always format wei values to ETH for display
4. **Listen for events** - Use events for real-time UI updates
5. **Cache contract instances** - Avoid repeated contract initialization
6. **Handle network changes** - Update UI when user switches networks
7. **Implement TypeScript** - Use proper types for better development experience
8. **Test thoroughly** - Test all contract interactions before production

---

## Testing

Use the provided `fetchTest.js` script to test all contract functions:

```bash
node fetchTest.js
```

This script demonstrates all available queries and provides examples for frontend integration.
