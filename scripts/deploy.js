const hre = require("hardhat");

async function main() {
  const Marketplace = await hre.ethers.getContractFactory("MarketplaceEscrow");
  const contract = await Marketplace.deploy();

  await contract.waitForDeployment(); 
  console.log("MarketplaceEscrow deployed to:", contract.target); 
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
