const express = require("express");
const router = express.Router();

//Controller
const blockchainTransactionsController = require("./controller/blockchainTransactions");
const blockchainProjectsController =  require("./controller/blockchainProjects");

//public routes
router.get('/blockchainTrxnData/view', blockchainTransactionsController.view);


module.exports = router;