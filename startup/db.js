const mongoose = require("mongoose");
require('dotenv').config();


module.exports = function () {
  mongoose.connect(process.env.MONGO_URL);
};
