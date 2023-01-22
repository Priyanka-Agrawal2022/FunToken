const hre = require("hardhat");

async function main() {
  [owner] = await hre.ethers.getSigners();

  const FunToken = await hre.ethers.getContractFactory("FunToken");
  const funToken = await FunToken.deploy();

  const Marketplace = await hre.ethers.getContractFactory('Marketplace', owner);
  const marketplace = await Marketplace.deploy(2, owner.address, funToken.address);

  await funToken.deployed();
  await marketplace.deployed();

  await funToken.connect(owner).mint(marketplace.address, ethers.utils.parseEther('10000'));

  const ownerBalance = await funToken.balanceOf(owner.address);
  const totalSupply = await funToken.totalSupply();

  console.log("********************************");
  console.log("Owner Address: ", owner.address);
  console.log("Owner Balance: ", ownerBalance, "wei");
  console.log("Total Supply: ", hre.ethers.utils.formatEther(totalSupply), "ETH");
  console.log("********************************");

  console.log("FunToken deployed to address: ", funToken.address);
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