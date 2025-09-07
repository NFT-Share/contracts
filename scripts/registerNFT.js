const hre = require("hardhat");
const CONFIG = require("./config");

async function main() {
  console.log("🔧 Registering NFT in Registry...");

  // Contract addresses from centralized config
  const REGISTRY_ADDRESS = CONFIG.CONTRACTS.NFTRegistry;
  const MANAGER_ADDRESS = CONFIG.CONTRACTS.Manager;
  const METADATA_URI = CONFIG.DEFAULTS.METADATA_URI;

  console.log("📋 Parameters:");
  console.log("- Registry:", REGISTRY_ADDRESS);
  console.log("- Manager:", MANAGER_ADDRESS);
  console.log("- Metadata:", METADATA_URI);

  try {
    // Get contracts
    const registry = await hre.ethers.getContractAt("NFTRegistry", REGISTRY_ADDRESS);
    const manager = await hre.ethers.getContractAt("Manager", MANAGER_ADDRESS);

    // Check current registry status
    console.log("\n📊 Current Registry Status:");
    const totalNFTs = await registry.getTotalSharedNFTs();
    console.log(`Total Shared NFTs: ${totalNFTs}`);

    // Get NFT info from manager
    const nftInfo = await manager.getNFTInfo();
    console.log("\n📋 NFT Info from Manager:");
    console.log(`NFT Contract: ${nftInfo[0]}`);
    console.log(`Token ID: ${nftInfo[1]}`);
    console.log(`First Owner: ${nftInfo[2]}`);

    // Check if already registered
    console.log("\n🔍 Checking if NFT is already registered...");
    const isRegistered = await registry.isNFTShared(nftInfo[0], nftInfo[1]);
    console.log(`Is NFT Registered: ${isRegistered}`);

    if (isRegistered) {
      console.log("✅ NFT is already registered!");
      const existingManager = await registry.getManagerContract(nftInfo[0], nftInfo[1]);
      console.log(`Manager Contract: ${existingManager}`);
      return;
    }

    // Register the NFT
    console.log("\n📝 Registering NFT in Registry...");
    const registerTx = await registry.registerSharedNFT(MANAGER_ADDRESS, METADATA_URI);
    console.log("⏳ Waiting for transaction confirmation...");
    await registerTx.wait();
    console.log("✅ NFT successfully registered!");

    // Verify registration
    console.log("\n🔍 Verifying Registration:");
    const newTotalNFTs = await registry.getTotalSharedNFTs();
    console.log(`New Total Shared NFTs: ${newTotalNFTs}`);

    const nftIndex = await registry.getNFTIndexByManager(MANAGER_ADDRESS);
    console.log("📋 Registry Entry:");
    console.log(`NFT Contract: ${nftIndex.nftContract}`);
    console.log(`Token ID: ${nftIndex.tokenId}`);
    console.log(`Manager Contract: ${nftIndex.managerContract}`);
    console.log(`First Owner: ${nftIndex.firstOwner}`);
    console.log(`Is Active: ${nftIndex.isActive}`);
    console.log(`Created At: ${new Date(Number(nftIndex.createdAt) * 1000).toISOString()}`);
    console.log(`Metadata URI: ${nftIndex.metadataURI}`);

    console.log("\n🎉 Registration Complete!");
    console.log("The NFT is now properly registered in the registry and should appear in the frontend.");

  } catch (error) {
    console.error("❌ Error:", error.message);
    
    if (error.message.includes("NFT already registered")) {
      console.log("This NFT is already registered in the registry");
    } else if (error.message.includes("execution reverted")) {
      console.log("Transaction failed - check if you have sufficient gas and permissions");
    } else {
      console.log("Check your network connection and try again");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
