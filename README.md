# ERC20 ICO/ CrowdSale Contract

## Contract: BlazeToken.sol

This contract deploys an ERC20 token with the following details.

- Name: "BlazeK"
- Symbol: "BLZ"
- Decimals: 18
- Total Supply: 100 million => 10**8 => 100000000

- Contract deployed on [rinkeby test network](https://rinkeby.etherscan.io/address/0xA01662A8a16C4b4294Aa508fa227b736B74D9544) at:

> 0xA01662A8a16C4b4294Aa508fa227b736B74D9544

100% of total supply => 100 million tokens are sent to the CrowdSale contract in order to be sold in three different stages: PreSale, SeedSale and FinalSale.

## Contract: CrowdSale.sol

This contract sells the tokens received in three different stages at different prices.

- Contract deployed on [rinkeby test network](https://rinkeby.etherscan.io/address/0xBD7b81073D68D239373De7c588Fd30325ee4E0C7) at:

> 0xBD7b81073D68D239373De7c588Fd30325ee4E0C7

- SaleStages: PreSale, SeedSale, FinalSale

### Tokens available to be sold in different stages:-

- PreSale: 30 million tokens
- SeedSale: 50 million tokens
- FinalSale: 20 million tokens

### Token price for different stages:-

- PreSale: 15 cents/ $0.15 per token
- SeedSale: 25 cents/ $0.25 per token
- FinalSale: 150 cents/ $1.50 per token

=>> Current Ether price is kept at 300000 cents or $3000.00

The wei that contract receives for tokens sold is sent to the beneficiary account specified.

If a purchaser sends more Wei than enough to buy all the remaining tokens of the current stage, then the remaining/ extra wei is sent back to the purchaser.

### How Token Price is calculated:-

- 1 ether price = 300000 cents
- 1 ether = 10**18 wei

=> 1 wei price = 300000 / 10**18 cents (i)

Now, our ERC20 token also has 18 decimal places.

- 1 token price = 15 cents
- 1 token = 10**18 tokenBits

=> 1 tokenBit price = 15/ 10**18 cents (ii)

Now, on dividing (i) by (ii):

- 1 wei/ 1 tokenBit = (300000 * 10**18)/ (15 * 10**18)

=> Both 10**18 in numerator and denominator cancel each other out and we are left with:

- 1 wei/ 1 tokenBit = 300000/ 15

=> 1 wei/ 1 tokenBit = pricePerEtherInCents/ pricePerTokenInCents

=> 1 wei = (pricePerEtherInCents/ pricePerTokenInCents) * 1 tokenBit

Thus, formula for calculating how much tokens to send to purchaser for amount of wei received is:
> (pricePerEtherInCents * weiSent) / pricePerTokenInCents

### Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case.

```shell
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```
