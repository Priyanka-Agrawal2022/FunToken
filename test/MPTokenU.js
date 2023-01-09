// test cases for upgradeable MPTokens
// Similar to scripts in MPToken.js

const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");

describe("MP Token", function () {
  //global vars
  let MPTokenU;
  let mpTokenU;
  let owner;
  let address1;
  let address2;

  beforeEach(async function () {
    //Contract factory and signers
    MPTokenU = await ethers.getContractFactory("MPTokenU");
    [owner, address1, address2] = await hre.ethers.getSigners();
    mpTokenU = await upgrades.deployProxy(MPTokenU, {
      kind: "uups",
    });
  });

  describe("Deployment", function () {
    it("is correct owner", async function () {
      expect(await mpTokenU.owner()).to.equal(owner.address);
    });

    it("is initial supply assigned to owner", async function () {
      const ownerBalance = await mpTokenU.balanceOf(owner.address);
      expect(await mpTokenU.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("validate transfer tokens", async function () {
      await mpTokenU.transfer(address1.address, 500);
      const address1Bal = await mpTokenU.balanceOf(address1.address);
      expect(address1Bal).to.equal(500);

      await mpTokenU.connect(address1).transfer(address2.address, 500);
      const address2Bal = await mpTokenU.balanceOf(address2.address);
      expect(address2Bal).to.equal(500);
    });

    it("sender doesn't have enough token balance", async function () {
      const initialOwnerBalance = await mpTokenU.balanceOf(owner.address);
      await expect(
        mpTokenU.connect(address1).transfer(owner.address, 500)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      expect(await mpTokenU.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("update balances after transfer", async function () {
      const initialOwnerBalance = await mpTokenU.balanceOf(owner.address);

      await mpTokenU.transfer(address1.address, 1000);

      await mpTokenU.transfer(address2.address, 5000);

      // Check balances.
      const finalOwnerBalance = await mpTokenU.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(6000));

      const address1Balance = await mpTokenU.balanceOf(address1.address);
      expect(address1Balance).to.equal(1000);

      const address2Balance = await mpTokenU.balanceOf(address2.address);
      expect(address2Balance).to.equal(5000);
    });
  });
});
