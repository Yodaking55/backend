const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const TronWeb = require("tronweb");

//Environment Setup
let netType = "testnet";

env = require("./config/env.prod.json");
netType = "Mainnet";

global.env = env;
require("./config/database");
let contractSource = fs.readFileSync(
  path.resolve(__dirname, "icb-ico-abi"),
  "utf8"
);
const blockchainTrxnModel = require("./modules/blockchainTrxn/model/blockchainTrxn");
// console.log("global.env", global.env)
let CONTRACT_ADDRESS = global.env.CONTRACT_ADDRESS || [];
// console.log("CONTRACT_ADDRESS", CONTRACT_ADDRESS)

try {
  const provider = new ethers.JsonRpcProvider(CONTRACT_ADDRESS[0].rpcUrl);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS[0].address,
    JSON.stringify(contractSource),
    provider
  );
  // console.log("contract", contract)
  contract.on(
    "BuyWithToken",
    (userAddress, packageAmounts, userIcbAmounts, SaleType) => {
      console.log(
        userAddress.toString(),
        packageAmounts.toString(),
        userIcbAmounts.toString(),
        SaleType.toString()
      );

      updateTrxn(
        userAddress.toString(),
        packageAmounts.toString(),
        userIcbAmounts.toString(),
        SaleType,
        "Token",
        "ETH"
      );
    }
  );
  contract.on(
    "BuyWithNative",
    (userAddress, packageAmounts, userIcbAmounts, SaleType) => {
      console.log(
        userAddress.toString(),
        packageAmounts.toString(),
        userIcbAmounts.toString(),
        SaleType.toString()
      );
      updateTrxn(
        userAddress.toString(),
        packageAmounts.toString(),
        userIcbAmounts.toString(),
        SaleType,
        "Native",
        "ETH"
      );
    }
  );
} catch (e) {
  console.log("ETH Error", e);
}

try {
  const providerBNB = new ethers.JsonRpcProvider(CONTRACT_ADDRESS[1].rpcUrl);
  const contractBNB = new ethers.Contract(
    CONTRACT_ADDRESS[1].address,
    JSON.stringify(contractSource),
    providerBNB
  );
  // console.log("contractBNB", contractBNB)
  contractBNB.on(
    "BuyWithToken",
    (userAddress, packageAmounts, userIcbAmounts, SaleType) => {
      console.log(
        "BNB",
        userAddress.toString(),
        packageAmounts.toString(),
        userIcbAmounts.toString(),
        SaleType.toString()
      );

      updateTrxn(
        userAddress.toString(),
        packageAmounts.toString(),
        userIcbAmounts.toString(),
        SaleType,
        "Token",
        "BNB"
      );
    }
  );
  contractBNB.on(
    "BuyWithNative",
    (userAddress, packageAmounts, userIcbAmounts, SaleType) => {
      console.log(
        "BNB",
        userAddress.toString(),
        packageAmounts.toString(),
        userIcbAmounts.toString(),
        SaleType.toString()
      );
      updateTrxn(
        userAddress.toString(),
        packageAmounts.toString(),
        userIcbAmounts.toString(),
        SaleType,
        "Native",
        "BNB"
      );
    }
  );
} catch (e) {
  console.log("BNB Error", e);
}

