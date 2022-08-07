// SPDX-License-Identifier: MIT
pragma solidity >=0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract CrowdSale is Ownable, ReentrancyGuard {

    using SafeERC20 for IERC20;
    IERC20 private token;

    uint256 private pricePerEtherInCents;
    address payable private beneficiary;

    uint256 public tokensSold;
    uint256 public weiRaised;
    uint256 public totalTokensToSell;

    enum SaleStages { PreSale, SeedSale, FinalSale }
    SaleStages private saleStage;

    mapping(SaleStages => uint256) private tokensAvailableForStage;
    mapping(SaleStages => uint256) private pricePerTokenForStage;

    event TokensPurchased(
        address indexed purchaser,
        uint256 value
    );

    event SaleStageFinished(
        SaleStages indexed _stage,
        uint256 time
    );

    constructor(
        IERC20 _token,
        address _beneficiary,
        uint256 _pricePerEther,
        uint256 _tokensForPreSale,
        uint256 _tokensForSeedSale,
        uint256 _tokensForFinalSale,
        uint256 _priceForPreSale,
        uint256 _priceForSeedSale,
        uint256 _priceForFinalSale
    ) {
        require(
            address(_token) != address(0),
            "CrowdSale: token cannot be null address"
        );
        require(
            _beneficiary != address(0),
            "CrowdSale: beneficiary cannot be null address"
        );

        // Set saleStage to PreSale
        saleStage = SaleStages.PreSale;

        token = _token;
        beneficiary = payable(_beneficiary);
        pricePerEtherInCents = _pricePerEther;

        tokensAvailableForStage[SaleStages.PreSale] = _tokensForPreSale;
        tokensAvailableForStage[SaleStages.SeedSale] = _tokensForSeedSale;
        tokensAvailableForStage[SaleStages.FinalSale] = _tokensForFinalSale;

        pricePerTokenForStage[SaleStages.PreSale] = _priceForPreSale;
        pricePerTokenForStage[SaleStages.SeedSale] = _priceForSeedSale;
        pricePerTokenForStage[SaleStages.FinalSale] = _priceForFinalSale;

        totalTokensToSell = _tokensForPreSale + _tokensForSeedSale + _tokensForFinalSale;
    }

    receive() external payable {
        buyTokens();
    }

    function buyTokens() public payable nonReentrant {
        require(
            tokensSold < totalTokensToSell,
            "CrowdSale: All available tokens already sold!"
        );

        uint256 weiReceived = msg.value;

        // Check wei required to buy all available tokens for current stage.
        uint256 availableTokens = availableTokensForCurrentStage();
        uint256 weiRequired = (pricePerTokenForStage[saleStage] * availableTokens * 10**9) / pricePerEtherInCents;
        
        uint256 returnAmount;
        uint256 tokensToSend;

        // If purchaser sent more wei than required, then send the extra wei back.
        if (weiReceived > weiRequired) {
            returnAmount = weiReceived - weiRequired;
            tokensToSend = availableTokens;
        } else {
            weiRequired = weiReceived;
            tokensToSend = (pricePerEtherInCents * weiRequired) / (pricePerTokenForStage[saleStage] * 10**9);
        }

        // Transfer the tokens to the purchaser.
        token.safeTransfer(msg.sender, tokensToSend);
        emit TokensPurchased(msg.sender, tokensToSend);
        
        // If there is wei to send back to purchaser, then send it back and
        // emit the SaleStageFinished event for current stage as all its tokens are sold.
        if (returnAmount > 0) {
            payable(msg.sender).transfer(returnAmount);
            emit SaleStageFinished(saleStage, block.timestamp);

            // Update the saleStage to next stage.
            if (saleStage != SaleStages.FinalSale)
                saleStage = SaleStages(uint8(saleStage) + 1);
        }

        // Transfer the wei received to beneficiary account.
        beneficiary.transfer(weiRequired);
        
        // Update values.
        weiRaised += weiRequired;
        tokensSold += tokensToSend;
    }

    function currentSaleStage() public view returns(SaleStages _stage) {
        return saleStage;
    }

    function availableTokensForCurrentStage() public view returns(uint256) {
        SaleStages _stage = currentSaleStage();

        uint256 maxTokens;

        if (_stage == SaleStages.PreSale) {
            maxTokens = tokensAvailableForStage[SaleStages.PreSale];
        } else if (_stage == SaleStages.SeedSale) {
            maxTokens = (
                tokensAvailableForStage[SaleStages.PreSale] +
                tokensAvailableForStage[SaleStages.SeedSale]
            );
        } else if (_stage == SaleStages.FinalSale) {
            maxTokens = totalTokensToSell;
        }

        return maxTokens - tokensSold;
    }
    
    function currentTokenPriceInCents() external view returns(uint256) {
        return pricePerTokenForStage[currentSaleStage()];
    }

}
