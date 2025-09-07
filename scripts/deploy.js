const hre = require("hardhat");
require("dotenv").config();

/**
 * Deploy NFT Split system with Registry integration
 * This script is designed for Sepolia testnet deployment only
 */
async function main() {
  console.log("Deploying NFT Split system with Registry integration on Sepolia testnet...");

  // Get parameters from environment variables or use defaults
  const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
  const TOKEN_ID = process.env.TOKEN_ID || 1;
  const NFT_PRICE = hre.ethers.parseEther("0.0001");
  const MAX_SELLABLE_PERCENTAGE = parseInt(process.env.MAX_SELLABLE_PERCENTAGE || "80");
  const METADATA_URI = process.env.METADATA_URI || "https://i2.seadn.io/collection/nodes-by-hunter/image_type_preview_media/8049a798f688ef8b56face415f44e0/f58049a798f688ef8b56face415f44e0.gif?w=3840";
  const REGISTRY_ADDRESS = process.env.REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000";

  console.log("Deployment parameters:");
  console.log("- NFT Contract:", NFT_CONTRACT_ADDRESS);
  console.log("- Token ID:", TOKEN_ID);
  console.log("- Price:", hre.ethers.formatEther(NFT_PRICE), "ETH");
  console.log("- Max Sellable:", MAX_SELLABLE_PERCENTAGE + "%");
  console.log("- Metadata URI:", METADATA_URI);
  console.log("- Registry Address:", REGISTRY_ADDRESS);

  // Deploy Manager contract
  console.log("\n=== Deploying Manager Contract ===");
  const Manager = await hre.ethers.getContractFactory("Manager");
  const manager = await Manager.deploy(
    NFT_CONTRACT_ADDRESS,
    TOKEN_ID,
    NFT_PRICE,
    MAX_SELLABLE_PERCENTAGE
  );

  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log("Manager contract deployed to:", managerAddress);

  // Transfer NFT to contract (if NFT contract address is valid)
  if (NFT_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
    console.log("\n=== Approving and Transferring NFT to Contract ===");
    try {
      const nftContract = await hre.ethers.getContractAt("IERC721", NFT_CONTRACT_ADDRESS);
      const [deployer] = await hre.ethers.getSigners();
      
      const approveTx = await nftContract.approve(managerAddress, TOKEN_ID);
      await approveTx.wait();
      console.log("✅ NFT approval successful");
      
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

  // Register NFT in registry (if registry address is valid)
  if (REGISTRY_ADDRESS !== "0x0000000000000000000000000000000000000000") {
    console.log("\n=== Registering NFT in Registry ===");
    try {
      const registry = await hre.ethers.getContractAt("NFTRegistry", REGISTRY_ADDRESS);
      const registerTx = await registry.registerSharedNFT(managerAddress, METADATA_URI);
      await registerTx.wait();
      console.log("✅ NFT successfully registered in registry");
    } catch (error) {
      console.log("⚠️  Registry registration failed:", error.message);
      console.log("Note: Make sure the registry contract is deployed and accessible");
    }
  } else {
    console.log("\n⚠️  Skipping registry registration - REGISTRY_ADDRESS not set");
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

  const sharesTokenAddress = await manager.getSharesTokenAddress();
  console.log("Shares Token Address:", sharesTokenAddress);

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    contracts: {
      Manager: {
        address: managerAddress,
        deployer: (await hre.ethers.getSigners())[0].address,
        nftContract: NFT_CONTRACT_ADDRESS,
        tokenId: TOKEN_ID.toString(),
        nftPrice: NFT_PRICE.toString(),
        maxSellablePercentage: MAX_SELLABLE_PERCENTAGE.toString(),
        metadataURI: METADATA_URI
      },
      NFTShares: {
        address: sharesTokenAddress
      }
    },
    registry: {
      address: REGISTRY_ADDRESS,
      registered: REGISTRY_ADDRESS !== "0x0000000000000000000000000000000000000000"
    }
  };

  // Create deployments directory if it doesn't exist
  if (!fs.existsSync('./deployments')) {
    fs.mkdirSync('./deployments');
  }

  // Save deployment info
  const filename = `./deployments/Manager_${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n=== Deployment Summary ===");
  console.log("Manager Contract:", managerAddress);
  console.log("Shares Token Contract:", sharesTokenAddress);
  console.log("Registry Address:", REGISTRY_ADDRESS);
  console.log("NFT Transferred:", await manager.isNFTTransferred());
  console.log("Deployment info saved to:", filename);

  console.log("\n=== Next Steps ===");
  console.log("1. Update frontend with manager contract address:", managerAddress);
  if (REGISTRY_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.log("2. Deploy registry contract and register this NFT");
  } else {
    console.log("2. NFT is already registered in registry");
  }
  console.log("3. Test the system with the frontend on Sepolia testnet");
  console.log("4. Get Sepolia ETH from faucet: https://sepoliafaucet.com/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
