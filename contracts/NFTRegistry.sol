// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract NFTRegistry {
    struct NFTIndex {
        address nftContract;
        uint256 tokenId;
        address managerContract;
        address firstOwner;
        bool isActive;
        uint256 createdAt;
        string metadataURI;
    }

    // Array to store NFT indices
    NFTIndex[] public nftIndices;

    // Mapping from manager contract to index in nftIndices array
    mapping(address => uint256) public managerToIndex;

    // Mapping from NFT contract + tokenId to manager contract
    mapping(address => mapping(uint256 => address)) public nftToManager;

    // Mapping from owner to array of manager contracts they own
    mapping(address => address[]) public ownerToManagers;

    // Mapping from owner to array of manager contracts they have shares in
    mapping(address => address[]) public shareholderToManagers;

    // Events
    event NFTRegistered(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed managerContract,
        address firstOwner,
        string metadataURI
    );

    event NFTPurchased(
        address indexed managerContract,
        address indexed buyer,
        uint256 percentage
    );

    event NFTDeactivated(
        address indexed managerContract,
        address indexed nftContract,
        uint256 indexed tokenId
    );

    // Function to register a new shared NFT (only stores index data)
    function registerSharedNFT(
        address _managerContract,
        string memory _metadataURI
    ) external {
        // Get basic NFT info from manager contract
        (bool success, bytes memory data) = _managerContract.call(
            abi.encodeWithSignature("getNFTInfo()")
        );

        require(success, "Failed to get NFT info from manager");

        (
            address nftContract,
            uint256 tokenId,
            address firstOwner,
            uint256 nftPrice,
            uint256 maxSellable,
            uint256 totalSold
        ) = abi.decode(
                data,
                (address, uint256, address, uint256, uint256, uint256)
            );

        // Check if NFT is already registered
        require(
            nftToManager[nftContract][tokenId] == address(0),
            "NFT already registered"
        );

        // Add to nftIndices array
        nftIndices.push(
            NFTIndex({
                nftContract: nftContract,
                tokenId: tokenId,
                managerContract: _managerContract,
                firstOwner: firstOwner,
                isActive: true,
                createdAt: block.timestamp,
                metadataURI: _metadataURI
            })
        );

        uint256 index = nftIndices.length - 1;

        // Update mappings
        managerToIndex[_managerContract] = index + 1; // Store 1-based index
        nftToManager[nftContract][tokenId] = _managerContract;
        ownerToManagers[firstOwner].push(_managerContract);

        emit NFTRegistered(
            nftContract,
            tokenId,
            _managerContract,
            firstOwner,
            _metadataURI
        );
    }

    // Function to record a purchase (updates shareholder mapping)
    function recordPurchase(address _managerContract, address _buyer) external {
        require(managerToIndex[_managerContract] > 0, "NFT not registered");

        // Add buyer to shareholders if not already there
        address[] storage shareholders = shareholderToManagers[_buyer];
        bool alreadyShareholder = false;
        for (uint256 i = 0; i < shareholders.length; i++) {
            if (shareholders[i] == _managerContract) {
                alreadyShareholder = true;
                break;
            }
        }
        if (!alreadyShareholder) {
            shareholders.push(_managerContract);
        }

        emit NFTPurchased(_managerContract, _buyer, 0); // Percentage not stored here
    }

    // Function to deactivate an NFT
    function deactivateNFT(address _managerContract) external {
        require(managerToIndex[_managerContract] > 0, "NFT not registered");

        uint256 index = managerToIndex[_managerContract] - 1;
        nftIndices[index].isActive = false;

        emit NFTDeactivated(
            _managerContract,
            nftIndices[index].nftContract,
            nftIndices[index].tokenId
        );
    }

    // Query functions - only return index data
    function getTotalSharedNFTs() external view returns (uint256) {
        return nftIndices.length;
    }

    function getNFTIndex(
        uint256 _index
    ) external view returns (NFTIndex memory) {
        require(_index < nftIndices.length, "Index out of bounds");
        return nftIndices[_index];
    }

    function getNFTIndexByManager(
        address _managerContract
    ) external view returns (NFTIndex memory) {
        require(managerToIndex[_managerContract] > 0, "NFT not registered");
        uint256 index = managerToIndex[_managerContract] - 1;
        return nftIndices[index];
    }

    function getActiveNFTIndices() external view returns (NFTIndex[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < nftIndices.length; i++) {
            if (nftIndices[i].isActive) {
                activeCount++;
            }
        }

        NFTIndex[] memory activeNFTs = new NFTIndex[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < nftIndices.length; i++) {
            if (nftIndices[i].isActive) {
                activeNFTs[currentIndex] = nftIndices[i];
                currentIndex++;
            }
        }

        return activeNFTs;
    }

    function getNFTIndicesByOwner(
        address _owner
    ) external view returns (NFTIndex[] memory) {
        address[] memory managers = ownerToManagers[_owner];
        NFTIndex[] memory nfts = new NFTIndex[](managers.length);

        for (uint256 i = 0; i < managers.length; i++) {
            uint256 index = managerToIndex[managers[i]] - 1;
            nfts[i] = nftIndices[index];
        }

        return nfts;
    }

    function getNFTIndicesByShareholder(
        address _shareholder
    ) external view returns (NFTIndex[] memory) {
        address[] memory managers = shareholderToManagers[_shareholder];
        NFTIndex[] memory nfts = new NFTIndex[](managers.length);

        for (uint256 i = 0; i < managers.length; i++) {
            uint256 index = managerToIndex[managers[i]] - 1;
            nfts[i] = nftIndices[index];
        }

        return nfts;
    }

    function getManagerContract(
        address _nftContract,
        uint256 _tokenId
    ) external view returns (address) {
        return nftToManager[_nftContract][_tokenId];
    }

    function isNFTShared(
        address _nftContract,
        uint256 _tokenId
    ) external view returns (bool) {
        return nftToManager[_nftContract][_tokenId] != address(0);
    }

    function getRecentNFTIndices(
        uint256 _count
    ) external view returns (NFTIndex[] memory) {
        uint256 totalNFTs = nftIndices.length;
        uint256 count = _count > totalNFTs ? totalNFTs : _count;

        NFTIndex[] memory recentNFTs = new NFTIndex[](count);

        for (uint256 i = 0; i < count; i++) {
            recentNFTs[i] = nftIndices[totalNFTs - 1 - i];
        }

        return recentNFTs;
    }
}
