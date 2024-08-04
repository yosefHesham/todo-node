const tasksRouters = require("../routers/tasks");
const express = require("express");

module.exports = function (app) {
  app.use(express.json());
  // app.use("/tasks", tasksRouters);
};
