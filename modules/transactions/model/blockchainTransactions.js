const mongoose = require("mongoose");

let blockchainTransactionsSchema = mongoose.Schema(
    {
        total_trxn: { type: Number, default: 0 },
        lastBlockNumber: { type: Number, default: 0 },
        startBlockNumber: { type: Number, default: 0 },
        type: { type: String },
        missing: [{
            lastBlockNumber: { type: Number, default: 0 },
            startBlockNumber: { type: Number, default: 0 },
        }],
        dateCreated: { type: Date, default: Date.now },
        dateCreatedUtc: { type: Date, default: Date.now },
        dateModified: { type: Date },
        dateModifiedUtc: { type: Date }
    },
    {
        versionKey: false, // You should be aware of the outcome after set to false
    }
);

module.exports = mongoose.model("blockchainTransactions", blockchainTransactionsSchema);
