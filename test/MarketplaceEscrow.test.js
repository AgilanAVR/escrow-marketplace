const { expect } = require("chai");

describe("MarketplaceEscrow", function () {
  let contract;
  let admin, seller, buyer;
  const itemName = "punk";
  const itemPrice = ethers.parseEther("2");

  beforeEach(async function () {
    [admin, seller, buyer, other] = await ethers.getSigners();
    const Marketplace = await ethers.getContractFactory("MarketplaceEscrow");
    contract = await Marketplace.connect(admin).deploy();
    await contract.waitForDeployment();
  });

  it("should let seller list an item", async function () {
    await contract.connect(seller).listItem(itemName, 2);
    const details = await contract.getItemDetails(itemName);
    expect(details.price).to.equal(itemPrice);
    expect(details.seller).to.equal(seller.address);
  });

  it("should allow buyer to purchase the item", async function () {
    await contract.connect(seller).listItem(itemName, 2);
    await contract.connect(buyer).buy(itemName, { value: itemPrice });
    const details = await contract.getItemDetails(itemName);
    expect(details.buyer).to.equal(buyer.address);
    expect(details.status).to.equal(1); // Status.Sold
  });

  it("should confirm receipt and release funds to seller", async function () {
    await contract.connect(seller).listItem(itemName, 2);

    await contract.connect(buyer).buy(itemName, { value: itemPrice });

    const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
    const tx = await contract.connect(buyer).confirmReceipt(itemName);
    const receipt = await tx.wait();

    const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
    expect(sellerBalanceAfter).to.be.above(sellerBalanceBefore);

    const details = await contract.getItemDetails(itemName);
    expect(details.status).to.equal(2); // Status.Confirmed
  });

  it("should allow buyer to raise dispute", async function () {
    await contract.connect(seller).listItem(itemName, 2);
    await contract.connect(buyer).buy(itemName, { value: itemPrice });
    await contract.connect(buyer).raiseDispute(itemName);
    const details = await contract.getItemDetails(itemName);
    expect(details.status).to.equal(3); // Status.Disputed
  });

  it("should allow admin to refund buyer", async function () {
    await contract.connect(seller).listItem(itemName, 2);
    await contract.connect(buyer).buy(itemName, { value: itemPrice });
    await contract.connect(buyer).raiseDispute(itemName);

    const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

    const tx = await contract.connect(admin).refundBuyer(itemName);
    await tx.wait();

    const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
    expect(buyerBalanceAfter).to.be.above(buyerBalanceBefore);

    const details = await contract.getItemDetails(itemName);
    expect(details.status).to.equal(4); // Status.Refunded
  });

  it("should revert direct ETH transfers", async function () {
    await expect(
      buyer.sendTransaction({ to: contract.target, value: ethers.parseEther("1") })
    ).to.be.revertedWith("Direct payments not allowed");
  });
});
