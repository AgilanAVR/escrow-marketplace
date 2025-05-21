# 🛡️ Escrow Smart Contract for Online Marketplace

## 📌 Project Overview

This project implements an **Escrow Service Smart Contract** for an online marketplace using **Solidity**. The purpose of this contract is to ensure secure transactions between buyers and sellers by holding the buyer’s payment in escrow until the goods are received and confirmed.

### ✅ Features Implemented:
- Sellers can list items with a **unique name** and a **price**.
- Buyers can purchase items by paying the exact price in **ETH**.
- Funds are held in **escrow** until the buyer confirms receipt.
- Dispute resolution mechanism handled by the **admin**.
- Contract prevents **accidental ETH transfers** using `receive()` and `fallback()` functions.
- Built-in **event emitters** for all major actions (listing, buying, confirming, refunding).
- Smart contract is **fully tested** and deployed on the **Hardhat local blockchain**.

---

## ⚙️ Development and Testing Environment

The smart contract is written in **Solidity (`^0.8.3`)** and tested using:

- [Hardhat](https://hardhat.org) - Local Ethereum development environment
- [Chai](https://www.chaijs.com/) + [Ethers.js](https://docs.ethers.org/) for assertions and blockchain interaction
- Node.js for package management

---

## 🚀 How to Run This Project Locally (Using Hardhat)

### 🔧 Prerequisites

- Node.js (v16+ recommended)
- npm (v7+)
- Git (optional)

---

### 📦 Step-by-Step Installation

 ***Run the Smart Contract on Remix IDE or follow the steps below to use Hardhat locally.***

1. Clone the Repository

2. Install Dependencies -- > npm install

3. Compile the Contract -- > npx hardhat compile

4. Start a Local Blockchain Node -- > npx hardhat node

5. Deploy to Local Blockchain -- > npx hardhat run scripts/deploy.js --network localhost






