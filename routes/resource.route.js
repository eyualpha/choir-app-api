const express = require("express");
const {
  createResource,
  getAllResources,
  deleteResource,
} = require("../controllers/resource.controller");
const upload = require("../middlewares/upload");
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../controllers/isAdmin.controller");
const resourceRouter = express.Router();

resourceRouter.post(
  "/upload",
  isAuthenticated,
  isAdmin,
  upload.array("files", 10),
  createResource
);

resourceRouter.get("/", isAuthenticated, getAllResources);

resourceRouter.delete("/:id", isAuthenticated, isAdmin, deleteResource);

module.exports = { resourceRouter };
