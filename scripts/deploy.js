const hre = require("hardhat");

async function main() {
  [owner] = await hre.ethers.getSigners();

  const MPToken = await hre.ethers.getContractFactory("MPToken");
  const mpToken = await MPToken.deploy();

  const Marketplace = await hre.ethers.getContractFactory('Marketplace', owner);
  const marketplace = await Marketplace.deploy(2, owner.address, mpToken.address);

  await mpToken.deployed();
  await marketplace.deployed();

  await mpToken.connect(owner).mint(marketplace.address, ethers.utils.parseEther('10000'));

  const ownerBalance = await mpToken.balanceOf(owner.address);
  const totalSupply = await mpToken.totalSupply();

  console.log("********************************");
  console.log("Owner Address: ", owner.address);
  console.log("Owner Balance: ", ownerBalance, "wei");
  console.log("Total Supply: ", hre.ethers.utils.formatEther(totalSupply), "ETH");
  console.log("********************************");

  console.log("MP Token deployed to address: ", mpToken.address);
  console.log("Marketplace deployed to address: ", marketplace.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// ********************************
// Owner Address:  0x8D604fD29d1433C7a67066A5222E72000B245D30
// Owner Balance:  BigNumber { value: "10000000000000000000000000" } wei
// Total Supply:  10000000.0 ETH
// ********************************