const mongoose = require("mongoose");
const mongoAtlasUri = "mongodb+srv://vishantsuffescom:ygq76XMajnA6WQ7S@cluster0.1y9wtcf.mongodb.net/icb-ico";
mongoose.connect(mongoAtlasUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", function callback() {
    // console.log("Db atlas Connected");
});

const WhitelistModel = require("./modules/whitelist/model/whitelistModel");
async function transactionMongo() {
    const session = await WhitelistModel.startSession();
    session.startTransaction();
    try {
        const opts = { session };
        await WhitelistModel.updateMany({ _id: { $in: ["654cb279a6077fd0b818d2be"] } }, { $set: { status: "inprogress" } }, opts);
        await WhitelistModel.updateMany({ _id: { $in: ["1", "2", "3"] } }, { $set: { status: "reject" } }, opts);
        await session.commitTransaction();  
        session.endSession();
        console.log("success done");
        return true;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error, "inside error");
        return true;
    }
}

transactionMongo();