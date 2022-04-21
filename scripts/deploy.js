const { ethers } = require("hardhat");

async function main() {
    const [owner] = await ethers.getSigners();

    const BlazeToken = await ethers.getContractFactory("BlazeToken");
    const blazeToken = await BlazeToken.deploy(
        100000000, //100 million
        "BlazeK",
        "BLZ"
    );

    await blazeToken.deployed();
    console.log("BlazeToken deployed at: ", blazeToken.address);
    console.log(owner.address);
    console.log(await blazeToken.balanceOf(owner.address));
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error);
        process.exit(1);
    });
