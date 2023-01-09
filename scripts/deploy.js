const hre = require("hardhat");

async function main() {
  const MPToken = await hre.ethers.getContractFactory("MPToken");
  const tokenInstance = await MPToken.deploy();

  await tokenInstance.deployed();

  console.log("MP Token deployed address: ", tokenInstance.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
