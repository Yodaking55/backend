const express = require("express");
const path = require("path");
var cookieParser = require("cookie-parser");
const i18n = require("./config/i18n");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.use("/public", express.static(__dirname + "/public"));
app.use(i18n);
app.use(cors());
// Use helmet for general security headers
app.use(helmet());

// Use cors to set allowed origin

app.use(cookieParser());
app.use(bodyParser.json({ limit: "150mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "150mb",
  })
);
let env;
var whitelist = [
  "https://ico.icb.network",
  "https://www.icb.network",
  "https://admin.icb.network",
];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
// app.use(cors(corsOptions));

env = require("./config/env.prod.json");

global.env = env;
//all routes
require("./routes/mainRoutes")(app);

module.exports = app;
