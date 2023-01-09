// Test cases for MP Tokens
const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

describe("MP Token", function () {
  //global vars
  let MPToken;
  let mpToken;
  let owner;
  let address1;
  let address2;

  beforeEach(async function () {
    //Contract factory and signers
    MPToken = await ethers.getContractFactory("MPToken");
    [owner, address1, address2] = await hre.ethers.getSigners();
    mpToken = await MPToken.deploy();
  });

  describe("Deployment", function () {
    it("is correct owner", async function () {
      expect(await mpToken.owner()).to.equal(owner.address);
    });

    it("is initial supply assigned to owner", async function () {
      const ownerBalance = await mpToken.balanceOf(owner.address);
      expect(await mpToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("validate transfer tokens", async function () {
      await mpToken.transfer(address1.address, 500);
      const address1Bal = await mpToken.balanceOf(address1.address);
      expect(address1Bal).to.equal(500);

      await mpToken.connect(address1).transfer(address2.address, 500);
      const address2Bal = await mpToken.balanceOf(address2.address);
      expect(address2Bal).to.equal(500);
    });

    it("sender doesn't have enough token balance", async function () {
      const initialOwnerBalance = await mpToken.balanceOf(owner.address);
      await expect(
        mpToken.connect(address1).transfer(owner.address, 500)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      expect(await mpToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("update balances after transfer", async function () {
      const initialOwnerBalance = await mpToken.balanceOf(owner.address);

      await mpToken.transfer(address1.address, 1000);

      await mpToken.transfer(address2.address, 5000);

      // Check balances.
      const finalOwnerBalance = await mpToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(6000));

      const address1Balance = await mpToken.balanceOf(address1.address);
      expect(address1Balance).to.equal(1000);

      const address2Balance = await mpToken.balanceOf(address2.address);
      expect(address2Balance).to.equal(5000);
    });
  });
});
