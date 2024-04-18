//response function
const response = require("../../../utility/response");

//Import model
const blockchainTransactionsModel = require("../model/blockchainTransactions");
const blockchainProjectsModel = require("../model/blockchainProjects");

module.exports = {
  view: async (req, res) => {
    try {
      //View admin details
      const data = await blockchainProjectsModel
        .findOne({ type: "LIVE" })
        .select("total_projects");
      blockchainTransactionsModel
        .findOne({ type: "LIVE" })
        .select("total_trxn")
        .then(async (resdata) => {
          response.sendSuccessResponse(
            {
              data: {
                total_trxn: resdata?.total_trxn || 0,
                total_projects: data?.total_projects || 0,
              },
              message: "VIEW_TRXN_SUCCESSFULLY",
            },
            res
          );
        })
        .catch((error) => {
          response.sendErrorResponse(error, res);
        });
    } catch (error) {
      response.sendErrorResponse(error, res);
    }
  },
};
