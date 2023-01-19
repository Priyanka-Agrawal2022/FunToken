const hre = require("hardhat");

async function main() {
  [owner] = await hre.ethers.getSigners();

  const MPToken = await hre.ethers.getContractFactory("MPToken");
  const mpToken = await MPToken.deploy();

  const Marketplace = await hre.ethers.getContractFactory('Marketplace', owner);
  const marketplace = await Marketplace.deploy(2, owner.address, mpToken.address);

  await mpToken.deployed();

  await mpToken.connect(owner).mint(marketplace.address, ethers.utils.parseEther('10000'));

  console.log("********************************");
  console.log("Marketplace:", marketplace.address);
  console.log("MPToken:", mpToken.address);
  console.log("********************************");

  const ownerBalance = await mpToken.balanceOf(owner.address);
  const totalSupply = await mpToken.totalSupply();

  console.log("********************************");
  console.log("Owner Address: ", owner.address);
  console.log("Owner Balance: ", ownerBalance, "wei");
  console.log("Total Supply: ", hre.ethers.utils.formatEther(totalSupply), "ETH");
  console.log("********************************");

  console.log("MP Token deployed to address: ", mpToken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Owner Balance:  BigNumber { value: "10000000000000000000000000" }
// Total Supply:  BigNumber { value: "10000000000000000000000000" }
// MP Token deployed to address:  0x5FbDB2315678afecb367f032d93F642f64180aa3

// Owner Balance:  BigNumber { value: "10000000000000000000000000" } wei
// Total Supply:  10000000.0 ETH
// MP Token deployed to address:  0x5FbDB2315678afecb367f032d93F642f64180aa3

// Owner Address:  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
// Owner Balance:  BigNumber { value: "10000000000000000000000000" } wei
// Total Supply:  10000000.0 ETH
// MP Token deployed to address:  0x5FbDB2315678afecb367f032d93F642f64180aa3

// Marketplace: 0x497Fc371fe90528EDE7f058EaBfc0a91aB7B1F46
// MPToken: 0xcd641e26FA6D9d8159907dbd49C451FF057560BB
// ********************************
// ********************************
// Owner Address:  0x8D604fD29d1433C7a67066A5222E72000B245D30
// Owner Balance:  BigNumber { value: "10000000000000000000000000" } wei
// Total Supply:  10000000.0 ETH
// ********************************