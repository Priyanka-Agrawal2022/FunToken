const { ethers, upgrades } = require("hardhat");

async function main() {
  // Deploying
  const MPTokenU = await ethers.getContractFactory("MPTokenU");
  const tokenUpgradeableInstance = await upgrades.deployProxy(MPTokenU, {
    kind: "uups",
  });
  await tokenUpgradeableInstance.deployed();

  console.log(
    "MP upgreadeable token Deployed Address:",
    tokenUpgradeableInstance.address
  );

  //Example scripts for Upgrading
  //   const BoxV2 = await ethers.getContractFactory("BoxV2");
  //   const upgraded = await upgrades.upgradeProxy(instance.address, BoxV2);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
