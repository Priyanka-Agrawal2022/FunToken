// Test cases for FunTokens
const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

describe("FunToken", function () {
  //global vars
  let FunToken;
  let funToken;
  let owner;
  let address1;
  let address2;

  beforeEach(async function () {
    //Contract factory and signers
    FunToken = await ethers.getContractFactory("FunToken");
    [owner, address1, address2] = await hre.ethers.getSigners();
    funToken = await FunToken.deploy();
  });

  describe("Deployment", function () {
    it("is correct owner", async function () {
      expect(await funToken.owner()).to.equal(owner.address);
    });

    it("is initial supply assigned to owner", async function () {
      const ownerBalance = await funToken.balanceOf(owner.address);
      expect(await funToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("validate transfer tokens", async function () {
      await funToken.transfer(address1.address, 500);
      const address1Bal = await funToken.balanceOf(address1.address);
      expect(address1Bal).to.equal(500);

      await funToken.connect(address1).transfer(address2.address, 500);
      const address2Bal = await funToken.balanceOf(address2.address);
      expect(address2Bal).to.equal(500);
    });

    it("sender doesn't have enough token balance", async function () {
      const initialOwnerBalance = await funToken.balanceOf(owner.address);
      await expect(
        funToken.connect(address1).transfer(owner.address, 500)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      expect(await funToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("update balances after transfer", async function () {
      const initialOwnerBalance = await funToken.balanceOf(owner.address);

      await funToken.transfer(address1.address, 1000);

      await funToken.transfer(address2.address, 5000);

      // Check balances.
      const finalOwnerBalance = await funToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(6000));

      const address1Balance = await funToken.balanceOf(address1.address);
      expect(address1Balance).to.equal(1000);

      const address2Balance = await funToken.balanceOf(address2.address);
      expect(address2Balance).to.equal(5000);
    });
  });
});
