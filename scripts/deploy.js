const hre = require("hardhat");

async function main() {
  const Marketplace = await hre.ethers.getContractFactory("MarketplaceEscrow");
  const contract = await Marketplace.deploy();

  await contract.waitForDeployment(); // ← use this instead of deployed()
  console.log("MarketplaceEscrow deployed to:", contract.target); // use contract.target instead of contract.address
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
