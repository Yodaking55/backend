const { ethers } = require("ethers");
//Environment Setup

env = require("./config/env.prod.json");

global.env = env;
require("./config/database");

// Connect to Ethereum node
const provider = new ethers.providers.JsonRpcProvider(env.ICB_RPC_URL);

//Import model
const blockchainTransactionsModel = require("./modules/transactions/model/blockchainTransactions");

async function getBlockchainTransactions() {
  try {
    // Get the record from block model
    let modelData = await blockchainTransactionsModel
      .findOne({ type: "LIVE" })
      .sort({ dateCreated: 1 });

    if (!modelData) {
      modelData = await blockchainTransactionsModel.create({
        total_trxn: 0,
        startBlockNumber: 0,
        lastBlockNumber: 0,
        type: "LIVE",
      });
    }

    let latestBlockNumber = await provider.getBlockNumber();
    let startCount = Number(modelData.lastBlockNumber) + 1;
    let endCount =
      latestBlockNumber < startCount + 100
        ? latestBlockNumber
        : 100 + startCount;

    // Loop through blocks and count transactions
    for (let i = startCount; i <= endCount; i++) {
      // console.log(i,startCount,endCount)
      const block = await provider.getBlock(i);
      if (block.transactions.length > 0) {
        const currentBlockTransactionCount = block.transactions.length;

        //update count in database
        await blockchainTransactionsModel.updateOne(
          {},
          {
            $inc: { total_trxn: currentBlockTransactionCount },
            lastBlockNumber: i,
          }
        );
      }
      if (i == endCount) {
        console.log(endCount, "end Count");
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
    getBlockchainTransactions();
  }
}
getBlockchainTransactions();