try {
  const providerMATIC = new ethers.JsonRpcProvider(CONTRACT_ADDRESS[2].rpcUrl);
  const contractMATIC = new ethers.Contract(
    CONTRACT_ADDRESS[2].address,
    JSON.stringify(contractSource),
    providerMATIC
  );
  // console.log("contractMATIC", contractMATIC)
  contractMATIC.on(
    "BuyWithToken",
    (userAddress, packageAmounts, userIcbAmounts, SaleType) => {
      console.log(
        "MATIC",
        userAddress.toString(),
        packageAmounts.toString(),
        userIcbAmounts.toString(),
        SaleType.toString()
      );

      updateTrxn(
        userAddress.toString(),
        packageAmounts.toString(),
        userIcbAmounts.toString(),
        SaleType,
        "Token",
        "MATIC"
      );
    }
  );
  contractMATIC.on(
    "BuyWithNative",
    (userAddress, packageAmounts, userIcbAmounts, SaleType) => {
      console.log(
        "MATIC",
        userAddress.toString(),
        packageAmounts.toString(),
        userIcbAmounts.toString(),
        SaleType.toString()
      );
      updateTrxn(
        userAddress.toString(),
        packageAmounts.toString(),
        userIcbAmounts.toString(),
        SaleType,
        "Native",
        "MATIC"
      );
    }
  );
} catch (e) {
  console.log("MATIC error", e);
}

async function trx() {
  try {
    let url = CONTRACT_ADDRESS[3].rpcUrl;
    let contractAddress = CONTRACT_ADDRESS[3].address;
    let HttpProvider = TronWeb.providers.HttpProvider;
    let fullNode = new HttpProvider(url);
    let solidityNode = new HttpProvider(url);
    let eventServer = new HttpProvider(url);
    let tronweb = new TronWeb(fullNode, solidityNode, eventServer);
    let contract = await tronweb.contract().at(contractAddress);
    tronweb.setAddress(contractAddress);
    contract.BuyWithToken().watch((err, event) => {
      if (err) {
        console.error('Error with "Message BuyWithToken" event:', err);
        trx();
      } else {
        const trxHexWalletAddress = TronWeb.address.fromHex(
          event.result.user.toString()
        );
        console.group("New event received BuyWithToken", event, event.result);
        updateTrxn(
          event.result.user.toString(),
          event.result.packageAmounts.toString(),
          event.result.userIcbAmounts.toString(),
          event.result.currentSalePhase.toString(),
          "Token",
          "TRX",
          trxHexWalletAddress
        );
        trx();
      }
    });

    // contract.BuyWithNative().watch((err, event) => {
    //     if (err) {
    //         console.error('Error BuyWithNative with "Message" event:', err)
    //     } else {
    //         console.group('New event received BuyWithNative', event);
    //         updateTrxn(event.result.user.toString(), event.result.packageAmounts.toString(), event.result.userIcbAmounts.toString(), event.result.currentSalePhase.toString(), "Native", "TRX")
    //     }

    // });
  } catch (e) {
    console.log("TRX error", e);
  }
}
trx();

// updateTrxn("0x182978FE1C1d5C6a7777cDfA69F7B0b64F517A25", "441582168118503", "1639", "2", "Native", "ETH")
async function updateTrxn(
  walletAddress,
  packageAmounts,
  userIcbAmounts,
  SaleType,
  type,
  chain,
  trxHexWalletAddress = ""
) {
  console.log(
    "SaleTypestart",
    walletAddress,
    packageAmounts,
    userIcbAmounts,
    SaleType,
    type,
    chain
  );
  let SaleTypeData = "";
  if (SaleType == "1") {
    SaleTypeData = "privateSale";
  } else if (SaleType == "2") {
    SaleTypeData = "preSale1";
  } else if (SaleType == "3") {
    SaleTypeData = "preSale2";
  } else if (SaleType == "4") {
    SaleTypeData = "publicSale";
  }
  console.log(
    "SaleType",
    SaleType,
    walletAddress,
    packageAmounts,
    userIcbAmounts,
    SaleType,
    type,
    chain,
    SaleTypeData,
    trxHexWalletAddress
  );
  // console.log("SaleTypeData", SaleTypeData)
  try {
    const newData = await blockchainTrxnModel.create({
      walletAddress,
      packageAmounts,
      userIcbAmounts,
      SaleType: SaleTypeData,
      type,
      chain,
      isReferral: false,
      trxHexWalletAddress,
    });
  } catch (e) {
    console.log("blockchainBuyTrxnSchema", e);
  }
}
