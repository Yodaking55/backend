//****Database connection mongodb using mongoose */

const mongoose = require("mongoose");
const mongoAtlasUri = global.env.DATABASE_URL;
mongoose.connect(mongoAtlasUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", function callback() {
  console.log("Db atlas Connected");
});
