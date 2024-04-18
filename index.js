const app = require("./app");

//Db connection
require("./config/database");

app.listen(env.PORT, () => {
    console.log(`ICB ico listening at http://localhost:${env.PORT || "5004"}`);
});