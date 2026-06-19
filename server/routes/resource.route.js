const express = require("express");
const {
  createResource,
  getAllResources,
  deleteResource,
} = require("../controllers/resource.controller");
const upload = require("../middlewares/upload"); // your updated smart upload middleware
const { isAuthenticated } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");

const resourceRouter = express.Router();

// Upload multiple files (admin only)
resourceRouter.post(
  "/upload",
  isAuthenticated,
  isAdmin,
  upload.array("files", 20),
  createResource
);

// Get all resources (any authenticated user)
resourceRouter.get("/", isAuthenticated, getAllResources);

// Delete resource (admin only)
resourceRouter.delete("/:id", isAuthenticated, isAdmin, deleteResource);

module.exports = { resourceRouter };
