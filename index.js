const app = require("express")();
const cors = require('cors')
app.use(cors());
require("./startup/routes")(app);
require("./startup/db")();

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("listening on ", port));
