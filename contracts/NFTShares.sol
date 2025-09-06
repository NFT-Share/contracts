// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract NFTShares is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1000; // 1000 shares representing 100% ownership
    uint256 public constant DECIMALS = 18; // 18 decimals (ERC20 standard)

    address public managerContract;

    constructor(
        address initialOwner
    ) ERC20("NFT Shares", "NFTS") Ownable(msg.sender) {
        // Mint total supply to the initial owner (first NFT owner)
        _mint(initialOwner, TOTAL_SUPPLY * 10 ** DECIMALS);
    }

    modifier onlyManager() {
        require(
            msg.sender == managerContract,
            "Only manager contract can call this"
        );
        _;
    }

    function setManager(address _manager) external onlyOwner {
        managerContract = _manager;
    }

    function mint(address to, uint256 amount) external onlyManager {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyManager {
        _burn(from, amount);
    }

    function transferFromManager(
        address from,
        address to,
        uint256 amount
    ) external onlyManager {
        _transfer(from, to, amount);
    }

    // Get percentage ownership (out of 100)
    function getPercentageOwnership(
        address account
    ) external view returns (uint256) {
        uint256 balance = balanceOf(account);
        return (balance * 100) / (TOTAL_SUPPLY * 10 ** DECIMALS);
    }

    // Get shares for a given percentage
    function getSharesForPercentage(
        uint256 percentage
    ) external pure returns (uint256) {
        require(percentage <= 100, "Percentage cannot exceed 100");
        return (TOTAL_SUPPLY * 10 ** DECIMALS * percentage) / 100;
    }

    // Get percentage for given shares
    function getPercentageForShares(
        uint256 shares
    ) external pure returns (uint256) {
        return (shares * 100) / TOTAL_SUPPLY;
    }
}
