import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'

// Contract configuration
const MANAGER_CONTRACT_ADDRESS = "0x7d61Ba0C83ee5EfE3F8Fe6AEc7e98333ec1D5D25"
const SEPOLIA_RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/aQ_zjf5PpA0kHbAPKeSd9" // You'll need to replace this

// Complete Manager Contract ABI with all query functions
const MANAGER_ABI = [
  // Core NFT Information
  "function getNFTInfo() external view returns (address nftContract, uint256 id, address owner, uint256 price, uint256 maxSellable, uint256 totalSold)",
  "function getContractStatus() external view returns (bool nftInContract, bool nftTransferredFlag, address currentNFTOwner)",
  "function isNFTTransferred() external view returns (bool)",

  // Ownership & Shares
  "function getOwnershipPercentage(address _owner) external view returns (uint256)",
  "function getRemainingOwnership() external view returns (uint256)",
  "function getTotalSoldPercentage() external view returns (uint256)",
  "function getAvailableForSale() external view returns (uint256)",
  "function getOwnershipBreakdown() external view returns (address firstOwner, uint256 firstOwnerPercentage, uint256 totalSold, uint256 remainingAvailable)",
  "function getAllOwners() external view returns (address[] memory ownerAddresses, uint256[] memory percentages)",

  // Shares Token Functions
  "function getSharesTokenAddress() external view returns (address)",
  "function getSharesBalance(address account) external view returns (uint256)",
  "function getSharesForPercentage(uint256 percentage) external view returns (uint256)",

  // Purchase & Cost Calculations
  "function calculateCost(uint256 _percentage) external view returns (uint256)",
  "function canBuyPercentage(uint256 _percentage) external view returns (bool)",
  "function isOwner(address _address) external view returns (bool)",

  // Contract State
  "function getContractBalance() external view returns (uint256)",

  // Write functions (for future use)
  "function buyPercentage(uint256 _percentage) external payable",
  "function transferNFTToContract() external",
  "function updatePrice(uint256 _newPrice) external",
  "function updateMaxSellablePercentage(uint256 _newMaxPercentage) external"
]

// ERC20 ABI for the shares token
const ERC20_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
]

