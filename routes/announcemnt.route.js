const express = require("express");
const announcementRouter = express.Router();

const { isAuthenticated } = require("../middlewares/auth");
const {
  deleteAnnouncement,
  getAllAnnouncements,
  createAnnouncement,
} = require("../controllers/annoucement.controller");
const { isAdmin } = require("../controllers/isAdmin.controller");
const upload = require("../middlewares/upload");

announcementRouter.post(
  "/",
  isAuthenticated,
  isAdmin,
  upload.array("attachments", 5),
  createAnnouncement
);
announcementRouter.delete("/:id", isAuthenticated, isAdmin, deleteAnnouncement);

announcementRouter.get("/", isAuthenticated, getAllAnnouncements);

module.exports = announcementRouter;
