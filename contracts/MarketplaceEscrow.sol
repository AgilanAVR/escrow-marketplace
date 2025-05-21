// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MarketplaceEscrow is ReentrancyGuard {
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    enum Status { Listed, Sold, Confirmed, Disputed, Refunded }

    struct Item {
        string name;
        uint256 price;
        address payable seller;
        address payable buyer;
        Status status;
    }

    mapping(string => Item) public items;
    mapping(string => bool) public itemExists; // to ensure the uniqueness

    event ItemListed(string name, uint256 price, address seller);
    event ItemPurchased(string name, address buyer);
    event ItemConfirmed(string name);
    event DisputeRaised(string name);
    event RefundIssued(string name);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this");
        _;
    }

    modifier onlyBuyer(string memory itemName) {
        require(msg.sender == items[itemName].buyer, "Only buyer can call this");
        _;
    }

    modifier onlySeller(string memory itemName) {
        require(msg.sender == items[itemName].seller, "Only seller can call this");
        _;
    }

    // Seller lists an item
    function listItem(string memory itemName, uint256 price) external {
        require(!itemExists[itemName], "Item name must be unique");
        require(price > 0, "Price must be greater than 0");

        items[itemName] = Item({
            name: itemName,
            price: price * 1 ether,
            seller: payable(msg.sender),
            buyer: payable(address(0)),
            status: Status.Listed
        });

        itemExists[itemName] = true;

        emit ItemListed(itemName, price, msg.sender);
    }

    // Buyer buys an item (funds go into escrow)
    function buy(string memory itemName) external payable nonReentrant {
        Item storage item = items[itemName];
        require(itemExists[itemName], "Item not found");
        require(item.status == Status.Listed || item.status == Status.Refunded, "Item not available for purchase");
        require(msg.value == item.price, "Incorrect payment amount");

        item.buyer = payable(msg.sender);
        item.status = Status.Sold;

        emit ItemPurchased(itemName, msg.sender);
    }

    // Buyer confirms receipt, funds are released to seller
    function confirmReceipt(string memory itemName) external onlyBuyer(itemName) nonReentrant {
        Item storage item = items[itemName];
        require(item.status == Status.Sold, "Item not in correct state");

        item.status = Status.Confirmed;
        (bool success, ) = item.seller.call{value: item.price}("");
        require(success, "Payment to seller failed");

        emit ItemConfirmed(itemName);
    }

    // Buyer can raise a dispute
    function raiseDispute(string memory itemName) external onlyBuyer(itemName) {
        Item storage item = items[itemName];
        require(item.status == Status.Sold, "Dispute not valid");

        item.status = Status.Disputed;

        emit DisputeRaised(itemName);
    }

    // Admin resolves dispute and refunds the buyer
    function refundBuyer(string memory itemName) external onlyAdmin nonReentrant {
        Item storage item = items[itemName];
        require(item.status == Status.Disputed, "Item not disputed");

        address payable buyerToRefund = item.buyer;
        item.buyer = payable(address(0));
        item.status = Status.Refunded;

        (bool success, ) = buyerToRefund.call{value: item.price}("");
        require(success, "Refund to buyer failed");

        emit RefundIssued(itemName);
    }

    // Utility view function
    function getItemDetails(string memory itemName) external view returns (
        uint256 price,
        address seller,
        address buyer,
        Status status
    ) {
        Item memory item = items[itemName];
        return (item.price, item.seller, item.buyer, item.status);
    }

    // Prevent accidental ETH transfers
    receive() external payable {
        revert("Direct payments not allowed");
    }

    fallback() external payable {
        revert("Invalid function call");
    }
}
