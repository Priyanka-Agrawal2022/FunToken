// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

import "./MPToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Marketplace {
    // The token being sold
    MPToken public token;

    // Address where funds are collected
    address payable public wallet;

    // How many token units a gets per wei
    uint256 public rate;

    // Amount of wei raised
    uint256 public weiRaised;

    /**
    * Event for token purchase logging
    * @param purchaser who paid for the tokens
    * @param beneficiary who got the tokens
    * @param value weis paid for purchase
    * @param tokenAmount amount of tokens purchased
    */
    event TokenPurchase(
        address indexed purchaser,
        address indexed beneficiary,
        uint256 value,
        uint256 tokenAmount
    );

    /**
    * @param _rate number of tokens units a buyer gets per wei
    * @param _wallet address where collected funds will be forwarded to
    * @param _token address of token being sold
    */
    constructor(uint256 _rate, address payable _wallet, MPToken _token) public {
        require(_rate > 0);
        require(_wallet != address(0));

        rate = _rate;
        wallet = _wallet;
        token = _token;
    }

    /**
    * @dev fallback function
    */
    fallback() external payable {
        buyTokens(msg.sender);
    }

    /**
    * @dev low level token purchase
    * @param _beneficiary address performing the token purchase
    */
    function buyTokens(address _beneficiary) public payable returns (uint256 tokenAmount) {
        uint256 weiAmount = msg.value;

        // Calculate token amount to be created
        uint256 tokenAmount = _getTokenAmount(weiAmount);

        _preValidatePurchase(_beneficiary, weiAmount, tokenAmount);

        // Update state
        weiRaised += weiAmount;

        _processPurchase(_beneficiary, tokenAmount);

        emit TokenPurchase(
            msg.sender,
            _beneficiary,
            weiAmount,
            tokenAmount
        );

        _updatePurchasingState(_beneficiary, weiAmount);

        _forwardFunds();
        _postValidatePurchase(_beneficiary, weiAmount);

        return tokenAmount;
    }

    /**
    * @dev validation of an incoming purchase. Use require statements to revert state when conditions are met
    * @param _beneficiary address performing the token purchase
    * @param _weiAmount value in wei involved in the purchase
    */
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount, uint256 tokenAmount) internal view {
        require(_beneficiary != address(0));
        require(_weiAmount > 0, "You need to send some MATIC to proceed");

        uint256 marketplaceBalance = token.balanceOf(address(this));
        require(marketplaceBalance >= tokenAmount, "Marketplace has insufficient tokens");
    }

    /**
    * @dev validation of an executed purchase. Observe state and use revert statements to undo rollback when valid conditions are not met
    * @param _beneficiary address performing the token purchase
    * @param _weiAmount value in wei involved in the purchase
    */
    function _postValidatePurchase(address _beneficiary, uint256 _weiAmount) internal {}

    /**
    * @dev source os tokens. Override this method to modify the way in which the Marketplace ultimately gets and sends its tokens
    * @param _beneficiary address performing the token purchase
    * @param _tokenAmount number of tokens to be emitted
    */
    function _deliverTokens(address _beneficiary, uint256 _tokenAmount) internal {
        (bool sent) = token.transfer(_beneficiary, _tokenAmount);
        require(sent, "Failed to transfer tokens to user");
    }

    /**
    * @dev executed when a purchase has been validated and is ready to be executed. Not necessarily emits/sends tokens
    * @param _beneficiary address receiving the tokens
    * @param _tokenAmount number of tokens to be purchased
    */
    function _processPurchase(address _beneficiary, uint256 _tokenAmount) internal {
        _deliverTokens(_beneficiary, _tokenAmount);
    }

    /**
    * @dev override for extensions that require an internal state to check for validity (current user contributions, etc.) 
    * @param _beneficiary address receiving the tokens
    * @param _weiAmount value in wei involved in the purchase
    */
    function _updatePurchasingState(address _beneficiary, uint256 _weiAmount) internal {}

    /**
    * @dev override to extend the way in which ether is converted into tokens
    * @param _weiAmount value in wei to be converted into tokens
    * @return number of tokens that can be purchased with the specified _weiAmount
    */
    function _getTokenAmount(uint256 _weiAmount) internal view returns(uint256) {
        return _weiAmount*rate;
    }

    /**
    * @dev determines how ETH is stored/forwarded on purchases
    */
    function _forwardFunds() internal {
        wallet.transfer(msg.value);
    }
}