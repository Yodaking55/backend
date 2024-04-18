const mongoose = require("mongoose");

let blockchainProjectsSchema = mongoose.Schema(
    {
        total_projects: { type: Number, default: 0 },
        lastBlockNumber: { type: Number, default: 0 },
        startBlockNumber: { type: Number, default: 0 },
        type: { type: String },
        dateCreated: { type: Date, default: Date.now },
        dateCreatedUtc: { type: Date, default: Date.now },
        dateModified: { type: Date },
        dateModifiedUtc: { type: Date }
    },
    {
        versionKey: false, // You should be aware of the outcome after set to false
    }
);

module.exports = mongoose.model("blockchainProjects", blockchainProjectsSchema);
