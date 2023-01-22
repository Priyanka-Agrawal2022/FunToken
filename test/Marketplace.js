const { expect } = require("chai");

describe('Staking', () => {
  beforeEach(async () => {
    [owner, address1, address2] = await ethers.getSigners();

    FunToken = await ethers.getContractFactory('FunToken', owner);
    funToken = await FunToken.deploy();

    Marketplace = await ethers.getContractFactory('Marketplace', owner);
    marketplace = await Marketplace.deploy(2, owner.address, funToken.address);
  });


  describe('buyTokens', () => {
    it('adds a token symbol', async () => {
      let totalSupply;
      let address1Balance;
      let address2Balance;

      totalSupply = await funToken.totalSupply();
      address1Balance = await funToken.balanceOf(address1.address);
      address2Balance = await funToken.balanceOf(address2.address);
      expect(totalSupply).to.be.equal(ethers.utils.parseEther('10000000'));
      expect(address1Balance).to.be.equal(0);
      expect(address2Balance).to.be.equal(0);

      await funToken.connect(owner).mint(
        marketplace.address,
        ethers.utils.parseEther('10000')
      );

      const ownerEtherBalanceOld = await owner.getBalance();

      await marketplace.connect(address1).buyTokens(address1.address, {value: ethers.utils.parseEther('10')});
      await marketplace.connect(address2).buyTokens(address2.address, {value: ethers.utils.parseEther('20')});

      totalSupply = await mpToken.totalSupply();
      address1Balance = await funToken.connect(owner).balanceOf(address1.address);
      address2Balance = await funToken.connect(owner).balanceOf(address2.address);
      const ownerEtherBalanceNew = await owner.getBalance();

      expect(totalSupply).to.be.equal(ethers.utils.parseEther('10010000'));
      expect(address1Balance).to.be.equal(ethers.utils.parseEther('20'));
      expect(address2Balance).to.be.equal(ethers.utils.parseEther('40'));
      expect(ownerEtherBalanceNew).to.be.above(ownerEtherBalanceOld);
    });
  });
});