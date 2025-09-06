// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {NFTShares} from "./NFTShares.sol";
import {NFTRegistry} from "./NFTRegistry.sol";

contract Manager {
    IERC721 public nft;
    uint256 public tokenId;
    NFTShares public sharesToken;

    address public firstNFTOwner; // the original NFT owner
    uint256 public nftPrice; // price of the NFT in wei
    uint256 public maxSellablePercentage; // maximum percentage that can be sold
    bool public nftTransferred; // tracks if NFT has been transferred to contract

    constructor(
        address _nft,
        uint256 _tokenId,
        uint256 _nftPrice,
        uint256 _maxSellablePercentage
    ) {
        nft = IERC721(_nft);
        tokenId = _tokenId;
        nftPrice = _nftPrice;
        maxSellablePercentage = _maxSellablePercentage;

        // Set the first NFT owner
        firstNFTOwner = msg.sender;

        // Deploy the shares token contract with first owner as initial recipient
        sharesToken = new NFTShares(firstNFTOwner);

        // Set the manager address in the shares token
        sharesToken.setManager(address(this));
        nftTransferred = false; // NFT not yet transferred

        // Note: NFT transfer will be done after deployment via transferNFTToContract function
    }

    // receive ETH
    receive() external payable {}

    // Function to transfer NFT to contract (call this after approving the contract)
    function transferNFTToContract() external {
        require(
            msg.sender == firstNFTOwner,
            "Only first owner can transfer NFT"
        );
        require(!nftTransferred, "NFT already transferred to contract");

        nft.transferFrom(firstNFTOwner, address(this), tokenId);
        nftTransferred = true;
    }

    // Update NFT price (only first owner)
    function updatePrice(uint256 _newPrice) external {
        require(
            msg.sender == firstNFTOwner,
            "Only first owner can update price"
        );
        nftPrice = _newPrice;
    }

    // Update maximum sellable percentage (only first owner)
    function updateMaxSellablePercentage(uint256 _newMaxPercentage) external {
        require(
            msg.sender == firstNFTOwner,
            "Only first owner can update max sellable percentage"
        );
        uint256 currentSoldPercentage = getTotalSoldPercentage();
        require(
            _newMaxPercentage >= currentSoldPercentage,
            "Cannot set max below already sold amount"
        );
        require(_newMaxPercentage <= 100, "Cannot set max above 100%");
        maxSellablePercentage = _newMaxPercentage;
    }

    // Buy percentage of NFT
    function buyPercentage(
        uint256 _percentage
    ) external payable NFTTransferred {
        require(_percentage > 0 && _percentage <= 100, "Invalid percentage");

        uint256 currentSoldPercentage = getTotalSoldPercentage();
        require(
            currentSoldPercentage + _percentage <= maxSellablePercentage,
            "Cannot sell more than max sellable percentage"
        );

        uint256 cost = (nftPrice * _percentage) / 100;
        require(msg.value >= cost, "Insufficient payment");

        // Calculate shares to transfer
        uint256 sharesToTransfer = sharesToken.getSharesForPercentage(
            _percentage
        );

        // Transfer shares from first owner to buyer
        sharesToken.transferFromManager(
            firstNFTOwner,
            msg.sender,
            sharesToTransfer
        );

        // Send payment to first owner
        payable(firstNFTOwner).transfer(cost);

        // Refund excess payment
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
    }

    // Query functions
    function getNFTInfo()
        external
        view
        returns (
            address nftContract,
            uint256 id,
            address owner,
            uint256 price,
            uint256 maxSellable,
            uint256 totalSold
        )
    {
        return (
            address(nft),
            tokenId,
            firstNFTOwner,
            nftPrice,
            maxSellablePercentage,
            getTotalSoldPercentage()
        );
    }

    function getOwnershipPercentage(
        address _owner
    ) external view returns (uint256) {
        return sharesToken.getPercentageOwnership(_owner);
    }

    function getRemainingOwnership() external view returns (uint256) {
        return sharesToken.getPercentageOwnership(firstNFTOwner);
    }

    function getAvailableForSale() external view returns (uint256) {
        return maxSellablePercentage - getTotalSoldPercentage();
    }

    function getTotalSoldPercentage() public view returns (uint256) {
        uint256 firstOwnerPercentage = sharesToken.getPercentageOwnership(
            firstNFTOwner
        );
        return 100 - firstOwnerPercentage;
    }

    function calculateCost(
        uint256 _percentage
    ) external view returns (uint256) {
        return (nftPrice * _percentage) / 100;
    }

    function isOwner(address _address) external view returns (bool) {
        return sharesToken.balanceOf(_address) > 0;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function canBuyPercentage(
        uint256 _percentage
    ) external view returns (bool) {
        uint256 currentSoldPercentage = getTotalSoldPercentage();
        return
            _percentage > 0 &&
            _percentage <= 100 &&
            currentSoldPercentage + _percentage <= maxSellablePercentage;
    }

    function isNFTTransferred() external view returns (bool) {
        return nftTransferred;
    }

    function getContractStatus()
        external
        view
        returns (
            bool nftInContract,
            bool nftTransferredFlag,
            address currentNFTOwner
        )
    {
        try nft.ownerOf(tokenId) returns (address owner) {
            return (owner == address(this), nftTransferred, owner);
        } catch {
            return (false, nftTransferred, address(0));
        }
    }

    function getAllOwners()
        external
        view
        returns (address[] memory ownerAddresses, uint256[] memory percentages)
    {
        // This function is now simplified - it only returns the first owner
        // For a complete list, you would need to track transfers in the ERC20 token
        // or use events to build the owner list off-chain
        ownerAddresses = new address[](1);
        percentages = new uint256[](1);

        ownerAddresses[0] = firstNFTOwner;
        percentages[0] = sharesToken.getPercentageOwnership(firstNFTOwner);

        return (ownerAddresses, percentages);
    }

    function getOwnershipBreakdown()
        external
        view
        returns (
            address firstOwner,
            uint256 firstOwnerPercentage,
            uint256 totalSold,
            uint256 remainingAvailable
        )
    {
        uint256 firstOwnerPct = sharesToken.getPercentageOwnership(
            firstNFTOwner
        );
        uint256 totalSoldPct = getTotalSoldPercentage();

        return (
            firstNFTOwner,
            firstOwnerPct,
            totalSoldPct,
            maxSellablePercentage - totalSoldPct
        );
    }

    // Get shares token address
    function getSharesTokenAddress() external view returns (address) {
        return address(sharesToken);
    }

    // Get shares balance for an address
    function getSharesBalance(address account) external view returns (uint256) {
        return sharesToken.balanceOf(account);
    }

    // Get shares for a percentage
    function getSharesForPercentage(
        uint256 percentage
    ) external view returns (uint256) {
        return sharesToken.getSharesForPercentage(percentage);
    }

    modifier NFTTransferred() {
        require(nftTransferred, "NFT not transferred to contract");
        _;
    }
}
