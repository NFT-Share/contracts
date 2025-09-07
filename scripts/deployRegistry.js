const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying NFT Registry...");

  // Get the contract factory
  const NFTRegistry = await ethers.getContractFactory("NFTRegistry");

  // Deploy the contract
  const registry = await NFTRegistry.deploy();

  // Wait for deployment to complete
  await registry.waitForDeployment();

  const registryAddress = await registry.getAddress();
  console.log("NFT Registry deployed to:", registryAddress);

  // Save the deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: "testnet",
    contract: "NFTRegistry",
    address: registryAddress,
    deployer: await registry.runner.getAddress(),
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  // Create deployments directory if it doesn't exist
  if (!fs.existsSync('./deployments')) {
    fs.mkdirSync('./deployments');
  }

  // Save deployment info
  fs.writeFileSync(
    './deployments/NFTRegistry.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to ./deployments/NFTRegistry.json");
  console.log("Registry is ready to track shared NFTs!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
