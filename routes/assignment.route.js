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

assignmentRouter.post("/", isAdmin, addUserToCategory);

assignmentRouter.get("/", getAssignments);

assignmentRouter.delete("/:id", isAdmin, removeUserFromCategory);
module.exports = { assignmentRouter };
