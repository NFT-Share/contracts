# NFT Fractionalization Dashboard

A simple React frontend to display all data from the Manager contract including query functions and events.

## Features

- 📋 **NFT Information**: Contract address, token ID, price, ownership details
- 🔍 **Contract Status**: NFT transfer status, ownership verification
- 👥 **Ownership Breakdown**: Current ownership percentages and available for sale
- 🏠 **All Owners**: Complete list of all owners and their percentages
- 📡 **Real-time Events**: Live event monitoring with transaction details
- 💰 **Cost Calculator**: Calculate costs for percentage purchases
- 🔗 **Wallet Integration**: Connect MetaMask for transactions (optional)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Update configuration:**
   - Replace `YOUR_INFURA_PROJECT_ID` in `src/App.jsx` with your actual Infura project ID
   - Or use any other Sepolia RPC URL

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - The app will open automatically at `http://localhost:3000`

## Contract Configuration

The frontend is configured to connect to:
- **Contract Address**: `0x1006615695b1433f0c29f37CDBBb0C119D9B4B68`
- **Network**: Sepolia Testnet
- **RPC**: Infura Sepolia endpoint

## Usage

### Read-Only Mode
- The app works in read-only mode without wallet connection
- Shows all contract data and events
- Perfect for monitoring and verification

### Wallet Connection
- Connect MetaMask for full functionality
- Switch to Sepolia testnet
- Make transactions (buy percentages, update settings)

## Data Displayed

### NFT Information
- Contract address and token ID
- First owner address
- Current price in ETH
- Maximum sellable percentage
- Total percentage sold

### Contract Status
- Whether NFT is in contract custody
- NFT transfer flag status
- Current NFT owner
- Contract ETH balance

### Ownership Details
- First owner percentage
- Total sold percentage
- Available for sale percentage
- Complete owner list with percentages

### Events
- Real-time event monitoring
- Transaction hashes
- Event arguments
- Timestamps

## Troubleshooting

### Connection Issues
- Ensure you're on Sepolia testnet
- Check RPC URL configuration
- Verify contract address is correct

### No Data Displayed
- Contract may not be deployed
- Check network connection
- Verify contract ABI matches deployed contract

### Wallet Connection Failed
- Install MetaMask extension
- Switch to Sepolia testnet
- Ensure account has Sepolia ETH for gas

## Development

- Built with React + Vite
- Uses ethers.js for blockchain interaction
- Responsive design for mobile and desktop
- Real-time event listening
- Error handling and loading states
