const { ethers } = require("hardhat");
const {
  VerifywithArgs, Verify } = require("../verifyfunc");
  const hre = require("hardhat");


async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Contract = await ethers.getContractFactory("TaskTokenERC20");

  const contract = await Contract.deploy();
  await contract.waitForDeployment();
  //const tx = await contract.deploymentTransaction();

  console.log("TaskTokenERC20 Contract address:", contract.target);
  await Verify(contract.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });