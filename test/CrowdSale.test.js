const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

describe("CrowdSale", () => {
    let owner;
    let beneficiary1;
    let beneficiary2;
    let beneficiary3;

    let BlazeToken;
    let blazeToken;
    let CrowdSale;
    let crowdSale;
    let tokenDecimals;

    const tokenName = "BlazeK";
    const tokenSymbol = "BLZ";
    const tokenSupply = 10**8; // 100 million tokens

    const beneficiary = owner;
    const pricePerEtherInCents = 300000; // 300000 cents ~ 3000 usd
    const tokensForPreSale = 3 * 10**7; // 30 million
    const tokensForSeedSale = 5 * 10**7; // 50 million
    const tokensForFinalSale = 2 * 10**7; // 20 million
    const priceForPreSale = 15; //15 cents
    const priceForSeedSale = 25; //25 cents
    const priceForFinalSale = 150; //150 cents

    beforeEach(async () => {
        [owner, beneficiary1, beneficiary2, beneficiary3] = await ethers.getSigners();
        BlazeToken = await ethers.getContractFactory("BlazeToken");
        CrowdSale = await ethers.getContractFactory("CrowdSale");

        // Deploy ERC20 token.
        blazeToken = await BlazeToken.deploy(
            tokenSupply,
            tokenName,
            tokenSymbol
        );
        await blazeToken.deployed();
        tokenDecimals = await blazeToken.decimals();

        // Deploy CrowdSale contract
        crowdSale = await CrowdSale.deploy(
            blazeToken.address,
            owner.address,
            pricePerEtherInCents,
            ethers.utils.parseUnits(`${tokensForPreSale}`, tokenDecimals),
            ethers.utils.parseUnits(`${tokensForSeedSale}`, tokenDecimals),
            ethers.utils.parseUnits(`${tokensForFinalSale}`, tokenDecimals),
            priceForPreSale,
            priceForSeedSale,
            priceForFinalSale
        );
        await crowdSale.deployed();

        // Send tokens to CrowdSale contract
        const txn = await blazeToken.transfer(
            crowdSale.address,
            ethers.utils.parseUnits(`${tokenSupply}`, tokenDecimals)
        );
        await txn.wait();
    });

    it("CrowdSale contract has all the tokens", async () => {
        const crowdSaleTokenBalance = await blazeToken.balanceOf(crowdSale.address);
        expect(crowdSaleTokenBalance)
            .to.equal(ethers.utils.parseUnits(`${tokenSupply}`, tokenDecimals));
        expect(await blazeToken.balanceOf(owner.address)).to.equal(0);
    });

    it("Sets correct token price for current stage", async () => {
        const currentPrice = await crowdSale.currentTokenPriceInCents();
        expect(currentPrice).to.equal(priceForPreSale);
    });

    it("Lets others to buy tokens at correct price", async () => {
        const currentPrice = await crowdSale.currentTokenPriceInCents();
        const tokensBought = ethers.utils.parseUnits(`${pricePerEtherInCents / currentPrice}`, 9);
        const tx = await owner.sendTransaction({
            to: crowdSale.address,
            value: ethers.utils.parseEther("1")
        });
        await tx.wait();

        const tokensSold = await crowdSale.tokensSold();
        expect(tokensBought).to.equal(tokensSold);
        //expect(tokensBought).to.equal(await blazeToken.balanceOf(owner.address));
    });

    it("Updates the Sale stage and token price correctly", async () => {
        // First stage is PreSale => 0
        expect(await crowdSale.currentSaleStage()).to.equal(0);

        // Buy all tokens of PreSale.
        const tx0 = await owner.sendTransaction({
            to: crowdSale.address,
            value: ethers.utils.parseEther("1000.0")
        });
        await tx0.wait();

        const tx1 = await beneficiary1.sendTransaction({
            to: crowdSale.address,
            value: ethers.utils.parseEther("1000.0")
        });
        await tx1.wait();

        // Now, stage should be SeedSale => 1
        expect(await crowdSale.currentSaleStage()).to.equal(1);
        expect(await crowdSale.currentTokenPriceInCents()).to.equal(priceForSeedSale);
    });
})
