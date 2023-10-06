// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface ITaskTokenERC721 is IERC721 {
    function mint(address to) external returns (uint256 tokenID);
}



