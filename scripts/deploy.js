const { ethers } = require("hardhat");

async function main() {
    const [owner] = await ethers.getSigners();

    const tokenSupply = 100000000;
    const pricePerEtherInCents = 300000; // 300000 cents ~ 3000 usd
    const tokensForPreSale = 3 * 10**7; // 30 million
    const tokensForSeedSale = 5 * 10**7; // 50 million
    const tokensForFinalSale = 2 * 10**7; // 20 million
    const priceForPreSale = 15; //15 cents
    const priceForSeedSale = 25; //25 cents
    const priceForFinalSale = 150; //150 cents

    let tokenDecimals;

    const BlazeToken = await ethers.getContractFactory("BlazeToken");
    const CrowdSale = await ethers.getContractFactory("CrowdSale");

    // Deploy ERC20 token.
    const blazeToken = await BlazeToken.deploy(
        tokenSupply, //100 million
        "BlazeK",
        "BLZ"
    );
    await blazeToken.deployed();
    tokenDecimals = await blazeToken.decimals();

    // Deploy CrowdSale contract
    const crowdSale = await CrowdSale.deploy(
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

    // Send tokens to CrowdSale contract;
    const txn = await blazeToken.transfer(
        crowdSale.address,
        ethers.utils.parseUnits(`${tokenSupply}`, tokenDecimals)
    );
    await txn.wait();

    console.log("BlazeToken deployed at: ", blazeToken.address);
    console.log("CrowdSale contract deployed at: ", crowdSale.address);
    console.log("Balance of CrowdSale contract: ", await blazeToken.balanceOf(crowdSale.address));
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    });
