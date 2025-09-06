const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Deploying Manager contract...");

  // Get parameters from environment variables or use defaults
  const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"; // Set your NFT contract address
  const TOKEN_ID = process.env.TOKEN_ID || 1; // Set your NFT token ID
  const NFT_PRICE= hre.ethers.parseEther("0.0001");  // Set NFT price in ETH
  const MAX_SELLABLE_PERCENTAGE = parseInt(process.env.MAX_SELLABLE_PERCENTAGE || "80"); // Set max sellable percentage

  console.log("Deployment parameters:");
  console.log("- NFT Contract:", NFT_CONTRACT_ADDRESS);
  console.log("- Token ID:", TOKEN_ID);
  console.log("- Price:", hre.ethers.formatEther(NFT_PRICE), "ETH");
  console.log("- Max Sellable:", MAX_SELLABLE_PERCENTAGE + "%");

  // Deploy Manager contract (which will deploy NFTShares internally)
  console.log("\n=== Deploying Manager Contract ===");
  const Manager = await hre.ethers.getContractFactory("Manager");
  const manager = await Manager.deploy(
    NFT_CONTRACT_ADDRESS,
    TOKEN_ID,
    NFT_PRICE,
    MAX_SELLABLE_PERCENTAGE
  );

  await manager.waitForDeployment();

  const address = await manager.getAddress();
  console.log("Manager contract deployed to:", address);

  // Transfer NFT to contract (if NFT contract address is valid)
  if (NFT_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
    console.log("\n=== Approving and Transferring NFT to Contract ===");
    try {
      // First, approve the Manager contract to transfer the NFT
      console.log("Step 1: Approving Manager contract to transfer NFT...");
      const nftContract = await hre.ethers.getContractAt("IERC721", NFT_CONTRACT_ADDRESS);
      const [deployer] = await hre.ethers.getSigners();
      
      const approveTx = await nftContract.approve(address, TOKEN_ID);
      await approveTx.wait();
      console.log("✅ NFT approval successful");
      
      // Now transfer the NFT to the contract
      console.log("Step 2: Transferring NFT to Manager contract...");
      const transferTx = await manager.transferNFTToContract();
      await transferTx.wait();
      console.log("✅ NFT successfully transferred to contract");
    } catch (error) {
      console.log("⚠️  NFT transfer failed:", error.message);
      console.log("Note: Make sure you own the NFT and have sufficient gas");
    }
  } else {
    console.log("\n⚠️  Skipping NFT transfer - NFT_CONTRACT_ADDRESS not set");
  }
  
  // Test the deployment
  console.log("\n=== Testing Deployment ===");
  const nftInfo = await manager.getNFTInfo();
  console.log("NFT Info:", {
    contract: nftInfo[0],
    tokenId: nftInfo[1].toString(),
    firstOwner: nftInfo[2],
    price: hre.ethers.formatEther(nftInfo[3]) + " ETH",
    maxSellable: nftInfo[4].toString() + "%",
    totalSold: nftInfo[5].toString() + "%"
  });

  const ownershipBreakdown = await manager.getOwnershipBreakdown();
  console.log("Ownership Breakdown:", {
    firstOwner: ownershipBreakdown[0],
    firstOwnerPercentage: ownershipBreakdown[1].toString() + "%",
    totalSold: ownershipBreakdown[2].toString() + "%",
    remainingAvailable: ownershipBreakdown[3].toString() + "%"
  });

  // Test shares token info
  const sharesTokenAddress = await manager.getSharesTokenAddress();
  console.log("Shares Token Address from Manager:", sharesTokenAddress);
  
  const sharesBalance = await manager.getSharesBalance(nftInfo[2]); // First owner
  console.log("First Owner Shares Balance:", sharesBalance.toString());

  // Contract deployment complete - no verification needed

  console.log("\n=== Deployment Summary ===");
  console.log("Manager Contract:", address);
  console.log("Shares Token Contract:", sharesTokenAddress);
  console.log("First Owner:", nftInfo[2]);
  console.log("Initial Shares Balance:", sharesBalance.toString());
  console.log("NFT Transferred:", await manager.isNFTTransferred());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
