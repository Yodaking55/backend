//response function
const response = require("../../../utility/response");

//Import model
const blockchainProjectsModel = require("../model/blockchainProjects");

module.exports = {
  view: async (req, res) => {
    try {
      //View admin details
      blockchainProjectsModel
        .findOne({ type: "LIVE" })
        .select("total_projects")
        .then(async (resdata) => {
          response.sendSuccessResponse(
            { data: resdata, message: "VIEW_TRXN_SUCCESSFULLY" },
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
