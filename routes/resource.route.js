const express = require("express");
const { createResource } = require("../controllers/resource.controller");
const upload = require("../middlewares/upload");
const { isAuthenticated } = require("../middlewares/auth");
const resourceRouter = express.Router();

resourceRouter.get("/", (req, res) => {
  res.send("Resource route is working");
});

resourceRouter.post(
  "/upload",
  isAuthenticated,
  upload.array("files", 10),
  createResource
);

resourceRouter.get("/:id", (req, res) => {
  res.send(`Get resource with ID: ${req.params.id}`);
});

module.exports = { resourceRouter };
