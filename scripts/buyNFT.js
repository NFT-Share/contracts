const hre = require("hardhat");
const CONFIG = require("./config");

/**
 * Buy NFT Shares Script
 * This script allows a buyer to purchase a percentage of an NFT using their private key
 */
async function main() {
  console.log("🛒 Starting NFT Share Purchase...");

  // Get buyer private key from environment
  const BUYER_PRIVATE_KEY = process.env.BUYER_PRIVATE_KEY;
  if (!BUYER_PRIVATE_KEY) {
    throw new Error("❌ BUYER_PRIVATE_KEY environment variable is required");
  }

  // Configuration
  const MANAGER_ADDRESS = CONFIG.CONTRACTS.Manager;
  const PERCENTAGE_TO_BUY = 20; // 20% of the NFT
  const REGISTRY_ADDRESS = CONFIG.CONTRACTS.NFTRegistry;

  console.log("📋 Purchase Parameters:");
  console.log("- Manager Contract:", MANAGER_ADDRESS);
  console.log("- Percentage to Buy:", PERCENTAGE_TO_BUY + "%");
  console.log("- Registry:", REGISTRY_ADDRESS);

  try {
    // Create buyer wallet
    const buyerWallet = new hre.ethers.Wallet(BUYER_PRIVATE_KEY, hre.ethers.provider);
    console.log("\n👤 Buyer Address:", buyerWallet.address);

    // Check buyer balance
    const buyerBalance = await hre.ethers.provider.getBalance(buyerWallet.address);
    console.log("💰 Buyer Balance:", hre.ethers.formatEther(buyerBalance), "ETH");

    // Get contracts
    const manager = await hre.ethers.getContractAt("Manager", MANAGER_ADDRESS);
    const registry = await hre.ethers.getContractAt("NFTRegistry", REGISTRY_ADDRESS);

    // Get NFT info
    console.log("\n📊 NFT Information:");
    const nftInfo = await manager.getNFTInfo();
    console.log("- NFT Contract:", nftInfo[0]);
    console.log("- Token ID:", nftInfo[1].toString());
    console.log("- First Owner:", nftInfo[2]);
    console.log("- NFT Price:", hre.ethers.formatEther(nftInfo[3]), "ETH");
    console.log("- Max Sellable:", nftInfo[4].toString() + "%");
    console.log("- Total Sold:", nftInfo[5].toString() + "%");

    // Check if NFT is transferred to contract
    const nftTransferred = await manager.isNFTTransferred();
    console.log("- NFT Transferred to Contract:", nftTransferred);

    if (!nftTransferred) {
      throw new Error("❌ NFT has not been transferred to the contract yet");
    }

    // Calculate cost for 20% purchase
    const cost = await manager.calculateCost(PERCENTAGE_TO_BUY);
    console.log("\n💵 Purchase Cost:", hre.ethers.formatEther(cost), "ETH");

    // Check if buyer has enough ETH
    if (buyerBalance < cost) {
      throw new Error(`❌ Insufficient balance. Need ${hre.ethers.formatEther(cost)} ETH, have ${hre.ethers.formatEther(buyerBalance)} ETH`);
    }

    // Check if purchase is possible
    const canBuy = await manager.canBuyPercentage(PERCENTAGE_TO_BUY);
    console.log("- Can Buy 20%:", canBuy);

    if (!canBuy) {
      throw new Error("❌ Cannot buy 20% - exceeds maximum sellable percentage or invalid amount");
    }

    // Get current ownership breakdown
    console.log("\n📈 Current Ownership Breakdown:");
    const ownershipBreakdown = await manager.getOwnershipBreakdown();
    console.log("- First Owner:", ownershipBreakdown[0]);
    console.log("- First Owner %:", ownershipBreakdown[1].toString() + "%");
    console.log("- Total Sold %:", ownershipBreakdown[2].toString() + "%");
    console.log("- Remaining Available %:", ownershipBreakdown[3].toString() + "%");

    // Check buyer's current ownership
    const currentOwnership = await manager.getOwnershipPercentage(buyerWallet.address);
    console.log("- Buyer Current Ownership:", currentOwnership.toString() + "%");

    // Execute the purchase
    console.log("\n🔄 Executing Purchase...");
    console.log("⏳ Sending transaction...");
    
    const buyTx = await manager.connect(buyerWallet).buyPercentage(PERCENTAGE_TO_BUY, {
      value: cost,
      gasLimit: 500000 // Set gas limit to prevent out of gas
    });

    console.log("📝 Transaction Hash:", buyTx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await buyTx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("- Block Number:", receipt.blockNumber);
    console.log("- Gas Used:", receipt.gasUsed.toString());

    // Record purchase in registry
    console.log("\n📝 Recording purchase in registry...");
    try {
      const recordTx = await registry.connect(buyerWallet).recordPurchase(MANAGER_ADDRESS, buyerWallet.address);
      await recordTx.wait();
      console.log("✅ Purchase recorded in registry");
    } catch (error) {
      console.log("⚠️  Failed to record in registry:", error.message);
    }

    // Verify the purchase
    console.log("\n🔍 Verifying Purchase:");
    const newOwnership = await manager.getOwnershipPercentage(buyerWallet.address);
    console.log("- Buyer New Ownership:", newOwnership.toString() + "%");

    const updatedBreakdown = await manager.getOwnershipBreakdown();
    console.log("- Updated Total Sold %:", updatedBreakdown[2].toString() + "%");
    console.log("- Updated Remaining Available %:", updatedBreakdown[3].toString() + "%");

    // Get shares balance
    const sharesBalance = await manager.getSharesBalance(buyerWallet.address);
    console.log("- Buyer Shares Balance:", sharesBalance.toString());

    // Check if buyer is now an owner
    const isOwner = await manager.isOwner(buyerWallet.address);
    console.log("- Is Buyer Owner:", isOwner);

    console.log("\n🎉 Purchase Successful!");
    console.log(`✅ Successfully purchased ${PERCENTAGE_TO_BUY}% of the NFT for ${hre.ethers.formatEther(cost)} ETH`);
    console.log(`📊 Buyer now owns ${newOwnership.toString()}% of the NFT`);

    // Display transaction details
    console.log("\n📋 Transaction Details:");
    console.log("- Transaction Hash:", buyTx.hash);
    console.log("- Block Explorer:", `${CONFIG.NETWORK.blockExplorer}tx/${buyTx.hash}`);
    console.log("- Buyer Address:", buyerWallet.address);
    console.log("- Manager Contract:", MANAGER_ADDRESS);

  } catch (error) {
    console.error("❌ Purchase Failed:", error.message);
    
    if (error.message.includes("Insufficient payment")) {
      console.log("💡 Make sure you have enough ETH to cover the purchase cost");
    } else if (error.message.includes("Cannot sell more than max sellable percentage")) {
      console.log("💡 The requested percentage exceeds the maximum sellable amount");
    } else if (error.message.includes("NFT not transferred to contract")) {
      console.log("💡 The NFT owner needs to transfer the NFT to the contract first");
    } else if (error.message.includes("insufficient funds")) {
      console.log("💡 Get more Sepolia ETH from faucet:", CONFIG.FAUCETS[0]);
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
