const { ethers } = require("ethers");
//Environment Setup

env = require("./config/env.prod.json");

global.env = env;
console.log("env.ICB_RPC_URL==>", env.ICB_RPC_URL);
require("./config/database");

// Connect to Ethereum nod
const provider = new ethers.providers.JsonRpcProvider(env.ICB_RPC_URL);

//Import model
const blockchainProjectsModel = require("./modules/transactions/model/blockchainProjects");

async function getBlockchainProjects() {
  try {
    // Get the record from block model
    let modelData = await blockchainProjectsModel
      .findOne({ type: "LIVE" })
      .sort({ dateCreated: 1 });
    if (!modelData) {
      modelData = await blockchainProjectsModel.create({
        total_projects: 0,
        startBlockNumber: 0,
        lastBlockNumber: 0,
        type: "LIVE",
      });
    }

    let latestBlockNumber = await provider.getBlockNumber();
    console.log("latestBlockNumber===>", latestBlockNumber);
    let startCount = Number(modelData.lastBlockNumber) + 1;
    // let startCount = 91068;
    let endCount =
      latestBlockNumber < startCount + 100
        ? latestBlockNumber
        : 100 + startCount;

    // Loop through blocks and count transactions
    for (let i = startCount; i <= endCount; i++) {
      // console.log(i, startCount, endCount)
      const block = await provider.getBlock(i);
      // console.log("block==>",i, block.transactions.length)
      if (block.transactions.length > 0) {
        await blockchainProjectsModel.updateOne(
          {},
          {
            lastBlockNumber: i,
          }
        );
        for (j = 0; j < block.transactions.length; j++) {
          // console.log(j, i, "loop start",block.transactions[j])
          await checkTransactionHash(block.transactions[j], i);
        }
        // console.log(j, i, "loop end")
      }
      if (i == endCount) {
        // console.log(endCount, "end Count");
        startCount = endCount + 1;
        if (endCount + 100 < latestBlockNumber) {
          endCount = endCount + 100;
        } else {
          endCount = latestBlockNumber;
          latestBlockNumber = await provider.getBlockNumber();
        }
        console.log("Start Count=> ", startCount, "End Count=> ", endCount);
      }
    }
  } catch (error) {
    console.error("Error:", error);
    getBlockchainProjects();
  }
}
getBlockchainProjects();

async function testContractAddress(contractAddress, blockNumber) {
  // let contractAddress = "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5";
  const Firsterc20Bytecode = "0x606060";
  const Seconderc20Bytecode = "0x608060";

  async function isERC20Contract(contractAddress) {
    try {
      const contractBytecode = await provider.getCode(contractAddress);
      if (contractBytecode.startsWith(Firsterc20Bytecode)) {
        return true;
      } else if (contractBytecode.startsWith(Seconderc20Bytecode)) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(`Error checking ERC-20 contract: ${error.message}`);
      return false;
    }
  }
  await isERC20Contract(contractAddress)
    .then(async (isERC20) => {
      if (isERC20) {
        await blockchainProjectsModel.updateOne(
          {},
          {
            $inc: { total_projects: 1 },
            lastBlockNumber: blockNumber,
          }
        );
        console.log(`${contractAddress} is an ERC-20 contract.`);
      } else {
        console.log(`${contractAddress} is not an ERC-20 contract.`);
      }
    })
    .catch((err) => {
      console.error("isERC20Contract==>", err);
    });
}

async function checkTransactionHash(transactionHash, blockNumber) {
  async function getContractAddress(transactionHash) {
    try {
      const receipt = await provider.getTransactionReceipt(transactionHash);

      if (receipt && receipt.contractAddress) {
        // console.log("function inside",receipt.contractAddress)
        return receipt.contractAddress;
      } else {
        console.log("Transaction is not a contract deployment.");
        return null;
      }
    } catch (error) {
      console.error(`Error getting contract address: ${error.message}`);
      return null;
    }
  }
  await getContractAddress(transactionHash)
    .then(async (contractAddress) => {
      if (contractAddress) {
        // console.log("contractAddress",contractAddress)
        await testContractAddress(contractAddress, blockNumber);
        console.log(
          `Contract address deployed by the transaction: ${contractAddress}`
        );
        return `Contract address deployed by the transaction: ${contractAddress}`;
      } else {
        console.log("No contract address found for the transaction.");
        return "No contract address found for the transaction.";
      }
    })
    .catch((err) => {
      console.error("getContractAddress==>", err);
    });
}