function App() {
  const [contract, setContract] = useState(null)
  const [contractData, setContractData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userAddress, setUserAddress] = useState('')
  const [testPercentage, setTestPercentage] = useState(10)
  const [testAddress, setTestAddress] = useState('')

  // Initialize contract (read-only only)
  useEffect(() => {
    const init = async () => {
      try {
        // Use public RPC for read-only access
        const publicProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)

        // Create contract instance (read-only)
        const contractInstance = new ethers.Contract(MANAGER_CONTRACT_ADDRESS, MANAGER_ABI, publicProvider)
        setContract(contractInstance)
      } catch (err) {
        console.error('Error initializing:', err)
        setError('Failed to connect to blockchain. Please check your network connection.')
      }
    }

    init()
  }, [])

  // Load contract data
  useEffect(() => {
    const loadData = async () => {
      if (!contract) return

      try {
        setLoading(true)

        // Load all contract data using all available query functions
        const [
          nftInfo,
          contractStatus,
          nftTransferred,
          ownershipBreakdown,
          allOwners,
          availableForSale,
          contractBalance,
          sharesTokenAddress,
          remainingOwnership,
          totalSoldPercentage
        ] = await Promise.all([
          contract.getNFTInfo(),
          contract.getContractStatus(),
          contract.isNFTTransferred(),
          contract.getOwnershipBreakdown(),
          contract.getAllOwners(),
          contract.getAvailableForSale(),
          contract.getContractBalance(),
          contract.getSharesTokenAddress(),
          contract.getRemainingOwnership(),
          contract.getTotalSoldPercentage()
        ])

        // Load shares token information
        let sharesTokenInfo = {}
        try {
          const publicProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)
          const sharesContract = new ethers.Contract(sharesTokenAddress, ERC20_ABI, publicProvider)

          const [name, symbol, decimals, totalSupply] = await Promise.all([
            sharesContract.name(),
            sharesContract.symbol(),
            sharesContract.decimals(),
            sharesContract.totalSupply()
          ])

          sharesTokenInfo = {
            address: sharesTokenAddress,
            name,
            symbol,
            decimals: decimals.toString(),
            totalSupply: ethers.formatUnits(totalSupply, decimals)
          }
        } catch (err) {
          console.log("Could not load shares token info:", err.message)
          sharesTokenInfo = {
            address: sharesTokenAddress,
            name: "Unknown",
            symbol: "Unknown",
            decimals: "0",
            totalSupply: "0"
          }
        }

        setContractData({
          nftInfo: {
            contract: nftInfo[0],
            tokenId: nftInfo[1].toString(),
            firstOwner: nftInfo[2],
            price: ethers.formatEther(nftInfo[3]),
            maxSellable: nftInfo[4].toString(),
            totalSold: nftInfo[5].toString()
          },
          contractStatus: {
            nftInContract: contractStatus[0],
            nftTransferredFlag: contractStatus[1],
            currentNFTOwner: contractStatus[2]
          },
          nftTransferred,
          ownershipBreakdown: {
            firstOwner: ownershipBreakdown[0],
            firstOwnerPercentage: ownershipBreakdown[1].toString(),
            totalSold: ownershipBreakdown[2].toString(),
            remainingAvailable: ownershipBreakdown[3].toString()
          },
          allOwners: {
            addresses: allOwners[0],
            percentages: allOwners[1].map(p => p.toString())
          },
          availableForSale: availableForSale.toString(),
          contractBalance: ethers.formatEther(contractBalance),
          sharesToken: sharesTokenInfo,
          remainingOwnership: remainingOwnership.toString(),
          totalSoldPercentage: totalSoldPercentage.toString()
        })

      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load contract data. Contract may not be deployed or accessible.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [contract])

  // Interactive query functions for testing
  const testQueryFunctions = async () => {
    if (!contract || !testAddress) return

    try {
      const [
        ownershipPercentage,
        sharesBalance,
        isOwner,
        costForPercentage,
        canBuyPercentage,
        sharesForPercentage
      ] = await Promise.all([
        contract.getOwnershipPercentage(testAddress),
        contract.getSharesBalance(testAddress),
        contract.isOwner(testAddress),
        contract.calculateCost(testPercentage),
        contract.canBuyPercentage(testPercentage),
        contract.getSharesForPercentage(testPercentage)
      ])

      alert(`Query Results for ${testAddress}:
      
Ownership Percentage: ${ownershipPercentage}%
Shares Balance: ${ethers.formatUnits(sharesBalance, 18)}
Is Owner: ${isOwner ? 'Yes' : 'No'}

For ${testPercentage}%:
Cost: ${ethers.formatEther(costForPercentage)} ETH
Can Buy: ${canBuyPercentage ? 'Yes' : 'No'}
Shares Amount: ${ethers.formatUnits(sharesForPercentage, 18)}`)
    } catch (err) {
      alert(`Error testing query functions: ${err.message}`)
    }
  }

  const refreshData = async () => {
    if (!contract) return
    setLoading(true)
    // Trigger data reload
    const loadData = async () => {
      try {
        const [
          nftInfo,
          contractStatus,
          nftTransferred,
          ownershipBreakdown,
          allOwners,
          availableForSale,
          contractBalance,
          sharesTokenAddress,
          remainingOwnership,
          totalSoldPercentage
        ] = await Promise.all([
          contract.getNFTInfo(),
          contract.getContractStatus(),
          contract.isNFTTransferred(),
          contract.getOwnershipBreakdown(),
          contract.getAllOwners(),
          contract.getAvailableForSale(),
          contract.getContractBalance(),
          contract.getSharesTokenAddress(),
          contract.getRemainingOwnership(),
          contract.getTotalSoldPercentage()
        ])

        // Load shares token information
        let sharesTokenInfo = {}
        try {
          const publicProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)
          const sharesContract = new ethers.Contract(sharesTokenAddress, ERC20_ABI, publicProvider)

          const [name, symbol, decimals, totalSupply] = await Promise.all([
            sharesContract.name(),
            sharesContract.symbol(),
            sharesContract.decimals(),
            sharesContract.totalSupply()
          ])

          sharesTokenInfo = {
            address: sharesTokenAddress,
            name,
            symbol,
            decimals: decimals.toString(),
            totalSupply: ethers.formatUnits(totalSupply, decimals)
          }
        } catch (err) {
          console.log("Could not load shares token info:", err.message)
          sharesTokenInfo = {
            address: sharesTokenAddress,
            name: "Unknown",
            symbol: "Unknown",
            decimals: "0",
            totalSupply: "0"
          }
        }

        setContractData({
          nftInfo: {
            contract: nftInfo[0],
            tokenId: nftInfo[1].toString(),
            firstOwner: nftInfo[2],
            price: ethers.formatEther(nftInfo[3]),
            maxSellable: nftInfo[4].toString(),
            totalSold: nftInfo[5].toString()
          },
          contractStatus: {
            nftInContract: contractStatus[0],
            nftTransferredFlag: contractStatus[1],
            currentNFTOwner: contractStatus[2]
          },
          nftTransferred,
          ownershipBreakdown: {
            firstOwner: ownershipBreakdown[0],
            firstOwnerPercentage: ownershipBreakdown[1].toString(),
            totalSold: ownershipBreakdown[2].toString(),
            remainingAvailable: ownershipBreakdown[3].toString()
          },
          allOwners: {
            addresses: allOwners[0],
            percentages: allOwners[1].map(p => p.toString())
          },
          availableForSale: availableForSale.toString(),
          contractBalance: ethers.formatEther(contractBalance),
          sharesToken: sharesTokenInfo,
          remainingOwnership: remainingOwnership.toString(),
          totalSoldPercentage: totalSoldPercentage.toString()
        })
      } catch (err) {
        console.error('Error refreshing data:', err)
        setError('Failed to refresh contract data.')
      } finally {
        setLoading(false)
      }
    }
    await loadData()
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <h2>Loading contract data...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <p>Make sure you're connected to Sepolia testnet and the contract is deployed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🎨 NFT Fractionalization Dashboard</h1>
        <div className="account-info">
          <span>📖 Read-only mode - All Query Functions</span>
          <button onClick={refreshData} className="refresh-btn">🔄 Refresh Data</button>
        </div>
      </header>

      {/* Interactive Query Testing Section */}
      <div className="card query-tester">
        <h2>🧪 Query Function Tester</h2>
        <div className="query-controls">
          <div className="input-group">
            <label>Test Address:</label>
            <input
              type="text"
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value)}
              placeholder="0x..."
              className="address-input"
            />
          </div>
          <div className="input-group">
            <label>Test Percentage:</label>
            <input
              type="number"
              value={testPercentage}
              onChange={(e) => setTestPercentage(Number(e.target.value))}
              min="1"
              max="100"
              className="percentage-input"
            />
            <span>%</span>
          </div>
          <button
            onClick={testQueryFunctions}
            disabled={!testAddress || !contract}
            className="test-btn"
          >
            🚀 Test Query Functions
          </button>
        </div>
      </div>

      <div className="dashboard">
        {/* NFT Information */}
        <div className="card">
          <h2>📋 NFT Information</h2>
          <div className="data-grid">
            <div className="data-item">
              <label>Contract Address:</label>
              <span className="address">{contractData.nftInfo?.contract}</span>
            </div>
            <div className="data-item">
              <label>Token ID:</label>
              <span>{contractData.nftInfo?.tokenId}</span>
            </div>
            <div className="data-item">
              <label>First Owner:</label>
              <span className="address">{contractData.nftInfo?.firstOwner}</span>
            </div>
            <div className="data-item">
              <label>Price:</label>
              <span>{contractData.nftInfo?.price} ETH</span>
            </div>
            <div className="data-item">
              <label>Max Sellable:</label>
              <span>{contractData.nftInfo?.maxSellable}%</span>
            </div>
            <div className="data-item">
              <label>Total Sold:</label>
              <span>{contractData.nftInfo?.totalSold}%</span>
            </div>
          </div>
        </div>

        {/* Shares Token Information */}
        <div className="card">
          <h2>🪙 Shares Token Information</h2>
          <div className="data-grid">
            <div className="data-item">
              <label>Token Name:</label>
              <span>{contractData.sharesToken?.name}</span>
            </div>
            <div className="data-item">
              <label>Token Symbol:</label>
              <span>{contractData.sharesToken?.symbol}</span>
            </div>
            <div className="data-item">
              <label>Token Address:</label>
              <span className="address">{contractData.sharesToken?.address}</span>
            </div>
            <div className="data-item">
              <label>Total Supply:</label>
              <span>{contractData.sharesToken?.totalSupply}</span>
            </div>
            <div className="data-item">
              <label>Decimals:</label>
              <span>{contractData.sharesToken?.decimals}</span>
            </div>
          </div>
        </div>

        {/* Contract Status */}
        <div className="card">
          <h2>🔍 Contract Status</h2>
          <div className="data-grid">
            <div className="data-item">
              <label>NFT in Contract:</label>
              <span className={contractData.contractStatus?.nftInContract ? 'status-success' : 'status-error'}>
                {contractData.contractStatus?.nftInContract ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="data-item">
              <label>NFT Transferred Flag:</label>
              <span className={contractData.nftTransferred ? 'status-success' : 'status-error'}>
                {contractData.nftTransferred ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="data-item">
              <label>Current NFT Owner:</label>
              <span className="address">{contractData.contractStatus?.currentNFTOwner}</span>
            </div>
            <div className="data-item">
              <label>Contract Balance:</label>
              <span>{contractData.contractBalance} ETH</span>
            </div>
          </div>
        </div>

        {/* Additional Query Results */}
        <div className="card">
          <h2>📊 Additional Query Results</h2>
          <div className="data-grid">
            <div className="data-item">
              <label>Remaining Ownership:</label>
              <span>{contractData.remainingOwnership}%</span>
            </div>
            <div className="data-item">
              <label>Total Sold Percentage:</label>
              <span>{contractData.totalSoldPercentage}%</span>
            </div>
            <div className="data-item">
              <label>Available for Sale:</label>
              <span>{contractData.availableForSale}%</span>
            </div>
            <div className="data-item">
              <label>Shares Token Address:</label>
              <span className="address">{contractData.sharesToken?.address}</span>
            </div>
          </div>
        </div>

        {/* Ownership Breakdown */}
        <div className="card">
          <h2>👥 Ownership Breakdown</h2>
          <div className="data-grid">
            <div className="data-item">
              <label>First Owner:</label>
              <span className="address">{contractData.ownershipBreakdown?.firstOwner}</span>
            </div>
            <div className="data-item">
              <label>First Owner %:</label>
              <span>{contractData.ownershipBreakdown?.firstOwnerPercentage}%</span>
            </div>
            <div className="data-item">
              <label>Total Sold:</label>
              <span>{contractData.ownershipBreakdown?.totalSold}%</span>
            </div>
            <div className="data-item">
              <label>Available for Sale:</label>
              <span>{contractData.ownershipBreakdown?.remainingAvailable}%</span>
            </div>
          </div>
        </div>

        {/* All Owners */}
        <div className="card">
          <h2>🏠 All Owners</h2>
          {contractData.allOwners?.addresses?.length > 0 ? (
            <div className="owners-list">
              {contractData.allOwners.addresses.map((address, index) => (
                <div key={index} className="owner-item">
                  <span className="address">{address}</span>
                  <span className="percentage">{contractData.allOwners.percentages[index]}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No owners found</p>
          )}
        </div>

        {/* Contract Summary */}
        <div className="card">
          <h2>📊 Contract Summary</h2>
          <div className="data-grid">
            <div className="data-item">
              <label>Contract Address:</label>
              <span className="address">{MANAGER_CONTRACT_ADDRESS}</span>
            </div>
            <div className="data-item">
              <label>Network:</label>
              <span>Sepolia Testnet</span>
            </div>
            <div className="data-item">
              <label>Mode:</label>
              <span>Read-only (Query only)</span>
            </div>
            <div className="data-item">
              <label>Last Updated:</label>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
