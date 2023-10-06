const { ethers } = require("hardhat");
const {
  VerifywithArgs, Verify } = require("../verifyfunc");
  const hre = require("hardhat");


async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Contract = await ethers.getContractFactory("TaskMarket");

  const contract = await Contract.deploy(
   "0xa4cDC0e4ed400794f9C08dBfEE4e3bdc6C50d708", //ERC20 Address
   "0x6F8Dd3cD472f4E412aB68002E5e10bd4Ef9F1d57", //ERC721 Address
   "1000000000000000000"// Price
  );
  await contract.waitForDeployment();
  //const tx = await contract.deploymentTransaction();

  console.log("TaskMarket Contract address:", contract.target);
  await VerifywithArgs(contract.target, [ "0xa4cDC0e4ed400794f9C08dBfEE4e3bdc6C50d708", 
  "0x6F8Dd3cD472f4E412aB68002E5e10bd4Ef9F1d57",
  "1000000000000000000"]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });