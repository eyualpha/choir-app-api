const express = require("express");
const assignmentRouter = express.Router();

const { isAuthenticated } = require("../middlewares/auth");
const {
  getAssignments,
  removeUserFromCategory,
  addUserToCategory,
} = require("../controllers/assignment.controller");
const { isAdmin } = require("../controllers/isAdmin.controller");

assignmentRouter.use(isAuthenticated);

assignmentRouter.post("/", addUserToCategory);

assignmentRouter.get("/", getAssignments);

assignmentRouter.delete("/:id", removeUserFromCategory);

module.exports = { assignmentRouter };
