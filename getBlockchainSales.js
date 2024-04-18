const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const TronWeb = require("tronweb");

//Environment Setup
let netType = "testnet";

env = require("./config/env.prod.json");
netType = "mainnet";

global.env = env;
// console.log("global.env", env,netType)
require("./config/database");
const redisFunc = require("./utility/redis");
let contractSource = fs.readFileSync(
  path.resolve(__dirname, "icb-ico-abi"),
  "utf8"
);
const blockchainSalesModel = require("./modules/blockchainSales/model/blockchainSales");

let CONTRACT_ADDRESS = global.env.CONTRACT_ADDRESS || [];
async function getSales() {
  for (var i = 0; i < CONTRACT_ADDRESS.length; i++) {
    if (CONTRACT_ADDRESS[i].label == "TRX") {
      const data = await tronConnect(
        CONTRACT_ADDRESS[i].rpcUrl,
        CONTRACT_ADDRESS[i].address
      );
      // console.log("data", data)
      if (data) {
        await updateDatabase(netType, data, i);
      }
    } else {
      const provider = new ethers.JsonRpcProvider(CONTRACT_ADDRESS[i].rpcUrl);
      try {
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS[i].address,
          JSON.stringify(contractSource),
          provider
        );
        // console.log("contract", contract)
        const myBalance = await contract.getTotalSold();
        // console.log("myBalance", myBalance.totalSold)
        await updateDatabase(netType, myBalance, i);
      } catch (e) {
        console.log("error", e);
      }
    }
  }
}
getSales();
setInterval(getSales, 300000);

async function updateDatabase(type, myBalance, i) {
  try {
    let data = await blockchainSalesModel.findOne({ type });
    if (data) {
      // console.log("data",data)
      const labelIndex = data.sales.findIndex(
        (item) => item.label == CONTRACT_ADDRESS[i].label
      );
      // console.log("labelIndex",labelIndex)
      if (labelIndex > -1) {
        // console.log("CONTRACT_ADDRESS[i].label find",CONTRACT_ADDRESS[i].label)
        data.sales[labelIndex].label = CONTRACT_ADDRESS[i].label;
        data.sales[labelIndex].totalSold = myBalance.totalSold;
        data.sales[labelIndex].totalSoldInPrivateSales =
          myBalance.totalSoldInPrivateSales;
        data.sales[labelIndex].totalSoldInPreSale1 =
          myBalance.totalSoldInPreSale1;
        data.sales[labelIndex].totalSoldInPresale2 =
          myBalance.totalSoldInPresale2;
        data.sales[labelIndex].totalSoldInPublicSales =
          myBalance.totalSoldInPublicSales;
      } else {
        // console.log("CONTRACT_ADDRESS[i].label",CONTRACT_ADDRESS[i].label)
        data.sales = [
          ...data.sales,
          {
            label: CONTRACT_ADDRESS[i].label,
            totalSold: BigInt(myBalance.totalSold),
            totalSoldInPrivateSales: BigInt(myBalance.totalSoldInPrivateSales),
            totalSoldInPreSale1: BigInt(myBalance.totalSoldInPreSale1),
            totalSoldInPresale2: BigInt(myBalance.totalSoldInPresale2),
            totalSoldInPublicSales: BigInt(myBalance.totalSoldInPublicSales),
          },
        ];
      }
      // blockchainSalesModel.findOne({ type: "testnet" })
      // $set: { 'myArray.$.value': 'newValue' }
      const newData = await blockchainSalesModel.updateOne(
        { type },
        { $set: { sales: data.sales } },
        { new: true }
      );
      const setData = await redisFunc.setString(
        netType,
        JSON.stringify(data.sales)
      );
      console.log("setData========>", setData);
      console.log("newData====>", newData);
    } else {
      const newData = await blockchainSalesModel.create({
        type,
        sales: [
          {
            label: CONTRACT_ADDRESS[i].label,
            totalSold: myBalance.totalSold,
            totalSoldInPrivateSales: myBalance.totalSoldInPrivateSales,
            totalSoldInPreSale1: myBalance.totalSoldInPreSale1,
            totalSoldInPresale2: myBalance.totalSoldInPresale2,
            totalSoldInPublicSales: myBalance.totalSoldInPublicSales,
          },
        ],
      });
      const setData = await redisFunc.setString(
        netType,
        JSON.stringify([
          {
            label: CONTRACT_ADDRESS[i].label,
            totalSold: BigInt(myBalance.totalSold),
            totalSoldInPrivateSales: BigInt(myBalance.totalSoldInPrivateSales),
            totalSoldInPreSale1: BigInt(myBalance.totalSoldInPreSale1),
            totalSoldInPresale2: BigInt(myBalance.totalSoldInPresale2),
            totalSoldInPublicSales: BigInt(myBalance.totalSoldInPublicSales),
          },
        ])
      );
      console.log("sCreratedetData========>", setData);
      console.log("CreatednewData", newData);
    }
  } catch (e) {
    console.log("error database insert", e);
  }
}
const hexAddressToBase58 = (hexAddress, tronWeb) => {
  const HEX_PREFIX = "41";
  let retval = hexAddress;
  try {
    if (hexAddress.startsWith("0x")) {
      hexAddress = HEX_PREFIX + hexAddress.substring(2);
    }
    let bArr = tronWeb.utils["code"].hexStr2byteArray(hexAddress);
    retval = tronWeb.utils["crypto"].getBase58CheckAddress(bArr);
  } catch (e) {
    //Handle
    // console.log("e", e)
    // return false;
  }
  return retval;
};

async function tronConnect(url, contractAddress) {
  try {
    let HttpProvider = TronWeb.providers.HttpProvider;
    let fullNode = new HttpProvider(url);
    let solidityNode = new HttpProvider(url);
    let eventServer = new HttpProvider(url);
    let tronweb = new TronWeb(fullNode, solidityNode, eventServer);
    // console.log("tronweb")
    let hexAddress = await hexAddressToBase58(contractAddress, tronweb);
    // console.log("hexAddress",hexAddress)
    if (!hexAddress) return false;
    console.log(hexAddress, "<======hexAddress");
    let contract = await tronweb.contract().at(hexAddress);
    tronweb.setAddress(hexAddress);
    // console.log("GettingContract", contract);
    const result = await contract.getTotalSold().call();
    // console.log('Method result:', result, result.totalSold.toString(), result.toString());
    return {
      totalSold: result.totalSold.toString(),
      totalSoldInPrivateSales: result.totalSoldInPrivateSales.toString(),
      totalSoldInPreSale1: result.totalSoldInPreSale1.toString(),
      totalSoldInPresale2: result.totalSoldInPresale2.toString(),
      totalSoldInPublicSales: result.totalSoldInPublicSales.toString(),
    };
  } catch (error) {
    // callback && callback(error, null);
    // reject(error);
    console.error("trigger smart contract error", error);
    return false;
  }
}
