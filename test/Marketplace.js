const { expect } = require("chai");

describe('Staking', () => {
  before(async () => {
    [owner, address1, address2] = await ethers.getSigners();

    console.log("Owner MATIC Balance Before Deploying Contracts: ", ethers.utils.formatEther(await owner.getBalance()));

    FunToken = await ethers.getContractFactory('FunToken', owner);
    funToken = await FunToken.deploy();

    Marketplace = await ethers.getContractFactory('Marketplace', owner);
    marketplace = await Marketplace.deploy(2, owner.address, funToken.address);
  });


  describe('buyTokens', () => {
    it('Should let us buy tokens and our balance should go up.', async () => {
      let totalSupply;
      let address1TokenBalance;
      let address2TokenBalance;

      console.log("Owner Address: ", owner.address);
      console.log('Marketplace address: ', marketplace.address);
      console.log('FunToken address: ', funToken.address);

      console.log("Owner MATIC Balance After Deploying Contracts: ", ethers.utils.formatEther(await owner.getBalance()));

      totalSupply = await funToken.totalSupply();
      address1TokenBalance = await funToken.balanceOf(address1.address);
      address2TokenBalance = await funToken.balanceOf(address2.address);
      expect(totalSupply).to.be.equal(ethers.utils.parseEther('10000000'));
      expect(address1TokenBalance).to.be.equal(0);
      expect(address2TokenBalance).to.be.equal(0);

      console.log("Owner MATIC Balance Before Minting Tokens to Marketplace Contract: ", ethers.utils.formatEther(await owner.getBalance()));

      await funToken.connect(owner).mint(
        marketplace.address,
        ethers.utils.parseEther('10000')
      );

      console.log("Owner MATIC Balance After Minting Tokens to Marketplace Contract: ", ethers.utils.formatEther(await owner.getBalance()));

      const startingOwnerTokenBalance = await funToken.balanceOf(owner.address);
      console.log('\t', "Starting Owner Token balance: ", ethers.utils.formatEther(startingOwnerTokenBalance));

      const startingOwnerMATICBalance = await owner.getBalance();
      console.log('\t', "Starting Owner MATIC balance: ", ethers.utils.formatEther(startingOwnerMATICBalance));

      const startingMarketplaceTokenBalance = await funToken.balanceOf(marketplace.address);
      console.log('\t', "Starting Marketplace Token balance: ", ethers.utils.formatEther(startingMarketplaceTokenBalance));

      const startingMarketplaceMATICBalance = await ethers.provider.getBalance(marketplace.address);
      console.log('\t', "Starting Marketplace MATIC balance: ", ethers.utils.formatEther(startingMarketplaceMATICBalance));

      console.log('\t', "Buying...");
      await marketplace.connect(address1).buyTokens(address1.address, {value: ethers.utils.parseEther('10')});
      await marketplace.connect(address2).buyTokens(address2.address, {value: ethers.utils.parseEther('20')});

      console.log('\t', "Waiting for confirmation...");

      totalSupply = await funToken.totalSupply();
      address1TokenBalance = await funToken.connect(owner).balanceOf(address1.address);
      address2TokenBalance = await funToken.connect(owner).balanceOf(address2.address);

      const newOwnerTokenBalance = await funToken.balanceOf(owner.address);
      console.log('\t', "New Owner Token balance: ", ethers.utils.formatEther(newOwnerTokenBalance));

      const newOwnerMATICBalance = await owner.getBalance();
      console.log('\t', "New Owner MATIC balance: ", ethers.utils.formatEther(newOwnerMATICBalance));

      const newMarketplaceTokenBalance = await funToken.balanceOf(marketplace.address);
      console.log('\t', "New Marketplace Token balance: ", ethers.utils.formatEther(newMarketplaceTokenBalance));

      const newMarketplaceMATICBalance = await ethers.provider.getBalance(marketplace.address);
      console.log('\t', "New Marketplace MATIC balance: ", ethers.utils.formatEther(newMarketplaceMATICBalance));

      console.log('\t', "Address1 Token balance: ", ethers.utils.formatEther(address1TokenBalance));
      console.log('\t', "Address2 Token balance: ", ethers.utils.formatEther(address2TokenBalance));

      expect(totalSupply).to.be.equal(ethers.utils.parseEther('10010000'));
      expect(address1TokenBalance).to.be.equal(ethers.utils.parseEther('20'));
      expect(address2TokenBalance).to.be.equal(ethers.utils.parseEther('40'));
      // expect(newOwnerMATICBalance).to.be.above(startingOwnerMATICBalance);
      expect(newMarketplaceTokenBalance).to.be.below(startingMarketplaceTokenBalance);
    });
  });

  describe("sellTokens()", () => {
    it("Should let us sell tokens and we should get the appropriate amount of MATIC back.", async function() {

      console.log('Owner address: ', owner.address);
      console.log('Marketplace address: ', marketplace.address);
      console.log('FunToken address: ', funToken.address);

      const startingOwnerTokenBalance = await funToken.balanceOf(owner.address);
      console.log('\t', "Starting Owner Token balance: ", ethers.utils.formatEther(startingOwnerTokenBalance));

      const startingOwnerMATICBalance = await ethers.provider.getBalance(owner.address);
      console.log('\t', "Starting Owner MATIC balance: ", ethers.utils.formatEther(startingOwnerMATICBalance));

      const startingMarketplaceTokenBalance = await funToken.balanceOf(marketplace.address);
      console.log('\t', "Starting Marketplace Token balance: ", ethers.utils.formatEther(startingMarketplaceTokenBalance));

      const startingMarketplaceMATICBalance = await ethers.provider.getBalance(marketplace.address);
      console.log('\t', "Starting Marketplace MATIC balance: ", ethers.utils.formatEther(startingMarketplaceMATICBalance));

      const startingAddress1TokenBalance = await funToken.balanceOf(address1.address);
      console.log('\t', "Address1 Token balance: ", ethers.utils.formatEther(startingAddress1TokenBalance));

      console.log('\t', "Approving...")
      const approveTokensResult = await funToken.connect(address1).approve(marketplace.address, ethers.utils.parseEther("10"));
      console.log('\t', "approveTokens Result: ", approveTokensResult.hash);

      console.log('\t', "Waiting for confirmation...");
      const atxResult =  await approveTokensResult.wait();
      expect(atxResult.status).to.equal(1, "Error when expecting the transaction result to equal 1");

      console.log('\t', "Selling...");
      
      const sellTokensResult = await marketplace.connect(address1).sellTokens(ethers.utils.parseEther("10"));
      console.log('\t', "sellTokens Result: ", sellTokensResult.hash);

      console.log('\t', "Waiting for confirmation...");
      const txResult =  await sellTokensResult.wait();
      expect(txResult.status).to.equal(1, "Error when expecting the transaction status to equal 1");

      const newOwnerTokenBalance = await funToken.balanceOf(owner.address);
      console.log('\t', "New Owner Token balance: ", ethers.utils.formatEther(newOwnerTokenBalance));

      const newOwnerMATICBalance = await ethers.provider.getBalance(owner.address);
      console.log('\t', "New Owner MATIC balance: ", ethers.utils.formatEther(newOwnerMATICBalance));

      const newMarketplaceTokenBalance = await funToken.balanceOf(marketplace.address);
      console.log('\t', "New Marketplace Token balance: ", ethers.utils.formatEther(newMarketplaceTokenBalance));

      const newMarketplaceMATICBalance = await ethers.provider.getBalance(marketplace.address);
      console.log('\t', "New Marketplace MATIC balance: ", ethers.utils.formatEther(newMarketplaceMATICBalance));

      const newAddress1TokenBalance = await funToken.balanceOf(address1.address);
      console.log('\t', "Address1 Token balance: ", ethers.utils.formatEther(newAddress1TokenBalance));

      expect(newAddress1TokenBalance).to.equal(startingAddress1TokenBalance.sub(ethers.utils.parseEther("10")), "Error when expecting the token balance to have increased by 10");

      const maticChange = startingMarketplaceMATICBalance.sub(newMarketplaceMATICBalance);
      expect(maticChange).to.equal(ethers.utils.parseEther('5'), "Error when expecting the MATIC returned to the user by the sellTokens function to be correct");
    });
  });

  describe("withdraw()", () => {
    it("Should let the owner (and nobody else) withdraw the MATIC from the contract.", async function() {
      const [ owner, nonOwner ] = await ethers.getSigners();

      console.log('Owner address: ', owner.address);
      console.log('Non-owner address: ', nonOwner.address);
      console.log('Marketplace address: ', marketplace.address);
      console.log('FunToken address: ', funToken.address);

      const beforeBuyingMarketplaceTokenBalance = await funToken.balanceOf(marketplace.address);
      console.log('\t', "Before Buying Marketplace Token balance: ", ethers.utils.formatEther(beforeBuyingMarketplaceTokenBalance));

      const beforeBuyingMarketplaceMATICBalance = await ethers.provider.getBalance(marketplace.address);
      console.log('\t', "Before Buying Marketplace MATIC balance: ", ethers.utils.formatEther(beforeBuyingMarketplaceMATICBalance));

      const beforeBuyingNonOwnerTokenBalance = await funToken.balanceOf(nonOwner.address);
      console.log('\t', "Before Buying Non-owner Token balance: ", ethers.utils.formatEther(beforeBuyingNonOwnerTokenBalance));

      const beforeBuyingNonOwneMATICBalance = await ethers.provider.getBalance(nonOwner.address);
      console.log('\t', "Before Buying Non-owner MATIC balance: ", ethers.utils.formatEther(beforeBuyingNonOwneMATICBalance));

      console.log('\t', "Buying some tokens...");
      const buyTokensResult = await marketplace.connect(nonOwner).buyTokens(nonOwner.address, {value: ethers.utils.parseEther("5")});
      console.log('\t', "buyTokens Result: ", buyTokensResult.hash);

      console.log('\t', "Waiting for confirmation...");
      const buyTxResult =  await buyTokensResult.wait();
      expect(buyTxResult.status).to.equal(1, "Error when expecting the transaction result to be 1");

      const afterBuyingMarketplaceTokenBalance = await funToken.balanceOf(marketplace.address);
      console.log('\t', "After Buying Marketplace Token balance: ", ethers.utils.formatEther(afterBuyingMarketplaceTokenBalance));

      const afterBuyingMarketplaceMATICBalance = await ethers.provider.getBalance(marketplace.address);
      console.log('\t', "After Buying Marketplace MATIC balance: ", ethers.utils.formatEther(afterBuyingMarketplaceMATICBalance));

      const afterBuyingNonOwnerTokenBalance = await funToken.balanceOf(nonOwner.address);
      console.log('\t', "After Buying Non-owner Token balance: ", ethers.utils.formatEther(afterBuyingNonOwnerTokenBalance));

      const afterBuyingNonOwneMATICBalance = await ethers.provider.getBalance(nonOwner.address);
      console.log('\t', "After Buying Non-owner MATIC balance: ", ethers.utils.formatEther(afterBuyingNonOwneMATICBalance));

      const startingMarketplaceMATICBalance = await ethers.provider.getBalance(marketplace.address);
      console.log('\t', "Starting Marketplace MATIC balance: ", ethers.utils.formatEther(startingMarketplaceMATICBalance));

      console.log('\t', "Withdrawing as non-owner (should fail)...");

      const startingNonOwnerMATICBalance = await ethers.provider.getBalance(nonOwner.address);
      console.log('\t', "Starting Non-owner MATIC balance: ", ethers.utils.formatEther(startingNonOwnerMATICBalance));

      await expect(marketplace.connect(nonOwner).withdraw()).to.be.reverted;
      console.log('\t', "Withdraw reverted as non-owner");

      const newNonOwnerMATICBalance = await ethers.provider.getBalance(nonOwner.address);
      console.log('\t', "New Non-owner MATIC balance: ", ethers.utils.formatEther(newNonOwnerMATICBalance));
      expect(newNonOwnerMATICBalance).to.be.lte(startingNonOwnerMATICBalance, "Error when expecting the new MATIC balance to be <= to the previous balance after calling withdraw by a non owner");

      console.log('\t', "Withdrawing as owner...");
      const startingOwnerMATICBalance = await ethers.provider.getBalance(owner.address);
      console.log('\t', "Starting Owner MATIC balance: ", ethers.utils.formatEther(startingOwnerMATICBalance));
      const withdrawResult = await marketplace.withdraw();
      console.log('\t', "Withdraw Result: ", withdrawResult.hash);

      console.log('\t',"Waiting for confirmation...");
      const withdrawTxResult =  await withdrawResult.wait();
      expect(withdrawTxResult.status).to.equal(1, "Error when expecting the withdraw transaction to equal 1");

      const newOwnerMATICBalance = await ethers.provider.getBalance(owner.address);
      console.log('\t', "New Owner MATIC balance: ", ethers.utils.formatEther(newOwnerMATICBalance));

      const newMarketplaceMATICBalance = await ethers.provider.getBalance(marketplace.address);
      console.log('\t', "New Marketplace MATIC balance: ", ethers.utils.formatEther(newMarketplaceMATICBalance));

      const tx = await ethers.provider.getTransaction(withdrawResult.hash);
      const receipt = await ethers.provider.getTransactionReceipt(withdrawResult.hash);
      const gasCost = tx.gasPrice?.mul(receipt.gasUsed);

      expect(newOwnerMATICBalance).to.equal(startingOwnerMATICBalance.add(startingMarketplaceMATICBalance).sub(ethers.BigNumber.from(gasCost)), "Error when expecting the owner's MATIC returned by withdraw to be sufficient");
    });
  });
});