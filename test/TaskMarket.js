const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("TaskMarket", function () {

  const NFT_PRICE = 100;

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployTaskMarketFixture() {
    const [user] = await ethers.getSigners();

    // We deploy a mock ERC20 token contract for testing
    const TaskTokenERC20 = await ethers.getContractFactory("TaskTokenERC20");
    const erc20 = await TaskTokenERC20.deploy();

    // We deploy the TaskTokenERC721 contract
    const TaskTokenERC721 = await ethers.getContractFactory("TaskTokenERC721");
    const erc721 = await TaskTokenERC721.deploy();

    // We deploy the TaskMarket contract with the addresses of the ERC20 and ERC721 contracts
    const TaskMarket = await ethers.getContractFactory("TaskMarket");
    const taskMarket = await TaskMarket.deploy(
      erc20.target,
      erc721.target,
      NFT_PRICE
    );

    const role = await erc721.connect(user).MINTER_ROLE();

    await erc721.connect(user).grantRole(role, taskMarket.target);


    return { erc20, erc721, taskMarket, user };
  }

  describe("Deployment", function () {
    it("Should set the right addresses for the ERC20 and ERC721 tokens", async function () {
      const { erc20, erc721, taskMarket } = await loadFixture(
        deployTaskMarketFixture
      );

      expect(await taskMarket.tskERC20()).to.equal(erc20.target);
      expect(await taskMarket.tskERC721()).to.equal(erc721.target);
    });

    it("Should set the right price for the NFTs", async function () {
      const { taskMarket } = await loadFixture(deployTaskMarketFixture);

      expect(await taskMarket.nftPrice()).to.equal(NFT_PRICE);
    });
  });

  

  describe("Purchase", function () {
    it("Should transfer the ERC20 tokens from the user to the contract", async function () {
      const { erc20, erc721, taskMarket, user } = await loadFixture(
        deployTaskMarketFixture
      );


      // We approve the contract to spend the user's tokens
      await erc20.connect(user).approve(taskMarket.target, NFT_PRICE);

      // We get the initial balances of the user and the contract
      const initialBuyerBalance = Number(await erc20.balanceOf(user));
      const initialContractBalance = Number(await erc20.balanceOf(taskMarket.target));

      // We purchase an NFT from the contract
      await taskMarket.connect(user).purchase();

      // We get the final balances of the user and the contract
      const finalBuyerBalance = Number(await erc20.balanceOf(user));
      const finalContractBalance = Number(await erc20.balanceOf(taskMarket.target));

      // We check that the balances have changed accordingly
      expect(finalBuyerBalance).to.equal(initialBuyerBalance - NFT_PRICE);
      expect(finalContractBalance).to.equal(initialContractBalance + NFT_PRICE);
    });

    it("Should mint and transfer an NFT to the user", async function () {
      const { erc20, erc721, taskMarket, user } = await loadFixture(
        deployTaskMarketFixture
      );

      // We approve the contract to spend the user's tokens
      await erc20.connect(user).approve(taskMarket.target, NFT_PRICE);

      // We purchase an NFT from the contract
      await taskMarket.connect(user).purchase();

      // We get the token ID of the minted NFT
      const tokenId = await erc721.tokenOfOwnerByIndex(user, 0);

      // We check that the user owns the NFT
      expect(await erc721.ownerOf(tokenId)).to.equal(user.address);
    });

    it("Should emit an event on purchase", async function () {
      const { erc20, taskMarket, user } = await loadFixture(
        deployTaskMarketFixture
      );

      // We approve the contract to spend the user's tokens
      await erc20.connect(user).approve(taskMarket.target, NFT_PRICE);

      // We purchase an NFT from the contract and expect an event
      await expect(taskMarket.connect(user).purchase())
        .to.emit(taskMarket, "NFTPurchased")
        .withArgs(user.address, 0); // We expect the token ID to be 0
    });
    it("Should revert if the user does not have enough ERC20 tokens", async function () {
      const { erc20, taskMarket, user } = await loadFixture(
        deployTaskMarketFixture
      );

      // We approve the contract to spend less tokens than the NFT price
      await erc20.connect(user).approve(taskMarket, NFT_PRICE - 1);

      // We try to purchase an NFT from the contract and expect a revert
      await expect(taskMarket.connect(user).purchase()).to.be.revertedWith(
        'ERC20: insufficient allowance'
              );
    });
  });

  describe("Sell", function () {
    it("Should transfer the ERC20 tokens from the contract to the user", async function () {
      const { erc20, erc721, taskMarket, user } = await loadFixture(
        deployTaskMarketFixture
      );

      // We approve the contract to spend the user's tokens
      await erc20.connect(user).approve(taskMarket.target, NFT_PRICE);

      // We purchase an NFT from the contract as the user
      await taskMarket.connect(user).purchase();

      // We get the token ID of the minted NFT
      const tokenId = await erc721.tokenOfOwnerByIndex(user.address, 0);

      // We transfer the NFT from the user to the user
        await erc721.connect(user).approve(taskMarket.target,tokenId );

      // We get the initial balances of the user and the contract
      const initialSellerBalance = Number(await erc20.balanceOf(user.address));
      const initialContractBalance = Number(await erc20.balanceOf(taskMarket.target));

      // We sell the NFT to the contract as the user
      await taskMarket.connect(user).sell(tokenId);

      // We get the final balances of the user and the contract
      const finalSellerBalance = Number(await erc20.balanceOf(user.address));
      const finalContractBalance = Number(await erc20.balanceOf(taskMarket.target));

      // We check that the balances have changed accordingly
      expect(finalSellerBalance).to.equal(initialSellerBalance + NFT_PRICE);
      expect(finalContractBalance).to.equal(initialContractBalance - NFT_PRICE);
    });

    it("Should transfer the NFT from the user to the contract", async function () {
      const { erc20, erc721, taskMarket, user } = await loadFixture(
        deployTaskMarketFixture
      );

      // We approve the contract to spend the user's tokens
      await erc20.connect(user).approve(taskMarket.target, NFT_PRICE);

      // We purchase an NFT from the contract as the user
      await taskMarket.connect(user).purchase();

      // We get the token ID of the minted NFT
      const tokenId = await erc721.tokenOfOwnerByIndex(user, 0);

      await erc721.connect(user).approve(taskMarket.target,tokenId );


      // We sell the NFT to the contract as the user
      await taskMarket.connect(user).sell(tokenId);

      // We check that the contract owns the NFT
      expect(await erc721.ownerOf(tokenId)).to.equal(taskMarket.target);
    });

    it("Should emit an event on sell", async function () {
      const { erc20,erc721, taskMarket, user } = await loadFixture(
        deployTaskMarketFixture
      );

      // We approve the contract to spend the user's tokens
      await erc20.connect(user).approve(taskMarket.target, NFT_PRICE);

      // We purchase an NFT from the contract as the user
      await taskMarket.connect(user).purchase();

      // We get the token ID of the minted NFT
      const tokenId = await erc721.tokenOfOwnerByIndex(user, 0);

      await erc721.connect(user).approve(taskMarket.target,tokenId );

      // We sell an NFT to the contract and expect an event
      await expect(taskMarket.connect(user).sell(tokenId))
        .to.emit(taskMarket, "NFTSold")
        .withArgs(user.address, tokenId);
    });
    it("Should revert if the user does not own the NFT", async function () {
      const { taskMarket, user } = await loadFixture(
        deployTaskMarketFixture
      );

      // We try to sell an NFT that does not exist and expect a revert
      await expect(taskMarket.connect(user).sell(1)).to.be.revertedWith(
        'ERC721: invalid token ID'
        );

    });

  });
});
