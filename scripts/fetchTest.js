const { ethers } = require("hardhat");
require('dotenv').config();

/**
 * Comprehensive Contract Testing Script
 * Demonstrates all events and queries from Manager, NFTRegistry, and NFTShares contracts
 * 
 * This script serves as a reference for frontend developers to understand:
 * - All available query functions
 * - Event structures and filtering
 * - Contract interactions
 * - Data formatting
 */

// Contract addresses from deployments
const CONTRACT_ADDRESSES = {
    NFTRegistry: "0x74d24760573516672b93d3B252407DB66Ec6b445",
    Manager: "0x68481fe2458F06c3F10Ae6CD7Ef889bA19E19544",
    NFTShares: "0xDA809A7B74229b892471A8Dbe407993c91f810A4",
    NFTContract: "0x018394653bCB2e06886fdA8EbCF297F93307c285"
};

// Test addresses (you can modify these for testing)
const TEST_ADDRESSES = {
    firstOwner: "0x355bC79D9D58d9cfb9abEda3aa8A25e7A87b809d",
    buyer: "0x742d35Cc6634C0532925a3b8D0C0E1C2C5E5C5E5", // Example buyer address
    tokenId: 3
};

async function main() {
    console.log("🚀 Starting Comprehensive Contract Testing...\n");

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log(`📝 Testing with account: ${signer.address}\n`);

    // Initialize contracts
    const managerContract = await ethers.getContractAt("Manager", CONTRACT_ADDRESSES.Manager);
    const registryContract = await ethers.getContractAt("NFTRegistry", CONTRACT_ADDRESSES.NFTRegistry);
    const sharesContract = await ethers.getContractAt("NFTShares", CONTRACT_ADDRESSES.NFTShares);

    console.log("📋 CONTRACT ADDRESSES:");
    console.log(`Manager: ${CONTRACT_ADDRESSES.Manager}`);
    console.log(`NFTRegistry: ${CONTRACT_ADDRESSES.NFTRegistry}`);
    console.log(`NFTShares: ${CONTRACT_ADDRESSES.NFTShares}`);
    console.log(`NFT Contract: ${CONTRACT_ADDRESSES.NFTContract}\n`);

    // ========================================
    // MANAGER CONTRACT QUERIES
    // ========================================
    console.log("🔍 MANAGER CONTRACT QUERIES:");
    console.log("=" .repeat(50));

    try {
        // Basic NFT Information
        console.log("\n📊 Basic NFT Information:");
        const nftInfo = await managerContract.getNFTInfo();
        console.log(`NFT Contract: ${nftInfo[0]}`);
        console.log(`Token ID: ${nftInfo[1]}`);
        console.log(`First Owner: ${nftInfo[2]}`);
        console.log(`NFT Price: ${ethers.formatEther(nftInfo[3])} ETH`);
        console.log(`Max Sellable: ${nftInfo[4]}%`);
        console.log(`Total Sold: ${nftInfo[5]}%`);

        // Ownership Information
        console.log("\n👤 Ownership Information:");
        const firstOwnerPercentage = await managerContract.getOwnershipPercentage(TEST_ADDRESSES.firstOwner);
        const remainingOwnership = await managerContract.getRemainingOwnership();
        const availableForSale = await managerContract.getAvailableForSale();
        
        console.log(`First Owner Percentage: ${firstOwnerPercentage}%`);
        console.log(`Remaining Ownership: ${remainingOwnership}%`);
        console.log(`Available for Sale: ${availableForSale}%`);

        // Financial Information
        console.log("\n💰 Financial Information:");
        const contractBalance = await managerContract.getContractBalance();
        const costFor10Percent = await managerContract.calculateCost(10);
        const costFor25Percent = await managerContract.calculateCost(25);
        
        console.log(`Contract Balance: ${ethers.formatEther(contractBalance)} ETH`);
        console.log(`Cost for 10%: ${ethers.formatEther(costFor10Percent)} ETH`);
        console.log(`Cost for 25%: ${ethers.formatEther(costFor25Percent)} ETH`);

        // Status Checks
        console.log("\n✅ Status Checks:");
        const isOwner = await managerContract.isOwner(TEST_ADDRESSES.firstOwner);
        const canBuy10Percent = await managerContract.canBuyPercentage(10);
        const canBuy50Percent = await managerContract.canBuyPercentage(50);
        const isNFTTransferred = await managerContract.isNFTTransferred();
        
        console.log(`Is First Owner: ${isOwner}`);
        console.log(`Can Buy 10%: ${canBuy10Percent}`);
        console.log(`Can Buy 50%: ${canBuy50Percent}`);
        console.log(`NFT Transferred: ${isNFTTransferred}`);

        // Contract Status
        console.log("\n🔧 Contract Status:");
        const contractStatus = await managerContract.getContractStatus();
        console.log(`NFT In Contract: ${contractStatus[0]}`);
        console.log(`NFT Transferred Flag: ${contractStatus[1]}`);
        console.log(`Current NFT Owner: ${contractStatus[2]}`);

        // Ownership Breakdown
        console.log("\n📈 Ownership Breakdown:");
        const ownershipBreakdown = await managerContract.getOwnershipBreakdown();
        console.log(`First Owner: ${ownershipBreakdown[0]}`);
        console.log(`First Owner %: ${ownershipBreakdown[1]}%`);
        console.log(`Total Sold %: ${ownershipBreakdown[2]}%`);
        console.log(`Remaining Available %: ${ownershipBreakdown[3]}%`);

        // Shares Information
        console.log("\n🎫 Shares Information:");
        const sharesTokenAddress = await managerContract.getSharesTokenAddress();
        const sharesBalance = await managerContract.getSharesBalance(TEST_ADDRESSES.firstOwner);
        const sharesFor10Percent = await managerContract.getSharesForPercentage(10);
        
        console.log(`Shares Token Address: ${sharesTokenAddress}`);
        console.log(`First Owner Shares: ${sharesBalance}`);
        console.log(`Shares for 10%: ${sharesFor10Percent}`);

        // All Owners (simplified version)
        console.log("\n👥 All Owners:");
        const allOwners = await managerContract.getAllOwners();
        console.log(`Owner Addresses: ${allOwners[0]}`);
        console.log(`Owner Percentages: ${allOwners[1]}`);

    } catch (error) {
        console.error("❌ Manager contract query error:", error.message);
    }

    // ========================================
    // NFT REGISTRY CONTRACT QUERIES
    // ========================================
    console.log("\n\n🔍 NFT REGISTRY CONTRACT QUERIES:");
    console.log("=" .repeat(50));

    try {
        // Basic Registry Information
        console.log("\n📊 Registry Statistics:");
        const totalSharedNFTs = await registryContract.getTotalSharedNFTs();
        console.log(`Total Shared NFTs: ${totalSharedNFTs}`);

        // Get NFT Index by Manager
        console.log("\n📋 NFT Index by Manager:");
        const nftIndex = await registryContract.getNFTIndexByManager(CONTRACT_ADDRESSES.Manager);
        console.log(`NFT Contract: ${nftIndex.nftContract}`);
        console.log(`Token ID: ${nftIndex.tokenId}`);
        console.log(`Manager Contract: ${nftIndex.managerContract}`);
        console.log(`First Owner: ${nftIndex.firstOwner}`);
        console.log(`Is Active: ${nftIndex.isActive}`);
        console.log(`Created At: ${new Date(Number(nftIndex.createdAt) * 1000).toISOString()}`);
        console.log(`Metadata URI: ${nftIndex.metadataURI}`);

        // Get Active NFT Indices
        console.log("\n🟢 Active NFT Indices:");
        const activeNFTs = await registryContract.getActiveNFTIndices();
        console.log(`Active NFTs Count: ${activeNFTs.length}`);
        activeNFTs.forEach((nft, index) => {
            console.log(`  ${index + 1}. NFT Contract: ${nft.nftContract}`);
            console.log(`     Token ID: ${nft.tokenId}`);
            console.log(`     Manager: ${nft.managerContract}`);
            console.log(`     Owner: ${nft.firstOwner}`);
            console.log(`     Active: ${nft.isActive}`);
        });

        // Get NFTs by Owner
        console.log("\n👤 NFTs by Owner:");
        const nftsByOwner = await registryContract.getNFTIndicesByOwner(TEST_ADDRESSES.firstOwner);
        console.log(`NFTs owned by ${TEST_ADDRESSES.firstOwner}: ${nftsByOwner.length}`);
        nftsByOwner.forEach((nft, index) => {
            console.log(`  ${index + 1}. Manager: ${nft.managerContract}`);
            console.log(`     Token ID: ${nft.tokenId}`);
            console.log(`     Active: ${nft.isActive}`);
        });

        // Get NFTs by Shareholder
        console.log("\n🎫 NFTs by Shareholder:");
        const nftsByShareholder = await registryContract.getNFTIndicesByShareholder(TEST_ADDRESSES.firstOwner);
        console.log(`NFTs with shares for ${TEST_ADDRESSES.firstOwner}: ${nftsByShareholder.length}`);
        nftsByShareholder.forEach((nft, index) => {
            console.log(`  ${index + 1}. Manager: ${nft.managerContract}`);
            console.log(`     Token ID: ${nft.tokenId}`);
            console.log(`     Active: ${nft.isActive}`);
        });

        // Check if NFT is Shared
        console.log("\n🔍 NFT Sharing Status:");
        const isShared = await registryContract.isNFTShared(CONTRACT_ADDRESSES.NFTContract, TEST_ADDRESSES.tokenId);
        console.log(`Is NFT Shared: ${isShared}`);

        // Get Manager Contract
        console.log("\n🔗 Manager Contract Lookup:");
        const managerContractAddress = await registryContract.getManagerContract(CONTRACT_ADDRESSES.NFTContract, TEST_ADDRESSES.tokenId);
        console.log(`Manager Contract: ${managerContractAddress}`);

        // Get Recent NFT Indices
        console.log("\n🕒 Recent NFT Indices:");
        const recentNFTs = await registryContract.getRecentNFTIndices(5);
        console.log(`Recent NFTs (last 5): ${recentNFTs.length}`);
        recentNFTs.forEach((nft, index) => {
            console.log(`  ${index + 1}. Manager: ${nft.managerContract}`);
            console.log(`     Token ID: ${nft.tokenId}`);
            console.log(`     Created: ${new Date(Number(nft.createdAt) * 1000).toISOString()}`);
        });

    } catch (error) {
        console.error("❌ Registry contract query error:", error.message);
    }

    // ========================================
    // NFT SHARES CONTRACT QUERIES
    // ========================================
    console.log("\n\n🔍 NFT SHARES CONTRACT QUERIES:");
    console.log("=" .repeat(50));

    try {
        // Basic Token Information
        console.log("\n📊 Token Information:");
        const tokenName = await sharesContract.name();
        const tokenSymbol = await sharesContract.symbol();
        const totalSupply = await sharesContract.totalSupply();
        const decimals = await sharesContract.decimals();
        
        console.log(`Token Name: ${tokenName}`);
        console.log(`Token Symbol: ${tokenSymbol}`);
        console.log(`Total Supply: ${ethers.formatUnits(totalSupply, decimals)}`);
        console.log(`Decimals: ${decimals}`);

        // Balance Information
        console.log("\n💰 Balance Information:");
        const firstOwnerBalance = await sharesContract.balanceOf(TEST_ADDRESSES.firstOwner);
        const firstOwnerPercentage = await sharesContract.getPercentageOwnership(TEST_ADDRESSES.firstOwner);
        
        console.log(`First Owner Balance: ${ethers.formatUnits(firstOwnerBalance, decimals)}`);
        console.log(`First Owner Percentage: ${firstOwnerPercentage}%`);

        // Share Calculations
        console.log("\n🧮 Share Calculations:");
        const sharesFor10Percent = await sharesContract.getSharesForPercentage(10);
        const sharesFor25Percent = await sharesContract.getSharesForPercentage(25);
        const percentageForShares = await sharesContract.getPercentageForShares(sharesFor10Percent);
        
        console.log(`Shares for 10%: ${ethers.formatUnits(sharesFor10Percent, decimals)}`);
        console.log(`Shares for 25%: ${ethers.formatUnits(sharesFor25Percent, decimals)}`);
        console.log(`Percentage for ${ethers.formatUnits(sharesFor10Percent, decimals)} shares: ${percentageForShares}%`);

        // Manager Information
        console.log("\n🔧 Manager Information:");
        const managerAddress = await sharesContract.managerContract();
        console.log(`Manager Contract: ${managerAddress}`);

    } catch (error) {
        console.error("❌ Shares contract query error:", error.message);
    }
}

// Error handling
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
