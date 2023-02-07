// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

import "./FunToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is Ownable {
    // The token being sold
    FunToken public token;

    // Address where funds are collected
    address payable public wallet;

    // How many token units the user gets per wei
    uint256 public rate;

    // Amount of wei raised
    uint256 public weiRaised;

    /**
     * Event for token purchase logging.
     * @param buyer who paid for the tokens
     * @param beneficiary who got the tokens
     * @param value weis paid for purchase
     * @param tokenAmount amount of tokens purchased
     */
    event TokenPurchase(
        address indexed buyer,
        address indexed beneficiary,
        uint256 value,
        uint256 tokenAmount
    );

    event TokenSell(
        address indexed seller,
        uint256 amountOfMATICToTransfer,
        uint256 tokenAmountToSell
    );

    /**
     * @param _rate number of tokens units a buyer gets per wei
     * @param _wallet address where collected funds will be forwarded to
     * @param _token address of token being sold
     */
    constructor(uint256 _rate, address payable _wallet, FunToken _token) {
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
     * @dev receive ether function
     */
    receive() external payable {
        buyTokens(msg.sender);
    }

    /**
     * @dev Low level token purchase.
     * @param _buyer address performing the token purchase
     * @return _tokenAmount number of tokens the user purchased
     */
    function buyTokens(
        address _buyer
    ) public payable returns (uint256 _tokenAmount) {
        uint256 weiAmount = msg.value;

        // Calculate token amount to be created
        uint256 tokenAmount = _getTokenAmount(weiAmount);

        _preValidatePurchase(_buyer, weiAmount, tokenAmount);

        // Update state
        weiRaised += weiAmount;

        _processPurchase(_buyer, tokenAmount);

        emit TokenPurchase(msg.sender, _buyer, weiAmount, tokenAmount);

        _updatePurchasingState(_buyer, weiAmount);

        _forwardFunds();
        _postValidatePurchase(_buyer, weiAmount);

        return tokenAmount;
    }

    /**
     * @dev Validation of an incoming purchase. Use require statements to revert state when conditions are met.
     * @param _buyer address performing the token purchase
     * @param _weiAmount value in wei involved in the purchase
     */
    function _preValidatePurchase(
        address _buyer,
        uint256 _weiAmount,
        uint256 tokenAmount
    ) internal view {
        // Also add logic to confirm that user sends MATIC
        require(_buyer != address(0));
        require(_weiAmount > 0, "You need to send some MATIC to proceed");

        uint256 marketplaceBalance = token.balanceOf(address(this));
        require(
            marketplaceBalance >= tokenAmount,
            "Marketplace has insufficient tokens"
        );
    }

    /**
     * @dev Validation of an executed purchase. Observe state and use revert statements to undo rollback when valid conditions are not met.
     * @param _buyer address performing the token purchase
     * @param _weiAmount value in wei involved in the purchase
     */
    function _postValidatePurchase(
        address _buyer,
        uint256 _weiAmount
    ) internal {}

    /**
     * @dev Source of tokens. Override this method to modify the way in which the Marketplace ultimately gets and sends its tokens.
     * @param _buyer address performing the token purchase
     * @param _tokenAmount number of tokens to be emitted
     */
    function _deliverTokens(address _buyer, uint256 _tokenAmount) internal {
        bool sent = token.transfer(_buyer, _tokenAmount);
        require(sent, "Failed to transfer tokens to user");
    }

    /**
     * @dev Executed when a purchase has been validated and is ready to be executed. Not necessarily emits/sends tokens.
     * @param _buyer address receiving the tokens
     * @param _tokenAmount number of tokens to be purchased
     */
    function _processPurchase(address _buyer, uint256 _tokenAmount) internal {
        _deliverTokens(_buyer, _tokenAmount);
    }

    /**
     * @dev Override for extensions that require an internal state to check for validity. (current user contributions, etc.)
     * @param _buyer address receiving the tokens
     * @param _weiAmount value in wei involved in the purchase
     */
    function _updatePurchasingState(
        address _buyer,
        uint256 _weiAmount
    ) internal {}

    /**
     * @dev Override to extend the way in which MATIC is converted into tokens.
     * @param _weiAmount value in wei to be converted into tokens
     * @return number of tokens that can be purchased with the specified _weiAmount
     */
    function _getTokenAmount(
        uint256 _weiAmount
    ) internal view returns (uint256) {
        return _weiAmount * rate;
    }

    /**
     * @dev Determines how MATIC is stored/forwarded on purchases.
     */
    function _forwardFunds() internal {
        // wallet.transfer(msg.value);
    }

    /**
     * @dev Low level token selling. To sell tokens to Marketplace the user must allow Marketplace to transfer the amount of tokens the user wants to sell
     * @param tokenAmountToSell amount of tokens the user wants to sell
     */
    function sellTokens(uint256 tokenAmountToSell) public {
        require(
            tokenAmountToSell > 0,
            "Specify an amount of token greater than zero"
        );

        uint256 userBalance = token.balanceOf(msg.sender);
        require(
            userBalance >= tokenAmountToSell,
            "You have insufficient tokens"
        );

        uint256 amountOfMATICToTransfer = tokenAmountToSell / rate;
        uint256 marketplaceMATICBalance = address(this).balance;
        require(
            marketplaceMATICBalance >= amountOfMATICToTransfer,
            "Marketplace has insufficient funds"
        );

        bool sent = token.transferFrom(
            msg.sender,
            address(this),
            tokenAmountToSell
        );
        require(sent, "Failed to transfer tokens from user to Marketplace");

        (sent, ) = msg.sender.call{value: amountOfMATICToTransfer}("");
        require(sent, "Failed to send MATIC to the user");

        emit TokenSell(msg.sender, amountOfMATICToTransfer, tokenAmountToSell);
    }

    /**
     * @dev This function can only be run by the owner of the contract.
     * This function allows the owner to send all the MATIC stored in the Marketplace smart contract into the owner’s wallet.
     */
    function withdraw() public onlyOwner {
        uint256 marketplaceBalance = address(this).balance;
        require(marketplaceBalance > 0, "No MATIC present in Marketplace");

        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to withdraw");
    }
}