# NFT Buy Script Usage

## Overview
The `buyNFT.js` script allows you to purchase a percentage of an NFT that has been registered and deployed in the NFT Split system.

## Prerequisites

1. **Environment Setup**: Create a `.env` file in the project root with:
   ```
   TESTNET_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/aQ_zjf5PpA0kHbAPKeSd9
   BUYER_PRIVATE_KEY=your_buyer_private_key_here
   ```

2. **Sepolia ETH**: Ensure your buyer address has sufficient Sepolia ETH for the purchase
   - Get testnet ETH from: https://sepoliafaucet.com/

3. **Deployed Contracts**: The NFT must be:
   - Registered in the NFTRegistry
   - Transferred to the Manager contract
   - Available for purchase (within max sellable percentage)

## Current Deployment Info

Based on the latest deployment:
- **Manager Contract**: `0x9eB4C5E5a8f4891afDeCe633aA1d63906802C820`
- **NFT Contract**: `0x018394653bCB2e06886fdA8EbCF297F93307c285`
- **Token ID**: `4`
- **NFT Price**: `0.0001 ETH`
- **Max Sellable**: `80%`

## Usage

### Buy 20% of the NFT
```bash
# Set your buyer private key
export BUYER_PRIVATE_KEY="your_private_key_here"

# Run the buy script
npx hardhat run scripts/buyNFT.js --network testnet
```

### What the Script Does

1. **Validates Setup**: Checks buyer balance, contract status, and purchase feasibility
2. **Calculates Cost**: Determines the exact ETH cost for 20% purchase (0.00002 ETH)
3. **Executes Purchase**: Calls `buyPercentage(20)` on the Manager contract
4. **Records Purchase**: Updates the registry with the new shareholder
5. **Verifies Results**: Confirms the purchase and shows updated ownership

### Expected Output

```
🛒 Starting NFT Share Purchase...
📋 Purchase Parameters:
- Manager Contract: 0x9eB4C5E5a8f4891afDeCe633aA1d63906802C820
- Percentage to Buy: 20%
- Registry: 0x74d24760573516672b93d3B252407DB66Ec6b445

👤 Buyer Address: 0x...
💰 Buyer Balance: 0.1 ETH

📊 NFT Information:
- NFT Contract: 0x018394653bCB2e06886fdA8EbCF297F93307c285
- Token ID: 4
- First Owner: 0x355bC79D9D58d9cfb9abEda3aa8A25e7A87b809d
- NFT Price: 0.0001 ETH
- Max Sellable: 80%
- Total Sold: 0%
- NFT Transferred to Contract: true

💵 Purchase Cost: 0.00002 ETH
- Can Buy 20%: true

📈 Current Ownership Breakdown:
- First Owner: 0x355bC79D9D58d9cfb9abEda3aa8A25e7A87b809d
- First Owner %: 100%
- Total Sold %: 0%
- Remaining Available %: 80%
- Buyer Current Ownership: 0%

🔄 Executing Purchase...
📝 Transaction Hash: 0x...
✅ Transaction confirmed!
✅ Purchase recorded in registry

🔍 Verifying Purchase:
- Buyer New Ownership: 20%
- Updated Total Sold %: 20%
- Updated Remaining Available %: 60%
- Buyer Shares Balance: 200000000000000000000
- Is Buyer Owner: true

🎉 Purchase Successful!
✅ Successfully purchased 20% of the NFT for 0.00002 ETH
📊 Buyer now owns 20% of the NFT
```

## Troubleshooting

### Common Issues

1. **"BUYER_PRIVATE_KEY environment variable is required"**
   - Set the environment variable: `export BUYER_PRIVATE_KEY="your_key"`

2. **"Insufficient balance"**
   - Get more Sepolia ETH from faucet: https://sepoliafaucet.com/

3. **"NFT not transferred to contract"**
   - The NFT owner needs to call `transferNFTToContract()` first

4. **"Cannot sell more than max sellable percentage"**
   - The requested percentage exceeds the maximum sellable amount (currently 80%)

### Gas Issues

If you encounter gas-related errors, the script sets a gas limit of 500,000. You can modify this in the script if needed.

## Security Notes

- **Never commit private keys to version control**
- **Only use testnet private keys for testing**
- **Verify contract addresses before making purchases**
- **Double-check the percentage and cost before confirming**

## Next Steps

After a successful purchase:
1. The buyer becomes a shareholder in the NFT
2. They can view their ownership percentage
3. They receive NFT shares tokens representing their ownership
4. The purchase is recorded in the registry for tracking
