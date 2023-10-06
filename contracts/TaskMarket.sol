// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./Interface/ITaskTokenERC721.sol";

contract TaskMarket {
    IERC20 public tskERC20;
    ITaskTokenERC721 public tskERC721;

    uint256 public nftPrice;

    event NFTPurchased(address indexed buyer, uint256 indexed tokenId);
    event NFTSold(address indexed seller, uint256 indexed tokenId);

    constructor(address erc20Address, address erc721Address, uint256 price) {
        tskERC20 = IERC20(erc20Address);
        tskERC721 = ITaskTokenERC721(erc721Address);
        nftPrice = price;
    }

    function purchase() public {
        require(
            tskERC20.transferFrom(msg.sender, address(this), nftPrice),
            "Purchase : ERC20 transfer failed"
        );
        uint256 tokenId = tskERC721.mint(msg.sender);
        emit NFTPurchased(msg.sender, tokenId);
    }

    function sell(uint256 tokenId) public {
        require(
            tskERC721.ownerOf(tokenId) == msg.sender,
            "Sell : You don't own this NFT"
        );
        require(
            tskERC20.transfer(msg.sender, nftPrice),
            "Sell : ERC20 transfer failed"
        );
        tskERC721.transferFrom(msg.sender, address(this), tokenId);
        emit NFTSold(msg.sender, tokenId);
    }
}
